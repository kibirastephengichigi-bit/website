from __future__ import annotations

import json
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from uuid import uuid4

from . import config
from .security import generate_session_token, hash_password


def utc_now() -> datetime:
  return datetime.now(timezone.utc)


def iso_now() -> str:
  return utc_now().isoformat()


def load_json(path: Path, default: Any) -> Any:
  if not path.exists():
    return deepcopy(default)
  with path.open("r", encoding="utf-8") as handle:
    return json.load(handle)


def save_json(path: Path, data: Any) -> None:
  path.parent.mkdir(parents=True, exist_ok=True)
  with path.open("w", encoding="utf-8") as handle:
    json.dump(data, handle, indent=2, ensure_ascii=True)
    handle.write("\n")


def ensure_storage() -> None:
  config.DATA_DIR.mkdir(parents=True, exist_ok=True)
  config.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

  if not config.ADMIN_USERS_FILE.exists():
    users = [
      {
        "username": config.DEFAULT_ADMIN_USERNAME,
        "displayName": config.DEFAULT_ADMIN_NAME,
        "role": "super_admin",
        "passwordHash": hash_password(config.DEFAULT_ADMIN_PASSWORD),
        "createdAt": iso_now(),
      }
    ]
    save_json(config.ADMIN_USERS_FILE, users)

  for path, default in (
    (config.SESSIONS_FILE, []),
    (config.AUDIT_LOG_FILE, []),
    (config.MEDIA_LIBRARY_FILE, []),
  ):
    if not path.exists():
      save_json(path, default)


def get_admin_user(username: str) -> dict[str, Any] | None:
  users = load_json(config.ADMIN_USERS_FILE, [])
  for user in users:
    if user.get("username") == username:
      return user
  return None


def _load_sessions() -> list[dict[str, Any]]:
  return load_json(config.SESSIONS_FILE, [])


def _save_sessions(sessions: list[dict[str, Any]]) -> None:
  save_json(config.SESSIONS_FILE, sessions)


def create_session(*, username: str, ip_address: str, user_agent: str) -> dict[str, Any]:
  sessions = _load_sessions()
  token = generate_session_token()
  expires_at = utc_now() + timedelta(hours=config.DEFAULT_SESSION_HOURS)
  record = {
    "token": token,
    "username": username,
    "ipAddress": ip_address,
    "userAgent": user_agent,
    "createdAt": iso_now(),
    "expiresAt": expires_at.isoformat(),
  }
  sessions.append(record)
  _save_sessions(sessions)
  return record


def get_session(token: str) -> dict[str, Any] | None:
  sessions = _load_sessions()
  now = utc_now()
  active: list[dict[str, Any]] = []
  current: dict[str, Any] | None = None

  for session in sessions:
    try:
      expires_at = datetime.fromisoformat(session["expiresAt"])
    except (KeyError, ValueError):
      continue

    if expires_at <= now:
      continue

    active.append(session)
    if session.get("token") == token:
      current = session

  if len(active) != len(sessions):
    _save_sessions(active)

  return current


def destroy_session(token: str) -> None:
  sessions = [session for session in _load_sessions() if session.get("token") != token]
  _save_sessions(sessions)


def append_audit_event(*, action: str, actor: str, summary: str, metadata: dict[str, Any] | None = None) -> dict[str, Any]:
  events = load_json(config.AUDIT_LOG_FILE, [])
  event = {
    "id": str(uuid4()),
    "action": action,
    "actor": actor,
    "summary": summary,
    "metadata": metadata or {},
    "createdAt": iso_now(),
  }
  events.insert(0, event)
  save_json(config.AUDIT_LOG_FILE, events[:200])
  return event


def list_audit_events(limit: int = 25) -> list[dict[str, Any]]:
  return load_json(config.AUDIT_LOG_FILE, [])[:limit]


def read_site_content() -> dict[str, Any]:
  return load_json(config.SITE_CONTENT_FILE, {})


