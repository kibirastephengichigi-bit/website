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
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    type TEXT NOT NULL DEFAULT 'page',
                    status TEXT NOT NULL DEFAULT 'draft',
                    category TEXT,
                    tags TEXT,
                    seo_title TEXT,
                    seo_description TEXT,
                    author_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    published_at TIMESTAMP,
                    metadata TEXT,
                    FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS media (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    filename TEXT NOT NULL,
                    original_filename TEXT NOT NULL,
                    type TEXT NOT NULL,
                    size INTEGER NOT NULL,
                    url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    uploaded_by INTEGER,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    tags TEXT,
                    metadata TEXT,
                    FOREIGN KEY (uploaded_by) REFERENCES users (id) ON DELETE SET NULL
                )
            """)
            
            conn.execute("""
                CREATE TABLE IF NOT EXISTS home_page_content (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    section TEXT NOT NULL,
                    field TEXT NOT NULL,
                    value TEXT,
                    updated_by INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL,
                    UNIQUE(section, field)
                )
            """)
            
            # Create indexes for better performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(token)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_log(user_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_log(created_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_type ON content(type)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_status ON content(status)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_author ON content(author_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_content_created ON content(created_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_type ON media(type)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_media_uploaded ON media(uploaded_at)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_section ON home_page_content(section)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_updated_by ON home_page_content(updated_by)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_home_page_updated_at ON home_page_content(updated_at)")
            
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
    
    def create_content(self, title: str, content: str, content_type: str = 'page', 
                      status: str = 'draft', category: str | None = None, 
                      tags: List[str] | None = None, seo_title: str | None = None,
                      seo_description: str | None = None, author_id: int | None = None,
                      metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """Create new content"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                INSERT INTO content (title, content, type, status, category, tags, 
                                   seo_title, seo_description, author_id, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (title, content, content_type, status, category, 
                  json.dumps(tags) if tags else None, seo_title, seo_description, 
                  author_id, json.dumps(metadata) if metadata else None))
            
            content_id = cursor.lastrowid
            conn.commit()
            
            # Return created content
            content_data = self.get_content_by_id(content_id)
            if content_data:
                self.append_audit_event(
                    action="content.created",
                    actor=f"user_{author_id}",
                    summary=f"Content '{title}' created",
                    user_id=author_id
                )
            
            return content_data or {}
    
    def get_content_by_id(self, content_id: int) -> Optional[Dict[str, Any]]:
        """Get content by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            content = conn.execute("""
                SELECT c.*, u.username as author_name, u.display_name as author_display_name
                FROM content c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            """, (content_id,)).fetchone()
            
            if content:
                content_dict = dict(content)
                # Parse JSON fields
                if content_dict.get('tags'):
                    content_dict['tags'] = json.loads(content_dict['tags'])
                if content_dict.get('metadata'):
                    content_dict['metadata'] = json.loads(content_dict['metadata'])
                return content_dict
            
            return None
    
    def list_content(self, content_type: str | None = None, status: str | None = None,
                    limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """List content with optional filters"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT c.*, u.username as author_name, u.display_name as author_display_name
                FROM content c
                LEFT JOIN users u ON c.author_id = u.id
            """
            params = []
            conditions = []
            
            if content_type:
                conditions.append("c.type = ?")
                params.append(content_type)
            
            if status:
                conditions.append("c.status = ?")
                params.append(status)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY c.updated_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            contents = conn.execute(query, params).fetchall()
            
            result = []
            for content in contents:
                content_dict = dict(content)
                # Parse JSON fields
                if content_dict.get('tags'):
                    content_dict['tags'] = json.loads(content_dict['tags'])
                if content_dict.get('metadata'):
                    content_dict['metadata'] = json.loads(content_dict['metadata'])
                result.append(content_dict)
            
            return result
    
    def update_content(self, content_id: int, **kwargs) -> bool:
        """Update content"""
        with sqlite3.connect(self.db_path) as conn:
            # Build update query dynamically
            update_fields = []
            params = []
            
            allowed_fields = ['title', 'content', 'type', 'status', 'category', 'tags', 
                            'seo_title', 'seo_description', 'metadata']
            
            for field, value in kwargs.items():
                if field in allowed_fields:
                    if field in ['tags', 'metadata'] and value:
                        value = json.dumps(value)
                    update_fields.append(f"{field} = ?")
                    params.append(value)
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(content_id)
            
            query = f"UPDATE content SET {', '.join(update_fields)} WHERE id = ?"
            cursor = conn.execute(query, params)
            conn.commit()
            
            if cursor.rowcount > 0:
                # Get content for audit log
                content = self.get_content_by_id(content_id)
                if content:
                    self.append_audit_event(
                        action="content.updated",
                        actor=f"user_{content.get('author_id')}",
                        summary=f"Content '{content.get('title')}' updated",
                        user_id=content.get('author_id')
                    )
                return True
            
            return False
    
    def delete_content(self, content_id: int) -> bool:
        """Delete content"""
        with sqlite3.connect(self.db_path) as conn:
            # Get content for audit log
            content = self.get_content_by_id(content_id)
            
            cursor = conn.execute("DELETE FROM content WHERE id = ?", (content_id,))
            conn.commit()
            
            if cursor.rowcount > 0 and content:
                self.append_audit_event(
                    action="content.deleted",
                    actor=f"user_{content.get('author_id')}",
                    summary=f"Content '{content.get('title')}' deleted",
                    user_id=content.get('author_id')
                )
                return True
            
            return False
    
    def create_media(self, filename: str, original_filename: str, media_type: str,
                    size: int, url: str, thumbnail_url: str | None = None,
                    uploaded_by: int | None = None, tags: List[str] | None = None,
                    metadata: Dict[str, Any] | None = None) -> Dict[str, Any]:
        """Create new media record"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("""
                INSERT INTO media (filename, original_filename, type, size, url, 
                                 thumbnail_url, uploaded_by, tags, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (filename, original_filename, media_type, size, url, thumbnail_url,
                  uploaded_by, json.dumps(tags) if tags else None,
                  json.dumps(metadata) if metadata else None))
            
            media_id = cursor.lastrowid
            conn.commit()
            
            # Return created media
            media_data = self.get_media_by_id(media_id)
            if media_data:
                self.append_audit_event(
                    action="media.uploaded",
                    actor=f"user_{uploaded_by}",
                    summary=f"Media '{original_filename}' uploaded",
                    user_id=uploaded_by
                )
            
            return media_data or {}
    
    def get_media_by_id(self, media_id: int) -> Optional[Dict[str, Any]]:
        """Get media by ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            media = conn.execute("""
                SELECT m.*, u.username as uploaded_by_name, u.display_name as uploaded_by_display_name
                FROM media m
                LEFT JOIN users u ON m.uploaded_by = u.id
                WHERE m.id = ?
            """, (media_id,)).fetchone()
            
            if media:
                media_dict = dict(media)
                # Parse JSON fields
                if media_dict.get('tags'):
                    media_dict['tags'] = json.loads(media_dict['tags'])
                if media_dict.get('metadata'):
                    media_dict['metadata'] = json.loads(media_dict['metadata'])
                return media_dict
            
            return None
    
    def list_media(self, media_type: str | None = None, limit: int = 50, 
                  offset: int = 0) -> List[Dict[str, Any]]:
        """List media with optional filters"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = """
                SELECT m.*, u.username as uploaded_by_name, u.display_name as uploaded_by_display_name
                FROM media m
                LEFT JOIN users u ON m.uploaded_by = u.id
            """
            params = []
            
            if media_type:
                query += " WHERE m.type = ?"
                params.append(media_type)
            
            query += " ORDER BY m.uploaded_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            media_items = conn.execute(query, params).fetchall()
            
            result = []
            for media in media_items:
                media_dict = dict(media)
                # Parse JSON fields
                if media_dict.get('tags'):
                    media_dict['tags'] = json.loads(media_dict['tags'])
                if media_dict.get('metadata'):
                    media_dict['metadata'] = json.loads(media_dict['metadata'])
                result.append(media_dict)
            
            return result
    
    def delete_media(self, media_id: int) -> bool:
        """Delete media"""
        with sqlite3.connect(self.db_path) as conn:
            # Get media for audit log
            media = self.get_media_by_id(media_id)
            
            cursor = conn.execute("DELETE FROM media WHERE id = ?", (media_id,))
            conn.commit()
            
            if cursor.rowcount > 0 and media:
                self.append_audit_event(
                    action="media.deleted",
                    actor=f"user_{media.get('uploaded_by')}",
                    summary=f"Media '{media.get('original_filename')}' deleted",
                    user_id=media.get('uploaded_by')
                )
                return True
            
            return False
    
    def update_home_page_content(self, section: str, field: str, value: str, 
                                updated_by: int | None = None) -> bool:
        """Update home page content"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("""
                INSERT OR REPLACE INTO home_page_content (section, field, value, updated_by, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            """, (section, field, value, updated_by))
            conn.commit()
            
            if cursor.rowcount > 0:
                # Log the update
                self.append_audit_event(
                    action="home_page.updated",
                    actor=f"user_{updated_by}",
                    summary=f"Home page content updated: {section}.{field}",
                    user_id=updated_by
                )
                return True
            
            return False
    
    def get_home_page_content(self, section: str | None = None) -> Dict[str, Any]:
        """Get home page content, optionally filtered by section"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            
            query = "SELECT * FROM home_page_content"
            params = []
            
            if section:
                query += " WHERE section = ?"
                params.append(section)
            
            query += " ORDER BY section, field"
            
            rows = conn.execute(query, params).fetchall()
            
            # Organize results by section and field
            result = {}
            for row in rows:
                section_name = row['section']
                field_name = row['field']
                value = row['value']
                
                if section_name not in result:
                    result[section_name] = {}
                
                result[section_name][field_name] = value
            
            return result
    
    def get_home_page_field(self, section: str, field: str) -> Optional[str]:
        """Get a specific home page content field"""
        with sqlite3.connect(self.db_path) as conn:
            row = conn.execute("""
                SELECT value FROM home_page_content 
                WHERE section = ? AND field = ?
            """, (section, field)).fetchone()
            
            return row[0] if row else None
    
    def delete_home_page_content(self, section: str, field: str | None = None) -> bool:
        """Delete home page content, optionally by field"""
        with sqlite3.connect(self.db_path) as conn:
            if field:
                cursor = conn.execute("""
                    DELETE FROM home_page_content 
                    WHERE section = ? AND field = ?
                """, (section, field))
            else:
                cursor = conn.execute("""
                    DELETE FROM home_page_content 
                    WHERE section = ?
                """, (section,))
            
            conn.commit()
            return cursor.rowcount > 0


# Global database instance
db = UserDatabase()
