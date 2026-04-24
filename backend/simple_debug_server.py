#!/usr/bin/env python3
"""
Simple debug admin server with built-in monitoring (no external dependencies)
"""

import cgi
import json
import sqlite3
import hashlib
import base64
import secrets
import hmac
import time
import os
import threading
from datetime import datetime, timezone, timedelta
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any, Dict, List
from urllib.parse import urlparse
from pathlib import Path

# Configuration
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "users.db"
LOG_PATH = DATA_DIR / "debug.log"
PORT = 8000
ALLOWED_ORIGIN = "http://localhost:3000"
SESSION_COOKIE_NAME = "admin_session"
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "change-me-now"
DEFAULT_ADMIN_NAME = "Website Administrator"
DEFAULT_SESSION_HOURS = 0.167  # 10 minutes (10/60 = 0.167 hours) for inactive admins

# Password hashing constants
PBKDF2_ITERATIONS = 240_000

# Global monitoring data
server_stats = {
    'start_time': datetime.now(timezone.utc),
    'total_requests': 0,
    'auth_attempts': 0,
    'successful_logins': 0,
    'failed_logins': 0,
    'active_sessions': 0,
    'last_request_time': None,
    'endpoints_accessed': {},
    'errors': []
}

def log_message(level: str, message: str):
    """Simple logging function"""
    timestamp = datetime.now(timezone.utc).isoformat()
    log_entry = f"[{timestamp}] {level}: {message}"
    print(log_entry)
    
    # Also write to log file
    try:
        with open(LOG_PATH, 'a') as f:
            f.write(log_entry + '\n')
    except Exception:
        pass

