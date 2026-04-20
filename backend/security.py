from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
import struct
import time


PBKDF2_ITERATIONS = 240_000


def hash_password(password: str, *, salt: str | None = None) -> str:
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

