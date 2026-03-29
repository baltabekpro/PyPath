from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class UserSettingsUpdate(BaseModel):
    theme: str | None = None
    notifications: bool | None = None
    sound: bool | None = None
    currentGrade: str | None = Field(default=None, description="Current learning grade: pre, 8, or 9")


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
    courseId: int | None = None


class CourseCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=1000)
    theoryContent: dict | None = None
    quizBank: list[dict] | None = None
    rewardPreview: dict | None = None
    totalLessons: int = Field(default=5, ge=1, le=200)
    icon: str = Field(default="Terminal")
    color: str = Field(default="text-arcade-success")
    difficulty: str = Field(default="Средний")
    isBoss: bool = False
    locked: bool = True


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    description: str | None = Field(default=None, min_length=10, max_length=1000)
    theoryContent: dict | None = None
    quizBank: list[dict] | None = None
    rewardPreview: dict | None = None
    totalLessons: int | None = Field(default=None, ge=1, le=200)
    icon: str | None = None
    color: str | None = None
    difficulty: str | None = None
    isBoss: bool | None = None
    locked: bool | None = None


class CourseQuizBankGenerateRequest(BaseModel):
    numQuestions: int = Field(default=5, ge=1, le=10)
    language: str = Field(default="ru", description="Language for generated questions")
    overwrite: bool = Field(default=True)


class MissionTestCase(BaseModel):
    id: str
    type: str = Field(description="code_regex | output_contains | output_regex | returncode_equals")
    value: str | int
    flags: str | None = Field(default=None, description="Regex flags, e.g. i,m,s")
    label: str | None = None
    points: int = Field(default=1, ge=1, le=10)


class MissionObjectiveCreate(BaseModel):
    text: str = Field(min_length=3, max_length=500)
    testCaseId: str | None = None


class MissionCreate(BaseModel):
    id: str = Field(min_length=3, max_length=100)
    title: str = Field(min_length=3, max_length=200)
    chapter: str = Field(default="Глава")
    description: str = Field(min_length=10, max_length=1500)
    difficulty: str = Field(default="Средний")
    xpReward: int = Field(default=50, ge=0, le=10000)
    objectives: list[MissionObjectiveCreate] = Field(default_factory=list)
    starterCode: str = Field(default="# Write your code here\n")
    testCases: list[MissionTestCase] = Field(default_factory=list)
    hints: list[str] = Field(default_factory=list)


class MissionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=200)
    chapter: str | None = None
    description: str | None = Field(default=None, min_length=10, max_length=1500)
    difficulty: str | None = None
    xpReward: int | None = Field(default=None, ge=0, le=10000)
    objectives: list[MissionObjectiveCreate] | None = None
    starterCode: str | None = None
    testCases: list[MissionTestCase] | None = None
    hints: list[str] | None = None


class MissionFile(BaseModel):
    id: str
    name: str
    type: str
    content: str | None = None
    language: str | None = None
    parentId: str | None = None


class MissionCodeUpdate(BaseModel):
    files: list[MissionFile] = Field(default_factory=list)
    activeFileId: str | None = None


class JourneyTopicProgressUpdate(BaseModel):
    theoryOpened: bool = False
    completedPractices: list[int] = Field(default_factory=list)


class JourneyProgressUpdate(BaseModel):
    topicId: str = Field(min_length=1)
    progress: JourneyTopicProgressUpdate


class NotificationPreference(BaseModel):
    label: str
    enabled: bool


class NotificationPreferencesUpdate(BaseModel):
    preferences: list[NotificationPreference] = Field(default_factory=list)
