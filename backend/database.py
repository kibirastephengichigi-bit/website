from __future__ import annotations

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import config
from security import hash_password, verify_password


class UserDatabase:
    def __init__(self, db_path: Path | None = None):
        self.db_path = db_path or config.DATA_DIR / "users.db"
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_database()
    
    def _init_database(self) -> None:
        """Initialize the database with required tables"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE,
                    password_hash TEXT NOT NULL,
                    display_name TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'user',
                    is_active BOOLEAN DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    mfa_enabled BOOLEAN DEFAULT 0,
                    mfa_secret TEXT
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
            
            # Create indexes for better performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at)")
            
            conn.commit()
    
    def create_user(self, username: str, password: str, email: str | None = None, 
                   display_name: str | None = None, role: str = "user") -> Dict[str, Any]:
        """Create a new user with encrypted password"""
        with sqlite3.connect(self.db_path) as conn:
            # Check if user already exists
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ? OR email = ?", 
                (username, email)
            ).fetchone()
            
            if existing:
                raise ValueError("User with this username or email already exists")
            
            # Hash the password
            password_hash = hash_password(password)
            
            # Insert new user
            cursor = conn.execute("""
                INSERT INTO users (username, email, password_hash, display_name, role)
                VALUES (?, ?, ?, ?, ?)
            """, (username, email, password_hash, display_name or username, role))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            # Return user data
            user_data = self.get_user_by_id(user_id)
            if user_data:
                self.append_audit_event(
                    action="user.created",
                    actor=username,
                    summary=f"User account created for {username}",
                    user_id=user_id
                )
            
            return user_data or {}
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE username = ? AND is_active = 1", 
                (username,)
            ).fetchone()
            
            return dict(user) if user else None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            user = conn.execute(
                "SELECT * FROM users WHERE id = ? AND is_active = 1", 
                (user_id,)
            ).fetchone()
            
            return dict(user) if user else None
    
    def verify_user_credentials(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Verify user credentials and update last login"""
        user = self.get_user_by_username(username)
        if not user:
            return None
        
        if not verify_password(password, user["password_hash"]):
            return None
        
        # Update last login
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
                (user["id"],)
            )
            conn.commit()
        
        # Log successful login
        self.append_audit_event(
            action="auth.login",
            actor=username,
            summary="User login successful",
            user_id=user["id"]
        )
        
        return user
    
    def create_session(self, user_id: int, token: str, ip_address: str | None = None, 
                      user_agent: str | None = None, expires_hours: int = 8) -> bool:
        """Create a new user session"""
        with sqlite3.connect(self.db_path) as conn:
            # Calculate expiration time
            from datetime import timedelta
            expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
            
            try:
                conn.execute("""
                    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (user_id, token, ip_address, user_agent, expires_at.isoformat()))
                conn.commit()
                return True
            except sqlite3.IntegrityError:
                # Token already exists
                return False
    
    def get_session(self, token: str) -> Optional[Dict[str, Any]]:
        """Get session by token"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            # Check if session exists and is not expired
            session = conn.execute("""
                SELECT s.*, u.username, u.display_name, u.role, u.mfa_enabled
                FROM user_sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')
            """, (token,)).fetchone()
            
            if session:
                session_dict = dict(session)
                # Convert expires_at to string if it's not already
                if isinstance(session_dict.get('expires_at'), str):
                    pass  # Already a string
                return session_dict
            
            return None
    
    def destroy_session(self, token: str) -> bool:
        """Destroy a session"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute(
                "UPDATE user_sessions SET is_active = 0 WHERE token = ?", 
                (token,)
            )
            conn.commit()
            return cursor.rowcount > 0
    
    def append_audit_event(self, action: str, actor: str, summary: str, 
                          metadata: Dict[str, Any] | None = None, 
                          user_id: int | None = None, ip_address: str | None = None) -> None:
        """Add an audit event"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO audit_log (user_id, action, actor, summary, metadata, ip_address)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, action, actor, summary, json.dumps(metadata) if metadata else None, ip_address))
            conn.commit()
    
    def list_audit_events(self, limit: int = 40, user_id: int | None = None) -> List[Dict[str, Any]]:
        """List audit events"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT a.*, u.username, u.display_name
                FROM audit_log a
                LEFT JOIN users u ON a.user_id = u.id
            """
            params = []
            
            if user_id:
                query += " WHERE a.user_id = ?"
                params.append(user_id)
            
            query += " ORDER BY a.created_at DESC LIMIT ?"
            params.append(limit)
            
            events = conn.execute(query, params).fetchall()
            return [dict(event) for event in events]
    
    def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions and return count of cleaned up sessions"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                UPDATE user_sessions 
                SET is_active = 0 
                WHERE is_active = 1 AND expires_at <= datetime('now')
            """)
            conn.commit()
            return cursor.rowcount


# Global database instance
db = UserDatabase()
