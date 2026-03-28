"""AI Chat routes"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from app.models.models import User
from app.api.dependencies import get_current_user_optional, get_db_service, get_request_language
from app.schemas.ai_schemas import (
    ChatMessage,
    ChatResponse,
    QuickActionRequest,
    QuizGenerateRequest,
    QuizGenerateResponse,
    QuizQuestion,
    SessionResetRequest,
)
from app.services.ai_service import get_ai_service, AIService, detect_language
from app.services.database_service import DatabaseService
from app.core.rate_limit import rate_limiter


router = APIRouter(prefix="/ai", tags=["AI Chat"])


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _enforce_rate_limit(request: Request, key: str, limit: int, window_seconds: int) -> None:
    result = rate_limiter.check(key=key, limit=limit, window_seconds=window_seconds)
    if not result.allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {result.retry_after_seconds} seconds",
            headers={"Retry-After": str(result.retry_after_seconds)},
        )


def _now_iso() -> str:
    return datetime.now().isoformat()


def _new_chat_id() -> str:
    return f"chat_{int(datetime.now().timestamp() * 1000)}"


def _get_persisted_history(user: User) -> list[dict]:
    settings = user.settings or {}
    history = settings.get("ai_chat_history") or []
    if not isinstance(history, list):
        return []

    cleaned: list[dict] = []
    for item in history:
        if not isinstance(item, dict):
            continue
        sender = item.get("sender")
        text = str(item.get("text") or item.get("message") or "").strip()
        if sender not in {"user", "ai"} or not text:
            continue
        cleaned.append({
            "id": item.get("id") or f"{int(datetime.now().timestamp() * 1000)}_{sender}",
            "sender": sender,
            "text": text,
            "timestamp": item.get("timestamp") or datetime.now().isoformat(),
        })
    return cleaned


def _get_persisted_chats(user: User) -> tuple[list[dict], str | None]:
    settings = user.settings or {}
    raw_chats = settings.get("ai_chats") or []
    active_chat_id = settings.get("active_ai_chat_id")

    chats: list[dict] = []
    for chat in raw_chats if isinstance(raw_chats, list) else []:
        if not isinstance(chat, dict):
            continue
        chat_id = chat.get("id") or _new_chat_id()
        title = str(chat.get("title") or "Новый чат").strip() or "Новый чат"
        updated_at = chat.get("updatedAt") or _now_iso()
        messages = chat.get("messages") or []
        cleaned_messages = []
        for item in messages if isinstance(messages, list) else []:
            if not isinstance(item, dict):
                continue
            sender = item.get("sender")
            text = str(item.get("text") or item.get("message") or "").strip()
            if sender not in {"user", "ai"} or not text:
                continue
            cleaned_messages.append({
                "id": item.get("id") or f"{int(datetime.now().timestamp() * 1000)}_{sender}",
                "sender": sender,
                "text": text,
                "timestamp": item.get("timestamp") or _now_iso(),
            })

        chats.append({
            "id": chat_id,
            "title": title,
            "updatedAt": updated_at,
            "messages": cleaned_messages,
        })

    if not active_chat_id and chats:
        active_chat_id = chats[0]["id"]

    return chats, active_chat_id


def _save_persisted_chats(user: User, chats: list[dict], active_chat_id: str | None, service: DatabaseService) -> None:
    settings = dict(user.settings or {})
    settings["ai_chats"] = chats[-50:]
    settings["active_ai_chat_id"] = active_chat_id
    settings["ai_chat_history"] = []
    user.settings = settings
    service.db.commit()


def _find_or_create_chat(chats: list[dict], chat_id: str | None, first_user_text: str | None = None) -> tuple[dict, str]:
    resolved_id = chat_id or _new_chat_id()
    for chat in chats:
        if chat.get("id") == resolved_id:
            return chat, resolved_id

    title_source = (first_user_text or "Новый чат").strip()
    title = (title_source[:40] + "...") if len(title_source) > 40 else title_source
    title = title or "Новый чат"
    new_chat = {
        "id": resolved_id,
        "title": title,
        "updatedAt": _now_iso(),
        "messages": [],
    }
    chats.insert(0, new_chat)
    return new_chat, resolved_id


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
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service),
    header_language: str = Depends(get_request_language),
):
    """
    Send message to AI assistant and get intelligent response

    The AI assistant responds in the same language as the user's message.
    Language is determined by (in priority order):
    1. ``language`` field in the request body
    2. ``X-App-Language`` request header
    3. Auto-detection from message text

    Powered by Google Gemini
    """
    identity = user.id if user else (payload.user_id or _client_ip(request))
    _enforce_rate_limit(request, key=f"ai:chat:{identity}", limit=60, window_seconds=60)

    # Resolve effective language: explicit > header > auto-detect from text
    _raw_lang = payload.language or header_language
    effective_language = _raw_lang if _raw_lang in ("kz", "ru") else detect_language(payload.message)

    # Use authenticated user ID or provided user_id
    user_id = user.id if user else payload.user_id
    session_key = f"{user_id}:{payload.chat_id}" if payload.chat_id else user_id

    try:
        response_text = ai_service.chat(session_key, payload.message, language=effective_language)
        if user:
            now_ms = int(datetime.now().timestamp() * 1000)
            chats, _ = _get_persisted_chats(user)
            chat, resolved_chat_id = _find_or_create_chat(chats, payload.chat_id, payload.message)
            chat["updatedAt"] = _now_iso()
            chat_messages = chat.get("messages") or []
            chat_messages.extend([
                {
                    "id": f"{now_ms}_u",
                    "sender": "user",
                    "text": payload.message,
                    "timestamp": _now_iso(),
                },
                {
                    "id": f"{now_ms}_a",
                    "sender": "ai",
                    "text": response_text,
                    "timestamp": _now_iso(),
                },
            ])
            chat["messages"] = chat_messages[-200:]
            _save_persisted_chats(user, chats, resolved_chat_id, service)
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat()
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI service temporarily unavailable"
        )


@router.post("/quick-action", response_model=ChatResponse)
def quick_action(
    payload: QuickActionRequest,
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service),
    header_language: str = Depends(get_request_language),
):
    """
    Get quick predefined AI response

    Action types:
    - `hint` - Get learning hint
    - `error` - Help with error debugging
    - `theory` - Explain theory concepts
    - `motivation` - Get motivational boost
    """
    identity = user.id if user else (payload.user_id or _client_ip(request))
    _enforce_rate_limit(request, key=f"ai:quick:{identity}", limit=120, window_seconds=60)

    effective_language = payload.language or header_language or "ru"
    if effective_language not in ("kz", "ru"):
        effective_language = "ru"

    response_text = ai_service.get_quick_response(payload.action_type, language=effective_language)
    user_id = user.id if user else payload.user_id

    user_text = f"Quick action: {payload.action_type}"
    if user:
        now_ms = int(datetime.now().timestamp() * 1000)
        chats, _ = _get_persisted_chats(user)
        chat, resolved_chat_id = _find_or_create_chat(chats, payload.chat_id, user_text)
        chat["updatedAt"] = _now_iso()
        chat_messages = chat.get("messages") or []
        chat_messages.extend([
            {
                "id": f"{now_ms}_u",
                "sender": "user",
                "text": user_text,
                "timestamp": _now_iso(),
            },
            {
                "id": f"{now_ms}_a",
                "sender": "ai",
                "text": response_text,
                "timestamp": _now_iso(),
            },
        ])
        chat["messages"] = chat_messages[-200:]
        _save_persisted_chats(user, chats, resolved_chat_id, service)
    else:
        _append_guest_history(ai_service, user_id, user_text, response_text)

    return ChatResponse(
        response=response_text,
        timestamp=datetime.now().isoformat()
    )


@router.post("/reset-session")
def reset_chat_session(
    payload: SessionResetRequest,
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    service: DatabaseService = Depends(get_db_service)
):
    """Reset AI chat session - Clear conversation history and start fresh"""
    identity = user.id if user else (payload.user_id or _client_ip(request))
    _enforce_rate_limit(request, key=f"ai:reset:{identity}", limit=30, window_seconds=60)

    user_id = user.id if user else payload.user_id
    session_key = f"{user_id}:{payload.chat_id}" if payload.chat_id else user_id
    ai_service.reset_session(session_key)

    if user:
        chats, active_chat_id = _get_persisted_chats(user)
        if payload.chat_id:
            for chat in chats:
                if chat.get("id") == payload.chat_id:
                    chat["messages"] = []
                    chat["updatedAt"] = _now_iso()
                    break
        else:
            chats = []
            active_chat_id = None
        _save_persisted_chats(user, chats, active_chat_id, service)

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
    chat_id: Optional[str] = Query(default=None),
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service),
    ai_service: AIService = Depends(get_ai_service)
):
    """Get chat history for Oracle section"""
    if user:
        chats, active_chat_id = _get_persisted_chats(user)

        # Migrate legacy flat history into one default chat if needed
        if not chats:
            persisted = _get_persisted_history(user)
            if persisted:
                default_chat_id = _new_chat_id()
                chats = [{
                    "id": default_chat_id,
                    "title": "История",
                    "updatedAt": _now_iso(),
                    "messages": persisted,
                }]
                active_chat_id = default_chat_id

        if chats:
            if chat_id and any(c.get("id") == chat_id for c in chats):
                active_chat_id = chat_id
            _save_persisted_chats(user, chats, active_chat_id, service)
            active_chat = next((c for c in chats if c.get("id") == active_chat_id), chats[0])
            summaries = [
                {
                    "id": c.get("id"),
                    "title": c.get("title") or "Новый чат",
                    "updatedAt": c.get("updatedAt") or _now_iso(),
                    "lastMessage": (c.get("messages") or [])[-1].get("text") if (c.get("messages") or []) else "",
                }
                for c in chats
            ]
            return {
                "items": active_chat.get("messages") or [],
                "active_chat_id": active_chat.get("id"),
                "chats": summaries,
            }

    resolved_user_id = user.id if user else (user_id or "guest")
    in_memory = [
        item for item in ai_service.get_history(resolved_user_id)
        if isinstance(item, dict)
        and item.get("sender") in {"user", "ai"}
        and str(item.get("text") or "").strip()
    ]
    return {"items": in_memory, "active_chat_id": None, "chats": []}


@router.post("/generate-quiz", response_model=QuizGenerateResponse, tags=["AI Chat"])
def generate_quiz(
    payload: QuizGenerateRequest,
    request: Request,
    user: Optional[User] = Depends(get_current_user_optional),
    ai_service: AIService = Depends(get_ai_service),
    header_language: str = Depends(get_request_language),
):
    """Generate quiz questions to reinforce a learning topic.

    After a theory section is shown to the user, call this endpoint to get
    auto-generated multiple-choice questions that test comprehension.

    Returns a list of ``QuizQuestion`` objects with ``question``, ``options``
    (4 choices), ``correct_index`` and ``explanation``.
    """
    identity = user.id if user else _client_ip(request)
    _enforce_rate_limit(request, key=f"ai:quiz:{identity}", limit=30, window_seconds=60)

    effective_language = payload.language or header_language or "ru"
    if effective_language not in ("kz", "ru"):
        effective_language = "ru"

    raw_questions = ai_service.generate_quiz_questions(
        topic=payload.topic,
        theory_content=payload.theory_content,
        language=effective_language,
        num_questions=payload.num_questions,
    )

    questions = [
        QuizQuestion(
            question=q.get("question", ""),
            options=q.get("options", []),
            correct_index=int(q.get("correct_index", 0)),
            explanation=q.get("explanation", ""),
        )
        for q in raw_questions
        if isinstance(q, dict)
    ]

    return QuizGenerateResponse(
        questions=questions,
        topic=payload.topic,
        language=effective_language,
    )
