"""AI Chat routes"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.models import User
from app.api.dependencies import get_current_user_optional
from app.schemas.ai_schemas import (
    ChatMessage,
    ChatResponse,
    QuickActionRequest,
    SessionResetRequest
)
from app.services.ai_service import get_ai_service, AIService


router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatMessage,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Send message to AI assistant and get intelligent response
    
    The AI assistant helps with:
    - Explaining Python concepts
    - Debugging code errors
    - Providing hints without full solutions
    - Motivating learning progress
    
    Powered by Google Gemini
    """
    # Use authenticated user ID or provided user_id
    user_id = user.id if user else payload.user_id
    
    try:
        response_text = ai_service.chat(user_id, payload.message)
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/quick-action", response_model=ChatResponse)
def quick_action(
    payload: QuickActionRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service)
):
    """
    Get quick predefined AI response
    
    Action types:
    - `hint` - Get learning hint
    - `error` - Help with error debugging
    - `theory` - Explain theory concepts
    - `motivation` - Get motivational boost
    """
    response_text = ai_service.get_quick_response(payload.action_type)
    return ChatResponse(
        response=response_text,
        timestamp=datetime.now().isoformat()
    )


@router.post("/reset-session")
def reset_chat_session(
    payload: SessionResetRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service)
):
    """Reset AI chat session - Clear conversation history and start fresh"""
    user_id = user.id if user else payload.user_id
    ai_service.reset_session(user_id)
    return {"message": "Chat session reset successfully", "user_id": user_id}


@router.get("/status")
def ai_status(ai_service: AIService = Depends(get_ai_service)):
    """Check AI service status - Model name, active sessions count"""
    from app.core.config import get_settings
    settings = get_settings()
    return {
        "status": "online",
        "model": settings.gemini_model,
        "active_sessions": len(ai_service.chat_sessions)
    }


@router.get("/history")
def ai_history(
    user_id: Optional[str] = Query(default=None),
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service)
):
    """Get chat history for Oracle section"""
    resolved_user_id = user.id if user else (user_id or "guest")
    return {"items": ai_service.get_history(resolved_user_id)}
