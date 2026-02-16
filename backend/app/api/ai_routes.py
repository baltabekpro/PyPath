"""AI Chat routes"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.models.models import User
from app.api.dependencies import get_current_user_optional, get_db_service
from app.schemas.ai_schemas import (
    ChatMessage,
    ChatResponse,
    QuickActionRequest,
    SessionResetRequest
)
from app.services.ai_service import get_ai_service, AIService
from app.services.database_service import DatabaseService


router = APIRouter(prefix="/ai", tags=["AI Chat"])


def _get_persisted_history(user: User) -> list[dict]:
    settings = user.settings or {}
    history = settings.get("ai_chat_history") or []
    return history if isinstance(history, list) else []


def _save_persisted_history(user: User, items: list[dict], service: DatabaseService) -> None:
    settings = dict(user.settings or {})
    settings["ai_chat_history"] = items[-200:]
    user.settings = settings
    service.db.commit()


def _append_guest_history(ai_service: AIService, user_id: str, user_text: str, ai_text: str) -> None:
    now_ms = int(datetime.now().timestamp() * 1000)
    ai_service.message_history.setdefault(user_id, []).extend([
        {
            "id": f"{now_ms}_u",
            "sender": "user",
            "text": user_text,
            "timestamp": datetime.now().isoformat(),
        },
        {
            "id": f"{now_ms}_a",
            "sender": "ai",
            "text": ai_text,
            "timestamp": datetime.now().isoformat(),
        },
    ])


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    payload: ChatMessage,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service)
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
        if user:
            now_ms = int(datetime.now().timestamp() * 1000)
            history = _get_persisted_history(user)
            history.extend([
                {
                    "id": f"{now_ms}_u",
                    "sender": "user",
                    "text": payload.message,
                    "timestamp": datetime.now().isoformat(),
                },
                {
                    "id": f"{now_ms}_a",
                    "sender": "ai",
                    "text": response_text,
                    "timestamp": datetime.now().isoformat(),
                },
            ])
            _save_persisted_history(user, history, service)
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
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service)
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
    user_id = user.id if user else payload.user_id

    user_text = f"Quick action: {payload.action_type}"
    if user:
        now_ms = int(datetime.now().timestamp() * 1000)
        history = _get_persisted_history(user)
        history.extend([
            {
                "id": f"{now_ms}_u",
                "sender": "user",
                "text": user_text,
                "timestamp": datetime.now().isoformat(),
            },
            {
                "id": f"{now_ms}_a",
                "sender": "ai",
                "text": response_text,
                "timestamp": datetime.now().isoformat(),
            },
        ])
        _save_persisted_history(user, history, service)
    else:
        _append_guest_history(ai_service, user_id, user_text, response_text)

    return ChatResponse(
        response=response_text,
        timestamp=datetime.now().isoformat()
    )


@router.post("/reset-session")
def reset_chat_session(
    payload: SessionResetRequest,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service)
):
    """Reset AI chat session - Clear conversation history and start fresh"""
    user_id = user.id if user else payload.user_id
    ai_service.reset_session(user_id)

    if user:
        _save_persisted_history(user, [], service)

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
    service: DatabaseService = Depends(get_db_service),
    ai_service: AIService = Depends(get_ai_service)
):
    """Get chat history for Oracle section"""
    if user:
        persisted = _get_persisted_history(user)
        if persisted:
            return {"items": persisted}

    resolved_user_id = user.id if user else (user_id or "guest")
    return {"items": ai_service.get_history(resolved_user_id)}
