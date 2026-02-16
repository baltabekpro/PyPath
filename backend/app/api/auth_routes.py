"""Authentication routes"""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.auth import (
    create_access_token,
    decode_access_token,
    get_password_hash,
    verify_password,
)
from app.core.config import get_settings
from app.schemas.auth import Token, UserLogin, UserRegister
from app.services.repository import JsonRepository

security = HTTPBearer()
router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_repository() -> JsonRepository:
    """Get repository instance"""
    settings = get_settings()
    root_dir = Path(__file__).resolve().parents[2]
    data_file = root_dir / settings.data_file
    return JsonRepository(data_file)


@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserRegister, repo: JsonRepository = Depends(get_repository)):
    """Register a new user"""
    db = repo.load()
    
    # Check if username exists
    users = db.get("users", [])
    if any(u.get("username") == payload.username for u in users):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Check if email exists
    if any(u.get("email") == payload.email for u in users):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    new_user = {
        "id": f"u_{len(users) + 1}",
        "username": payload.username,
        "email": payload.email,
        "password": get_password_hash(payload.password),
        "fullName": payload.fullName,
        "name": payload.username,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={payload.username}",
        "bio": "Новый путник в мире кода",
        "level": "Новичок",
        "levelNum": 1,
        "xp": 0,
        "maxXp": 100,
        "streak": 0,
        "rank": len(users) + 1,
        "league": "Bronze",
        "settings": {
            "theme": "dark",
            "notifications": True,
            "sound": True
        }
    }
    
    users.append(new_user)
    
    def updater(data):
        data["users"] = users
        return data
    
    repo.update_db(updater)
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username})
    return Token(access_token=access_token)


@router.post("/login", response_model=Token)
def login(payload: UserLogin, repo: JsonRepository = Depends(get_repository)):
    """Login user"""
    db = repo.load()
    users = db.get("users", [])
    
    # Find user
    user = next((u for u in users if u.get("username") == payload.username), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(payload.password, user.get("password", "")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": payload.username})
    return Token(access_token=access_token)


@router.get("/me")
def get_current_user(
    authorization: Optional[str] = Header(None),
    repo: JsonRepository = Depends(get_repository)
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
    db = repo.load()
    users = db.get("users", [])
    user = next((u for u in users if u.get("username") == username), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != "password"}
    return user_response


@router.post("/logout")
def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Successfully logged out"}
