#!/usr/bin/env python3
"""
Simple standalone admin server with database authentication and encrypted passwords
"""

import cgi
import json
import sqlite3
import hashlib
import base64
import secrets
import hmac
import time
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Configuration
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DATA_DIR / "users.db"
PORT = 8000
ALLOWED_ORIGIN = "http://localhost:3000"
SESSION_COOKIE_NAME = "admin_session"
DEFAULT_ADMIN_USERNAME = "admin"
DEFAULT_ADMIN_PASSWORD = "change-me-now"
DEFAULT_ADMIN_NAME = "Website Administrator"
DEFAULT_SESSION_HOURS = 8

# Password hashing constants
PBKDF2_ITERATIONS = 240_000

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

class UserDatabase:
    """Simple database interface for user management"""
    
    def __init__(self):
        self._init_database()
        self._ensure_admin_user()
    
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
                print(f"✅ Created admin user: {DEFAULT_ADMIN_USERNAME}")
    
    def verify_user_credentials(self, username: str, password: str) -> dict | None:
        """Verify user credentials"""
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1", 
                (username,)
            ).fetchone()
            
            if not user or not verify_password(password, user["password_hash"]):
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
            return dict(user)
    
    def create_session(self, user_id: int, token: str, ip_address: str = None, 
                      user_agent: str = None) -> bool:
        """Create user session"""
        with sqlite3.connect(DB_PATH) as conn:
            expires_at = datetime.now(timezone.utc) + timedelta(hours=DEFAULT_SESSION_HOURS)
            try:
                conn.execute("""
                    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, token, ip_address, user_agent, expires_at.isoformat()))
                conn.commit()
                return True
            except sqlite3.IntegrityError:
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
        """Destroy session"""
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.execute(
                "UPDATE user_sessions SET is_active = 0 WHERE token = ?", 
                (token,)
            )
            conn.commit()
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

# Initialize database
db = UserDatabase()

class AdminRequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for admin API"""
    
    server_version = "StephenAdmin/1.0"
    
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
        """Send JSON response"""
        body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    
    def _read_json_body(self) -> dict:
        """Read JSON request body"""
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        return json.loads(raw.decode("utf-8"))
    
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
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests"""
        self.send_response(HTTPStatus.NO_CONTENT)
        self.end_headers()
    
    def do_GET(self):
        """Handle GET requests"""
        path = urlparse(self.path).path
        
        if path == "/api/health":
            self._json_response(HTTPStatus.OK, {"status": "ok"})
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
        
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})
    
    def do_POST(self):
        """Handle POST requests"""
        path = urlparse(self.path).path
        
        if path == "/api/auth/login":
            try:
                payload = self._read_json_body()
            except json.JSONDecodeError:
                self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
                return
            
            username = str(payload.get("username", "")).strip()
            password = str(payload.get("password", ""))
            
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
        
        self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

def main():
    """Start the server"""
    print(f"🚀 Admin API listening on http://localhost:{PORT}")
    print(f"🔧 Allowed frontend origin: {ALLOWED_ORIGIN}")
    print(f"👤 Default admin: {DEFAULT_ADMIN_USERNAME} / {DEFAULT_ADMIN_PASSWORD}")
    print(f"🗄️  Database: {DB_PATH}")
    
    server = ThreadingHTTPServer(("0.0.0.0", PORT), AdminRequestHandler)
    server.serve_forever()

if __name__ == "__main__":
    main()