def hash_password(password: str, *, salt: str | None = None) -> str:
    """Hash password using PBKDF2-SHA256"""
    salt_value = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_value.encode("utf-8"),
        PBKDF2_ITERATIONS,
    )
    encoded = base64.urlsafe_b64encode(digest).decode("ascii")
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt_value}${encoded}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored hash"""
    try:
        algorithm, iterations, salt, encoded = stored_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        int(iterations),
    )
    candidate = base64.urlsafe_b64encode(digest).decode("ascii")
    return hmac.compare_digest(candidate, encoded)

def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(48)

def get_system_info() -> Dict[str, Any]:
    """Get basic system information without external dependencies"""
    try:
        # Basic system info
        info = {
            'platform': os.name,
            'python_version': os.sys.version.split()[0],
            'working_directory': os.getcwd(),
            'process_id': os.getpid(),
            'thread_count': threading.active_count(),
        }
        
        # File system info
        statvfs = os.statvfs('/')
        info['disk_total'] = statvfs.f_frsize * statvfs.f_blocks
        info['disk_free'] = statvfs.f_frsize * statvfs.f_bavail
        info['disk_usage_percent'] = ((info['disk_total'] - info['disk_free']) / info['disk_total']) * 100
        
        return info
    except Exception as e:
        return {'error': str(e)}

class UserDatabase:
    """Enhanced database interface with logging"""
    
    def __init__(self):
        self._init_database()
        self._ensure_admin_user()
        log_message("INFO", "Database initialized successfully")
    
    def _init_database(self):
        """Initialize database tables"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token TEXT UNIQUE NOT NULL,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP NOT NULL,
                    is_active BOOLEAN DEFAULT 1,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    metadata TEXT,
                    ip_address TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS debug_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    level TEXT NOT NULL,
                    message TEXT NOT NULL,
                    endpoint TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    
    def _ensure_admin_user(self):
        """Create default admin user if not exists"""
        with sqlite3.connect(DB_PATH) as conn:
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ?", 
                (DEFAULT_ADMIN_USERNAME,)
            ).fetchone()
            
            if not existing:
                password_hash = hash_password(DEFAULT_ADMIN_PASSWORD)
                conn.execute("""
                    INSERT INTO users (username, password_hash, display_name, role)
                    VALUES (?, ?, ?, ?)
                """, (DEFAULT_ADMIN_USERNAME, password_hash, DEFAULT_ADMIN_NAME, "super_admin"))
                conn.commit()
                log_message("INFO", f"Created admin user: {DEFAULT_ADMIN_USERNAME}")
    
    def verify_user_credentials(self, username: str, password: str) -> dict | None:
        """Verify user credentials with logging"""
        server_stats['auth_attempts'] += 1
        
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1", 
                (username,)
            ).fetchone()
            
            if not user or not verify_password(password, user["password_hash"]):
                server_stats['failed_logins'] += 1
                log_message("WARNING", f"Failed login attempt for username: {username}")
                return None
            
            # Update last login
            conn.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                (user["id"],)
            )
            
            # Log successful login
            conn.execute("""
                INSERT INTO audit_log (user_id, action, actor, summary)
                VALUES (?, ?, ?, ?)
            """, (user["id"], "auth.login", username, "User login successful"))
            
            conn.commit()
            server_stats['successful_logins'] += 1
            log_message("INFO", f"Successful login for user: {username}")
            return dict(user)
    
    def create_session(self, user_id: int, token: str, ip_address: str = None, 
                      user_agent: str = None) -> bool:
        """Create user session with logging"""
        with sqlite3.connect(DB_PATH) as conn:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=DEFAULT_SESSION_HOURS)
            try:
                conn.execute("""
                    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, token, ip_address, user_agent, expires_at.isoformat()))
                conn.commit()
                server_stats['active_sessions'] += 1
                log_message("INFO", f"Created session for user_id: {user_id}")
                return True
            except sqlite3.IntegrityError:
                log_message("ERROR", f"Failed to create session - duplicate token for user_id: {user_id}")
                return False
    
    def get_session(self, token: str) -> dict | None:
        """Get session by token"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            
            session = conn.execute("""
                SELECT s.*, u.username, u.display_name, u.role
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')
            """, (token,)).fetchone()
            
            return dict(session) if session else None
    
    def destroy_session(self, token: str) -> bool:
        """Destroy session with logging"""
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute(
                "UPDATE user_sessions SET is_active = 0 WHERE token = ?", 
                (token,)
            )
            conn.commit()
            if cursor.rowcount > 0:
                server_stats['active_sessions'] -= 1
                log_message("INFO", "Session destroyed")
            return cursor.rowcount > 0
    
    def list_audit_events(self, limit: int = 40) -> list:
        """List audit events"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            events = conn.execute("""
                SELECT a.*, u.username
                FROM audit_log a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC LIMIT ?
            """, (limit,)).fetchall()
            return [dict(event) for event in events]
    
    def add_debug_log(self, level: str, message: str, endpoint: str = None, 
                     ip_address: str = None, user_agent: str = None):
        """Add debug log entry"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("""
                INSERT INTO debug_logs (level, message, endpoint, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            """, (level, message, endpoint, ip_address, user_agent))
            conn.commit()

# Initialize database
db = UserDatabase()

class DebugRequestHandler(BaseHTTPRequestHandler):
    """Enhanced HTTP request handler with debugging and monitoring"""
    
    server_version = "StephenAdmin/1.0-Debug"
    
    def __init__(self, *args, **kwargs):
        self.request_start_time = time.time()
        super().__init__(*args, **kwargs)
    
    def log_message(self, format: str, *args):
        """Override log_message for better debugging"""
        log_message("INFO", f"{self.address_string()} - {format % args}")
    
    def end_headers(self):
        self._write_cors_headers()
        super().end_headers()
    
    def _write_cors_headers(self):
        origin = self.headers.get("Origin")
        if origin == ALLOWED_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
    
    def _json_response(self, status: int, payload: dict):
        """Send JSON response with debugging"""
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
        
        # Log response
        request_time = time.time() - self.request_start_time
        log_message("INFO", f"Response: {status} - {request_time:.3f}s - {len(body)} bytes")
    
    def _read_json_body(self) -> dict:
        """Read JSON request body with debugging"""
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        
        try:
            body = json.loads(raw.decode("utf-8"))
            log_message("DEBUG", f"Request body: {json.dumps(body, indent=2)}")
            return body
        except json.JSONDecodeError as e:
            log_message("ERROR", f"JSON decode error: {e}")
            raise
    
    def _get_session_token(self) -> str | None:
        """Get session token from cookie"""
        cookie_header = self.headers.get("Cookie")
        if not cookie_header:
            return None
        cookies = SimpleCookie()
        cookies.load(cookie_header)
        cookie = cookies.get(SESSION_COOKIE_NAME)
        return cookie.value if cookie else None
    
    def _get_current_user(self) -> dict | None:
        """Get current authenticated user"""
        token = self._get_session_token()
        if not token:
            return None
        session = db.get_session(token)
        if not session:
            return None
        return {
            "username": session["username"],
            "displayName": session["display_name"],
            "role": session["role"],
            "session": session,
        }
    
    def _require_user(self) -> dict | None:
        """Require authentication"""
        user = self._get_current_user()
        if not user:
            self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Authentication required"})
            return None
        return user
    
    def _set_session_cookie(self, token: str, *, max_age: int):
        """Set session cookie"""
        cookie = SimpleCookie()
        cookie[SESSION_COOKIE_NAME] = token
        cookie[SESSION_COOKIE_NAME]["path"] = "/"
        cookie[SESSION_COOKIE_NAME]["httponly"] = True
        cookie[SESSION_COOKIE_NAME]["samesite"] = "Lax"
        cookie[SESSION_COOKIE_NAME]["max-age"] = str(max_age)
        self.send_header("Set-Cookie", cookie.output(header="").strip())
    
    def _update_stats(self, endpoint: str):
        """Update server statistics"""
        server_stats['total_requests'] += 1
        server_stats['last_request_time'] = datetime.now(timezone.utc)
        
        if endpoint not in server_stats['endpoints_accessed']:
            server_stats['endpoints_accessed'][endpoint] = 0
        server_stats['endpoints_accessed'][endpoint] += 1
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests"""
        self._update_stats("OPTIONS")
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests with debugging"""
        path = urlparse(self.path).path
        self._update_stats(path)
        
        log_message("INFO", f"GET request: {path} from {self.client_address[0]}")
        
        if path == "/api/health":
            self._json_response(HTTPStatus.OK, {
                "status": "ok",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "server": "debug-mode",
                "uptime": str(datetime.now(timezone.utc) - server_stats['start_time'])
            })
            return
        
        if path == "/api/debug/stats":
            # Debug endpoint for server statistics
            self._json_response(HTTPStatus.OK, {
                "server_stats": {
                    **server_stats,
                    "start_time": server_stats['start_time'].isoformat(),
                    "last_request_time": server_stats['last_request_time'].isoformat() if server_stats['last_request_time'] else None,
                    "uptime_seconds": (datetime.now(timezone.utc) - server_stats['start_time']).total_seconds(),
                },
                "system_info": get_system_info(),
                "database_info": {
                    "db_path": str(DB_PATH),
                    "db_size": DB_PATH.stat().st_size if DB_PATH.exists() else 0,
                }
            })
            return
        
        if path == "/api/auth/me":
            user = self._get_current_user()
            if not user:
                self._json_response(HTTPStatus.OK, {"authenticated": False})
                return
            self._json_response(HTTPStatus.OK, {
                "authenticated": True,
                "user": {
                    "username": user["username"],
                    "displayName": user["displayName"],
                    "role": user["role"],
                    "mfaConfigured": False,
                },
            })
            return
        
        user = self._require_user()
        if not user:
            return
        
        if path == "/api/audit":
            events = db.list_audit_events(40)
            self._json_response(HTTPStatus.OK, {"events": events})
            return
        
        if path == "/api/debug/logs":
            # Debug endpoint for recent logs
            with sqlite3.connect(DB_PATH) as conn:
                conn.row_factory = sqlite3.Row
                logs = conn.execute("""
                    SELECT * FROM debug_logs 
                    ORDER BY created_at DESC LIMIT 50
                """).fetchall()
                self._json_response(HTTPStatus.OK, {"logs": [dict(log) for log in logs]})
            return
        
        log_message("WARNING", f"Route not found: {path}")
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})
    
    def do_POST(self):
        """Handle POST requests with debugging"""
        path = urlparse(self.path).path
        self._update_stats(path)
        
        log_message("INFO", f"POST request: {path} from {self.client_address[0]}")
        
        if path == "/api/auth/login":
            try:
                payload = self._read_json_body()
            except json.JSONDecodeError:
                self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
                return
            
            username = str(payload.get("username", "")).strip()
            password = str(payload.get("password", ""))
            
            log_message("INFO", f"Login attempt for username: {username}")
            
            user = db.verify_user_credentials(username, password)
            if not user:
                self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid username or password"})
                return
            
            session_token = generate_session_token()
            session_created = db.create_session(
                user_id=user["id"],
                token=session_token,
                ip_address=self.client_address[0],
                user_agent=self.headers.get("User-Agent", "unknown"),
            )
            
            if not session_created:
                self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to create session"})
                return
            
            self.send_response(HTTPStatus.OK)
            self._set_session_cookie(session_token, max_age=DEFAULT_SESSION_HOURS * 60 * 60)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            body = json.dumps({
                "authenticated": True,
                "user": {
                    "username": user["username"],
                    "displayName": user["display_name"],
                    "role": user["role"],
                    "mfaConfigured": False,
                },
            }).encode("utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        
        user = self._require_user()
        if not user:
            return
        
        if path == "/api/auth/logout":
            token = self._get_session_token()
            if token:
                db.destroy_session(token)
            
            # Log logout
            with sqlite3.connect(DB_PATH) as conn:
                conn.execute("""
                    INSERT INTO audit_log (user_id, action, actor, summary)
                    VALUES (?, ?, ?, ?)
                """, (user["session"]["user_id"], "auth.logout", user["username"], "Admin logout completed"))
                conn.commit()
            
            self.send_response(HTTPStatus.OK)
            self._set_session_cookie("", max_age=0)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            body = b'{"authenticated": false}'
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        
        log_message("WARNING", f"Route not found: {path}")
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

def main():
    """Start the enhanced debug server"""
    print("🚀 Starting Enhanced Admin Backend Server")
    print("=" * 50)
    print(f"🌐 Server URL: http://localhost:{PORT}")
    print(f"🔧 Debug Mode: ENABLED")
    print(f"📊 Health Check: http://localhost:{PORT}/api/health")
    print(f"📈 Debug Stats: http://localhost:{PORT}/api/debug/stats")
    print(f"📝 Debug Logs: http://localhost:{PORT}/api/debug/logs")
    print(f"🔐 Admin Login: {DEFAULT_ADMIN_USERNAME} / {DEFAULT_ADMIN_PASSWORD}")
    print(f"🗄️  Database: {DB_PATH}")
    print(f"📋 Log File: {LOG_PATH}")
    print("=" * 50)
    
    log_message("INFO", "Enhanced admin server starting...")
    
    try:
        server = ThreadingHTTPServer(("0.0.0.0", PORT), DebugRequestHandler)
        log_message("INFO", f"Server listening on http://localhost:{PORT}")
        server.serve_forever()
    except KeyboardInterrupt:
        log_message("INFO", "Server shutting down...")
        server.shutdown()
    except Exception as e:
        log_message("ERROR", f"Server error: {e}")
        raise

if __name__ == "__main__":
    main()
