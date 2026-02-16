"""Authentication routes"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.auth import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.core.database import get_db
from app.schemas.auth import Token, UserLogin, UserRegister
from app.services.database_service import DatabaseService
from app.api.dependencies import get_db_service

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserRegister, service: DatabaseService = Depends(get_db_service)):
    """Register a new user"""
    # Check if username exists
    if service.get_user_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email exists
    if service.get_user_by_email(payload.email):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Get user count for ID
    from app.models.models import User
    user_count = service.db.query(User).count()
    
    # Create new user
    user_data = {
        "id": f"u_{user_count + 1}",
        "username": payload.username,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "full_name": payload.fullName,
        "name": payload.username,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.username}",
        "bio": "Новый путник в мире кода",
        "level": "Новичок",
        "level_num": 1,
        "xp": 0,
        "max_xp": 100,
        "streak": 0,
        "rank": user_count + 1,
        "league": "Bronze",
        "settings": {
            "theme": "dark",
            "notifications": True,
            "sound": True
        }
    }
    
    service.create_user(user_data)
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, service: DatabaseService = Depends(get_db_service)):
    """Login user"""
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
def get_current_user(
    authorization: Optional[str] = Header(None),
    service: DatabaseService = Depends(get_db_service)
):
    """Get current authenticated user"""
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
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out"}