def write_site_content(content: dict[str, Any], *, actor: str) -> None:
  save_json(config.SITE_CONTENT_FILE, content)
  append_audit_event(
    action="content.updated",
    actor=actor,
    summary="Updated editable site content",
    metadata={"areas": sorted(content.keys())},
  )


def read_blog_data() -> dict[str, Any]:
  return load_json(config.BLOG_DATA_FILE, {"blogPosts": [], "blogContentBySlug": {}})


def write_blog_data(content: dict[str, Any], *, actor: str) -> None:
  save_json(config.BLOG_DATA_FILE, content)
  append_audit_event(
    action="blog.updated",
    actor=actor,
    summary="Saved blog post collection",
    metadata={"postCount": len(content.get("blogPosts", []))},
  )


def list_media() -> list[dict[str, Any]]:
  media_items = load_json(config.MEDIA_LIBRARY_FILE, [])
  existing_urls = {item.get("url") for item in media_items}

  for file_path in sorted(config.UPLOADS_DIR.glob("*")):
    if not file_path.is_file():
      continue
    url = f"/uploads/admin/{file_path.name}"
    if url in existing_urls:
      continue
    media_items.append(
      {
        "id": str(uuid4()),
        "fileName": file_path.name,
        "url": url,
        "altText": "",
        "contentType": "",
        "size": file_path.stat().st_size,
        "uploadedAt": iso_now(),
      }
    )

  media_items.sort(key=lambda item: item.get("uploadedAt", ""), reverse=True)
  save_json(config.MEDIA_LIBRARY_FILE, media_items)
  return media_items


def save_media_upload(*, file_name: str, file_bytes: bytes, content_type: str, actor: str) -> dict[str, Any]:
  safe_name = "".join(char if char.isalnum() or char in {".", "-", "_"} else "-" for char in file_name).strip(".-")
  if not safe_name:
    safe_name = f"upload-{uuid4().hex}.bin"

  destination = config.UPLOADS_DIR / safe_name
  if destination.exists():
    destination = config.UPLOADS_DIR / f"{destination.stem}-{uuid4().hex[:8]}{destination.suffix}"

  destination.write_bytes(file_bytes)
  item = {
    "id": str(uuid4()),
    "fileName": destination.name,
    "url": f"/uploads/admin/{destination.name}",
    "altText": "",
    "contentType": content_type,
    "size": len(file_bytes),
    "uploadedAt": iso_now(),
  }

  media_items = load_json(config.MEDIA_LIBRARY_FILE, [])
  media_items.insert(0, item)
  save_json(config.MEDIA_LIBRARY_FILE, media_items)
  append_audit_event(
    action="media.uploaded",
    actor=actor,
    summary=f"Uploaded {destination.name}",
    metadata={"contentType": content_type, "size": len(file_bytes)},
  )
  return item


def dashboard_payload(username: str) -> dict[str, Any]:
  site_content = read_site_content()
  blog_data = read_blog_data()
  media_items = list_media()
  audit_events = list_audit_events(8)

  return {
    "welcome": {
      "title": "Admin control room",
      "subtitle": "Manage content, blog posts, images, and publishing operations from one secure workspace.",
      "username": username,
      "mfaConfigured": bool(config.DEFAULT_ADMIN_TOTP_SECRET),
    },
    "metrics": [
      {"label": "Services", "value": len(site_content.get("services", []))},
      {"label": "Research projects", "value": len(site_content.get("researchProjects", []))},
      {"label": "Publications", "value": len(site_content.get("publications", []))},
      {"label": "Blog posts", "value": len(blog_data.get("blogPosts", []))},
      {"label": "Media files", "value": len(media_items)},
      {"label": "Recent audit events", "value": len(audit_events)},
    ],
    "quickActions": [
      {"id": "hero", "label": "Update hero content", "section": "content"},
      {"id": "services", "label": "Refresh services", "section": "content"},
      {"id": "blog", "label": "Publish blog post", "section": "blog"},
      {"id": "media", "label": "Upload new image", "section": "media"},
      {"id": "security", "label": "Review security status", "section": "security"},
    ],
    "auditEvents": audit_events,
  }

