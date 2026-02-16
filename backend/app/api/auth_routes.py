"""Authentication routes"""
from __future__ import annotations

from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.core.database import get_db
from app.schemas.auth import Token, UserLogin, UserRegister, PasswordChangeRequest
from app.services.database_service import DatabaseService
from app.api.dependencies import get_db_service, get_current_user as require_current_user
from app.core.rate_limit import rate_limiter

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["Authentication"])
RESERVED_USERNAMES = {"admin", "root", "system", "support", "moderator", "staff"}


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_rate_limit(request: Request, key_prefix: str, limit: int, window_seconds: int) -> None:
    ip = _client_ip(request)
    result = rate_limiter.check(f"{key_prefix}:{ip}", limit=limit, window_seconds=window_seconds)
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {result.retry_after_seconds} seconds",
            headers={"Retry-After": str(result.retry_after_seconds)},
        )


@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserRegister, request: Request, service: DatabaseService = Depends(get_db_service)):
    """
    Register new user account
    
    Creates new user with:
    - Unique username and email validation
    - Secure password hashing (BCrypt)
    - JWT token generation
    - Initial profile setup (avatar, level, XP)
    
    Returns access token for immediate authentication
    """
    _enforce_rate_limit(request, key_prefix="auth:register", limit=10, window_seconds=600)

    normalized_username = payload.username.strip().lower()
    if normalized_username in RESERVED_USERNAMES:
        raise HTTPException(status_code=400, detail="Username is reserved")

    # Check if username exists
    if service.get_user_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email exists
    if service.get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    user_data = {
        "id": f"u_{uuid4().hex}",
        "username": payload.username.strip(),
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "full_name": payload.fullName,
        "name": payload.username.strip(),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.username.strip()}",
        "bio": "Новый путник в мире кода",
        "level": "Новичок",
        "level_num": 1,
        "xp": 0,
        "max_xp": 100,
        "streak": 0,
        "rank": 0,
        "league": "Bronze",
        "settings": {
            "theme": "dark",
            "notifications": True,
            "sound": True
        }
    }

    try:
        service.create_user(user_data)
    except IntegrityError:
        service.db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username.strip()})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, request: Request, service: DatabaseService = Depends(get_db_service)):
    """
    Login with username and password
    
    - Validates credentials
    - Verifies password hash
    - Generates JWT access token
    
    Token expires in 7 days
    """
    _enforce_rate_limit(request, key_prefix="auth:login", limit=20, window_seconds=300)

    # Find user
    user = service.get_user_by_username(payload.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username})
    return Token(access_token=access_token)


@router.get("/me")
def get_me(
    authorization: Optional[str] = Header(None),
    service: DatabaseService = Depends(get_db_service)
):
    """
    Get current authenticated user
    
    Requires Authorization: Bearer <token> header
    
    Returns full user profile with:
    - Personal info (username, email, name, bio)
    - Progress tracking (level, XP, streak)
    - Leaderboard position (rank, league)
    - Settings preferences
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Get user from database
    user = service.get_user_by_username(username)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Convert to dict and remove password
    user_dict = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "fullName": user.full_name,
        "name": user.name,
        "avatar": user.avatar,
        "bio": user.bio,
        "level": user.level,
        "levelNum": user.level_num,
        "xp": user.xp,
        "maxXp": user.max_xp,
        "streak": user.streak,
        "rank": user.rank,
        "league": user.league,
        "settings": user.settings
    }
    return user_dict


@router.post("/logout")
def logout():
    """Logout user - Client should remove token from storage"""
    return {"message": "Successfully logged out"}


@router.post("/change-password")
def change_password(
    payload: PasswordChangeRequest,
    request: Request,
    user=Depends(require_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Change current user password"""
    _enforce_rate_limit(request, key_prefix=f"auth:change-password:{user.id}", limit=10, window_seconds=600)

    if payload.newPassword != payload.confirmPassword:
        raise HTTPException(status_code=400, detail="New password confirmation does not match")

    if not verify_password(payload.currentPassword, user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password = get_password_hash(payload.newPassword)
    service.db.commit()

    return {"message": "Password changed successfully"}
