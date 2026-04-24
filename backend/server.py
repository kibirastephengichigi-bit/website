from __future__ import annotations

import cgi
import json
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

from . import config, storage
from .database import db
from .security import verify_password, verify_totp, generate_session_token


SESSION_COOKIE_NAME = "admin_session"
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
ALLOWED_UPLOAD_TYPES = {
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
}


class AdminRequestHandler(BaseHTTPRequestHandler):
  server_version = "StephenAdmin/0.1"

  def end_headers(self) -> None:
    self._write_cors_headers()
    super().end_headers()

  def _write_cors_headers(self) -> None:
    origin = self.headers.get("Origin")
    if origin == config.DEFAULT_ALLOWED_ORIGIN:
      self.send_header("Access-Control-Allow-Origin", origin)
      self.send_header("Vary", "Origin")
      self.send_header("Access-Control-Allow-Credentials", "true")
      self.send_header("Access-Control-Allow-Headers", "Content-Type")
      self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")

  def _json_response(self, status: int, payload: dict[str, Any]) -> None:
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    self.send_response(status)
    self.send_header("Content-Type", "application/json; charset=utf-8")
    self.send_header("Content-Length", str(len(body)))
    self.end_headers()
    self.wfile.write(body)

  def _read_json_body(self) -> dict[str, Any]:
    length = int(self.headers.get("Content-Length", "0"))
    raw = self.rfile.read(length) if length > 0 else b"{}"
    return json.loads(raw.decode("utf-8"))

  def _get_session_token(self) -> str | None:
    cookie_header = self.headers.get("Cookie")
    if not cookie_header:
      return None
    cookies = SimpleCookie()
    cookies.load(cookie_header)
    cookie = cookies.get(SESSION_COOKIE_NAME)
    return cookie.value if cookie else None

  def _get_current_user(self) -> dict[str, Any] | None:
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

  def _require_user(self) -> dict[str, Any] | None:
    user = self._get_current_user()
    if not user:
      self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Authentication required"})
      return None
    return user

  def _set_session_cookie(self, token: str, *, max_age: int) -> None:
    cookie = SimpleCookie()
    cookie[SESSION_COOKIE_NAME] = token
    cookie[SESSION_COOKIE_NAME]["path"] = "/"
    cookie[SESSION_COOKIE_NAME]["httponly"] = True
    cookie[SESSION_COOKIE_NAME]["samesite"] = "Lax"
    cookie[SESSION_COOKIE_NAME]["max-age"] = str(max_age)
    self.send_header("Set-Cookie", cookie.output(header="").strip())

  def do_OPTIONS(self) -> None:
    self.send_response(HTTPStatus.NO_CONTENT)
    self.end_headers()

  def do_GET(self) -> None:
    path = urlparse(self.path).path

    if path == "/api/health":
      self._json_response(HTTPStatus.OK, {"status": "ok"})
      return

    if path == "/api/auth/me":
      user = self._get_current_user()
      if not user:
        self._json_response(HTTPStatus.OK, {"authenticated": False})
        return
      self._json_response(
        HTTPStatus.OK,
        {
          "authenticated": True,
          "user": {
            "username": user["username"],
            "displayName": user["displayName"],
            "role": user["role"],
            "mfaConfigured": bool(config.DEFAULT_ADMIN_TOTP_SECRET),
          },
        },
      )
      return

    user = self._require_user()
    if not user:
      return

    if path == "/api/dashboard":
      self._json_response(HTTPStatus.OK, storage.dashboard_payload(user["username"]))
      return

    if path == "/api/content/site":
      self._json_response(HTTPStatus.OK, {"content": storage.read_site_content()})
      return

    if path == "/api/content/blog":
      self._json_response(HTTPStatus.OK, {"content": storage.read_blog_data()})
      return

    if path == "/api/media":
      self._json_response(HTTPStatus.OK, {"items": storage.list_media()})
      return

    if path == "/api/audit":
      events = db.list_audit_events(40)
      # Convert datetime objects to strings for JSON serialization
      for event in events:
        if "created_at" in event and hasattr(event["created_at"], "isoformat"):
          event["created_at"] = event["created_at"].isoformat()
      self._json_response(HTTPStatus.OK, {"events": events})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

  def do_POST(self) -> None:
    path = urlparse(self.path).path

    if path == "/api/auth/login":
      try:
        payload = self._read_json_body()
      except json.JSONDecodeError:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
        return

      username = str(payload.get("username", "")).strip()
      password = str(payload.get("password", ""))
      otp = str(payload.get("otp", "")).strip()

      user = db.verify_user_credentials(username, password)
      if not user:
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid username or password"})
        return

      if config.DEFAULT_ADMIN_TOTP_SECRET and not verify_totp(config.DEFAULT_ADMIN_TOTP_SECRET, otp):
        self._json_response(HTTPStatus.UNAUTHORIZED, {"error": "Invalid one-time authentication code"})
        return

      session_token = generate_session_token()
      session_created = db.create_session(
        user_id=user["id"],
        token=session_token,
        ip_address=self.client_address[0],
        user_agent=self.headers.get("User-Agent", "unknown"),
        expires_hours=config.DEFAULT_SESSION_HOURS,
      )
      
      if not session_created:
        self._json_response(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "Failed to create session"})
        return

      self.send_response(HTTPStatus.OK)
      self._set_session_cookie(session_token, max_age=config.DEFAULT_SESSION_HOURS * 60 * 60)
      self.send_header("Content-Type", "application/json; charset=utf-8")
      body = json.dumps(
        {
          "authenticated": True,
          "user": {
            "username": user["username"],
            "displayName": user["display_name"],
            "role": user["role"],
            "mfaConfigured": bool(config.DEFAULT_ADMIN_TOTP_SECRET),
          },
        }
      ).encode("utf-8")
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
      db.append_audit_event(
        action="auth.logout",
        actor=user["username"],
        summary="Admin logout completed",
        user_id=user["session"]["user_id"] if user.get("session") else None,
      )
      self.send_response(HTTPStatus.OK)
      self._set_session_cookie("", max_age=0)
      self.send_header("Content-Type", "application/json; charset=utf-8")
      body = b'{"authenticated": false}'
      self.send_header("Content-Length", str(len(body)))
      self.end_headers()
      self.wfile.write(body)
      return

    if path == "/api/media":
      content_length = int(self.headers.get("Content-Length", "0"))
      if content_length <= 0 or content_length > MAX_UPLOAD_BYTES:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Upload is empty or exceeds the 10MB limit"})
        return

      form = cgi.FieldStorage(
        fp=self.rfile,
        headers=self.headers,
        environ={
          "REQUEST_METHOD": "POST",
          "CONTENT_TYPE": self.headers.get("Content-Type", ""),
        },
      )

      if "file" not in form:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Missing file field"})
        return

      file_field = form["file"]
      file_name = getattr(file_field, "filename", "") or ""
      content_type = getattr(file_field, "type", "") or ""
      file_bytes = file_field.file.read() if getattr(file_field, "file", None) else b""

      if not file_name or not file_bytes:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "No file selected"})
        return

      if content_type not in ALLOWED_UPLOAD_TYPES:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Unsupported file type"})
        return

      item = storage.save_media_upload(
        file_name=file_name,
        file_bytes=file_bytes,
        content_type=content_type,
        actor=user["username"],
      )
      self._json_response(HTTPStatus.CREATED, {"item": item})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})

  def do_PUT(self) -> None:
    path = urlparse(self.path).path
    user = self._require_user()
    if not user:
      return

    try:
      payload = self._read_json_body()
    except json.JSONDecodeError:
      self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON payload"})
      return

    if path == "/api/content/site":
      if "hero" not in payload or "services" not in payload or "contact" not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Incomplete site content payload"})
        return
      storage.write_site_content(payload, actor=user["username"])
      self._json_response(HTTPStatus.OK, {"saved": True})
      return

    if path == "/api/content/blog":
      if "blogPosts" not in payload or "blogContentBySlug" not in payload:
        self._json_response(HTTPStatus.BAD_REQUEST, {"error": "Incomplete blog payload"})
        return
      storage.write_blog_data(payload, actor=user["username"])
      self._json_response(HTTPStatus.OK, {"saved": True})
      return

    self._json_response(HTTPStatus.NOT_FOUND, {"error": "Route not found"})


def main() -> None:
  storage.ensure_storage()
  server = ThreadingHTTPServer(("0.0.0.0", config.PORT), AdminRequestHandler)
  print(f"Admin API listening on http://localhost:{config.PORT}")
  print(f"Allowed frontend origin: {config.DEFAULT_ALLOWED_ORIGIN}")
  server.serve_forever()


if __name__ == "__main__":
  main()

