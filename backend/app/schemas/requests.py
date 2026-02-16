from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    notifications: bool | None = None
    sound: bool | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    fullName: str | None = None
    bio: str | None = Field(default=None, max_length=200)
    avatar: str | None = None
    settings: UserSettingsUpdate | None = None


class PostCreate(BaseModel):
    content: str = Field(min_length=10)
    code: str | None = None
    tags: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("tags")
    @classmethod
    def clean_tags(cls, value: list[str]) -> list[str]:
        return [tag.strip() for tag in value if tag and tag.strip()]


class MissionSubmit(BaseModel):
    code: str


class NotificationPreference(BaseModel):
    label: str
    enabled: bool


class NotificationPreferencesUpdate(BaseModel):
    preferences: list[NotificationPreference] = Field(default_factory=list)
