from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PyPath Backend API"
    app_version: str = "1.1.0"
    app_description: str = "Production-ready FastAPI backend for PyPath"
    debug: bool = False

    api_prefix: str = ""
    api_v1_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./pypath.db"
    jwt_secret_key: str = ""
    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
        ]
    )
    
    # Google Gemini AI
    google_api_key: str = ""
    gemini_model: str = "gemini-3-flash-preview"

    # Bootstrap admin account
    admin_username: str = "admin_pypath"
    admin_email: str = "admin@pypath.local"
    admin_password: str = "Admin12345!"
    admin_name: str = "PyPath Admin"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
