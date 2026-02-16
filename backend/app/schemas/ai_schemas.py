"""Schemas for AI chat"""
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Single chat message"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    user_id: str = Field(default="guest", description="User ID for session management")
    chat_id: str | None = Field(default=None, description="Chat ID for multi-chat sessions")


class ChatResponse(BaseModel):
    """AI chat response"""
    response: str = Field(..., description="AI response text")
    timestamp: str = Field(..., description="Response timestamp")


class QuickActionRequest(BaseModel):
    """Quick action request"""
    action_type: str = Field(..., description="Type of quick action: hint, error, theory, motivation")
    user_id: str = Field(default="guest", description="User ID")
    chat_id: str | None = Field(default=None, description="Chat ID for multi-chat sessions")


class SessionResetRequest(BaseModel):
    """Reset chat session"""
    user_id: str = Field(..., description="User ID to reset session")
    chat_id: str | None = Field(default=None, description="Optional chat ID to reset specific chat")
