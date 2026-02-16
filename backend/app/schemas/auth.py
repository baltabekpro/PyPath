"""Auth-related Pydantic schemas"""
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


RESERVED_USERNAMES = {"admin", "root", "system", "support", "moderator", "staff"}


class UserRegister(BaseModel):
    """User registration schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    fullName: str = Field(..., min_length=1, max_length=100)

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Username is required")
        if normalized.lower() in RESERVED_USERNAMES:
            raise ValueError("Username is reserved")
        return normalized


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class Token(BaseModel):
    """JWT token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    username: Optional[str] = None


class PasswordChangeRequest(BaseModel):
    currentPassword: str = Field(..., min_length=1)
    newPassword: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)
