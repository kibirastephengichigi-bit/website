from __future__ import annotations

import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
DATA_DIR = BACKEND_DIR / "data"

SITE_CONTENT_FILE = REPO_ROOT / "lib" / "content" / "site-content.json"
BLOG_DATA_FILE = REPO_ROOT / "lib" / "content" / "blog-data.json"
MEDIA_LIBRARY_FILE = DATA_DIR / "media-library.json"
AUDIT_LOG_FILE = DATA_DIR / "audit-log.json"
ADMIN_USERS_FILE = DATA_DIR / "admin-users.json"
SESSIONS_FILE = DATA_DIR / "sessions.json"

PUBLIC_DIR = REPO_ROOT / "public"
UPLOADS_DIR = PUBLIC_DIR / "uploads" / "admin"

DEFAULT_ALLOWED_ORIGIN = os.environ.get("ADMIN_ALLOWED_ORIGIN", "http://localhost:3000")
DEFAULT_SESSION_HOURS = int(os.environ.get("ADMIN_SESSION_HOURS", "8"))
DEFAULT_ADMIN_USERNAME = os.environ.get("ADMIN_USERNAME", "admin")
DEFAULT_ADMIN_NAME = os.environ.get("ADMIN_DISPLAY_NAME", "Website Administrator")
DEFAULT_ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "change-me-now")
DEFAULT_ADMIN_TOTP_SECRET = os.environ.get("ADMIN_TOTP_SECRET", "").strip()
PORT = int(os.environ.get("ADMIN_API_PORT", "8000"))

