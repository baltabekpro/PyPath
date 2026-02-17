"""Authentication utilities for JWT and password hashing"""
import base64
import hashlib
import hmac
import os
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def _get_secret_key() -> str:
    return get_settings().jwt_secret_key


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    if hashed_password.startswith("pbkdf2_sha256$"):
        try:
            _, iterations_raw, salt_b64, digest_b64 = hashed_password.split("$", 3)
            iterations = int(iterations_raw)
            salt = base64.urlsafe_b64decode(salt_b64.encode("utf-8"))
            expected = base64.urlsafe_b64decode(digest_b64.encode("utf-8"))
            actual = hashlib.pbkdf2_hmac(
                "sha256",
                plain_password.encode("utf-8"),
                salt,
                iterations,
            )
            return hmac.compare_digest(actual, expected)
        except Exception:
            return False

    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash a password"""
    try:
        return pwd_context.hash(password)
    except Exception:
        iterations = 200_000
        salt = os.urandom(16)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
        salt_b64 = base64.urlsafe_b64encode(salt).decode("utf-8")
        digest_b64 = base64.urlsafe_b64encode(digest).decode("utf-8")
        return f"pbkdf2_sha256${iterations}${salt_b64}${digest_b64}"


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, _get_secret_key(), algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode JWT token and return payload"""
    try:
        payload = jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
