"""Schemas for AI chat"""
from typing import Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Single chat message"""
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    user_id: str = Field(default="guest", description="User ID for session management")
    chat_id: str | None = Field(default=None, description="Chat ID for multi-chat sessions")
    language: str | None = Field(default=None, description="Preferred response language: 'ru' or 'kz'")
    context: dict | None = Field(default=None, description="Optional structured learning context")


class ChatResponse(BaseModel):
    """AI chat response"""
    response: str = Field(..., description="AI response text")
    timestamp: str = Field(..., description="Response timestamp")


class QuickActionRequest(BaseModel):
    """Quick action request"""
    action_type: str = Field(..., description="Type of quick action: hint, error, theory, motivation")
    user_id: str = Field(default="guest", description="User ID")
    chat_id: str | None = Field(default=None, description="Chat ID for multi-chat sessions")
    language: str | None = Field(default=None, description="Preferred response language: 'ru' or 'kz'")


class SessionResetRequest(BaseModel):
    """Reset chat session"""
    user_id: str = Field(..., description="User ID to reset session")
    chat_id: str | None = Field(default=None, description="Optional chat ID to reset specific chat")


class QuizQuestion(BaseModel):
    """A single quiz question with multiple-choice options."""
    question: str
    options: list[str] = Field(..., min_length=2, max_length=6)
    correct_index: int = Field(..., ge=0)
    explanation: str = ""


class QuizGenerateRequest(BaseModel):
    """Request to generate quiz questions for a learning topic."""
    topic: str = Field(..., min_length=1, max_length=200, description="Topic name")
    theory_content: str = Field(
        default="",
        max_length=4000,
        description="Theory text that was shown to the user",
    )
    num_questions: int = Field(default=3, ge=1, le=10, description="Number of questions to generate")
    language: str = Field(default="ru", description="Language for questions: 'ru' or 'kz'")


class QuizGenerateResponse(BaseModel):
    """Quiz generation response."""
    questions: list[QuizQuestion]
    topic: str
    language: str
    translations: dict[str, list[QuizQuestion]] | None = None
