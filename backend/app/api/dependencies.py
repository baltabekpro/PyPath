"""Common API dependencies"""
from typing import Optional

from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.core.auth import decode_access_token
from app.core.database import get_db
from app.core.locales import normalize_language
from app.models.models import User
from app.services.database_service import DatabaseService


def get_db_service(db: Session = Depends(get_db)) -> DatabaseService:
    """Get database service instance"""
    return DatabaseService(db)


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    service: DatabaseService = Depends(get_db_service)
) -> Optional[User]:
    """Get current user from token (optional - returns None if not authenticated)"""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        return None
    
    username = payload.get("sub")
    if not username:
        return None
    
    return service.get_user_by_username(username)


def get_current_user(
    authorization: Optional[str] = Header(None),
    service: DatabaseService = Depends(get_db_service)
) -> User:
    """Get current user from token (required - raises exception if not authenticated)"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = service.get_user_by_username(username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


def get_request_language(
    x_app_language: Optional[str] = Header(None, alias="X-App-Language"),
    accept_language: Optional[str] = Header(None),
) -> str:
    """Get requested UI language from headers."""
    return normalize_language(x_app_language or accept_language)
