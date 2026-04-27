from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import struct
import time
import json
import os


PBKDF2_ITERATIONS = 240_000
CSRF_TOKEN_LENGTH = 32

# Optional: Use Go password service for better performance
USE_GO_PASSWORD_SERVICE = os.getenv("USE_GO_PASSWORD_SERVICE", "false").lower() == "true"
GO_PASSWORD_SERVICE_URL = os.getenv("GO_PASSWORD_SERVICE_URL", "http://localhost:9001")

if USE_GO_PASSWORD_SERVICE:
    try:
        from go_services_client import PasswordServiceClient
        _password_service = PasswordServiceClient(base_url=GO_PASSWORD_SERVICE_URL)
    except ImportError:
        _password_service = None
        USE_GO_PASSWORD_SERVICE = False
else:
    _password_service = None


def hash_password(password: str, *, salt: str | None = None) -> str:
  # Use Go service if available and enabled
  if USE_GO_PASSWORD_SERVICE and _password_service:
    try:
      result = _password_service.hash_password(password, salt)
      return result["hash"]
    except Exception as e:
      # Fallback to Python implementation if Go service fails
      import logging
      logging.warning(f"Go password service failed, falling back to Python: {e}")
  
  # Python fallback implementation
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
  # Use Go service if available and enabled
  if USE_GO_PASSWORD_SERVICE and _password_service:
    try:
      return _password_service.verify_password(password, stored_hash)
    except Exception as e:
      # Fallback to Python implementation if Go service fails
      import logging
      logging.warning(f"Go password service failed, falling back to Python: {e}")
  
  # Python fallback implementation
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
  return secrets.token_urlsafe(48)


def normalize_totp_secret(secret: str) -> bytes:
  cleaned = secret.replace(" ", "").upper()
  padding = "=" * ((8 - len(cleaned) % 8) % 8)
  return base64.b32decode(cleaned + padding, casefold=True)


def generate_totp_code(secret: str, for_time: int | None = None, step: int = 30) -> str:
  counter = int((for_time or int(time.time())) / step)
  key = normalize_totp_secret(secret)
  message = struct.pack(">Q", counter)
  digest = hmac.new(key, message, hashlib.sha1).digest()
  offset = digest[-1] & 0x0F
  binary = struct.unpack(">I", digest[offset : offset + 4])[0] & 0x7FFFFFFF
  return str(binary % 1_000_000).zfill(6)


def verify_totp(secret: str, code: str, window: int = 1) -> bool:
  normalized = code.strip()
  if len(normalized) != 6 or not normalized.isdigit():
    return False

  now = int(time.time())
  for delta in range(-window, window + 1):
    if hmac.compare_digest(generate_totp_code(secret, now + delta * 30), normalized):
      return True
  return False


def generate_csrf_token() -> str:
  """Generate a secure CSRF token"""
  return secrets.token_urlsafe(CSRF_TOKEN_LENGTH)


def hash_csrf_token(token: str, secret: str) -> str:
  """Hash a CSRF token for storage (to prevent timing attacks)"""
  return hmac.new(secret.encode("utf-8"), token.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_csrf_token(token: str, stored_hash: str, secret: str) -> bool:
  """Verify a CSRF token against its stored hash"""
  computed_hash = hash_csrf_token(token, secret)
  return hmac.compare_digest(computed_hash, stored_hash)


