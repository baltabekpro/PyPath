from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.auth_routes import router as auth_router
from app.api.ai_routes import router as ai_router
from app.core.config import get_settings
from app.core.bootstrap import ensure_admin_account, ensure_default_courses, ensure_default_missions
from app.core.errors import (
    http_exception_handler,
    unhandled_exception_handler,
    validation_exception_handler,
)
from app.core.logging_middleware import RequestLoggingMiddleware


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )


def create_app() -> FastAPI:
    settings = get_settings()
    _configure_logging()

    if not settings.jwt_secret_key:
        raise RuntimeError("JWT_SECRET_KEY is required")

    # Swagger documentation metadata with hierarchical tags
    tags_metadata = [
        {
            "name": "Health",
            "description": "Проверка состояния сервера и готовности API",
        },
        {
            "name": "Authentication",
            "description": "Авторизация и аутентификация пользователей (JWT tokens)",
        },
        {
            "name": "User",
            "description": "Управление профилем пользователя и статистикой",
        },
        {
            "name": "Courses",
            "description": "Каталог курсов и учебных материалов",
        },
        {
            "name": "Missions",
            "description": "Задания и миссии для выполнения",
        },
        {
            "name": "Community",
            "description": "Социальные функции: посты, друзья, лидерборд",
        },
        {
            "name": "Achievements",
            "description": "Достижения и награды пользователя",
        },
        {
            "name": "AI Chat",
            "description": "AI-ассистент на базе Google Gemini для помощи в обучении",
        },
        {
            "name": "System",
            "description": "Системная информация и логи",
        },
    ]

    application = FastAPI(
        title=settings.app_name,
        description="""
# PyPath Backend API

Образовательная платформа для изучения Python с геймификацией и AI-ассистентом.

## Основные возможности:
* Безопасная JWT авторизация
* Структурированные учебные курсы
* Практические миссии и задания
* Социальное сообщество (посты, друзья, лидерборд)
* Система достижений и наград
* AI Помощник на базе Google Gemini

## Технологический стек:
* FastAPI + Uvicorn
* SQLAlchemy + Alembic
* JWT + BCrypt
* Google Generative AI (Gemini)
        """,
        version=settings.app_version,
        debug=settings.debug,
        openapi_tags=tags_metadata,
        contact={
            "name": "PyPath Team",
            "url": "https://github.com/pypath",
            "email": "support@pypath.dev"
        },
        license_info={
            "name": "MIT",
        },
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_origin_regex=r"https://([a-zA-Z0-9-]+\.)*vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.add_middleware(RequestLoggingMiddleware)

    application.add_exception_handler(HTTPException, http_exception_handler)
    application.add_exception_handler(RequestValidationError, validation_exception_handler)
    application.add_exception_handler(Exception, unhandled_exception_handler)

    application.include_router(router, prefix=settings.api_prefix)
    application.include_router(router, prefix=settings.api_v1_prefix)
    application.include_router(auth_router, prefix=settings.api_prefix)
    application.include_router(auth_router, prefix=settings.api_v1_prefix)
    application.include_router(ai_router, prefix=settings.api_prefix)
    application.include_router(ai_router, prefix=settings.api_v1_prefix)

    @application.on_event("startup")
    def startup_seed_data() -> None:
        from app.core.database import init_db
        init_db()
        if not settings.google_api_key:
            logging.getLogger(__name__).warning("GOOGLE_API_KEY is not configured. AI routes will return fallback responses.")
        ensure_default_courses()
        ensure_default_missions()
        ensure_admin_account()

    return application


app = create_app()
