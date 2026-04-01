"""Database service using SQLAlchemy"""
from typing import List, Optional, Literal
import ast
from copy import deepcopy
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.core.locales import COURSE_TRANSLATIONS, MISSION_TRANSLATIONS, normalize_language, translate_ru_to_kz
from app.models.models import User, Post, Course, Mission, Achievement, LeaderboardEntry
from app.schemas.requests import (
    UserUpdate,
    PostCreate,
    MissionSubmit,
    CourseCreate,
    CourseUpdate,
    MissionCreate,
    MissionUpdate,
    JourneyPracticeSubmit,
)


COURSE_SEASON_SIZE = 4
MAX_CONSECUTIVE_FAILS = 3
MISSION_COOLDOWN_SECONDS = 60
MAX_OUTPUT_CHARS = 8000

BLOCKED_IMPORTS = {
    "os",
    "sys",
    "subprocess",
    "socket",
    "pathlib",
    "shutil",
    "ctypes",
    "multiprocessing",
    "threading",
    "asyncio",
    "resource",
    "signal",
    "inspect",
    "importlib",
    "builtins",
}

BLOCKED_CALLS = {
    "open",
    "exec",
    "eval",
    "compile",
    "__import__",
    "breakpoint",
}

BLOCKED_ATTRIBUTES = {
    "__subclasses__",
    "__globals__",
    "__code__",
    "__class__",
    "__dict__",
    "__mro__",
}

DEFAULT_UI_DATA = {
    "sidebarNavItems": [
        {"view": "DASHBOARD", "label": "Главная", "icon": "LayoutGrid", "mobile": True},
        {"view": "COURSES", "label": "Курсы", "icon": "Map", "mobile": True},
        {"view": "COURSE_JOURNEY", "label": "Обучение", "icon": "Code", "mobile": True},
        {"view": "AI_CHAT", "label": "Оракул", "icon": "Bot", "mobile": True},
        {"view": "PROFILE", "label": "Профиль", "icon": "User", "mobile": True},
        {"view": "LEADERBOARD", "label": "Рейтинг", "icon": "Trophy", "mobile": False},
        {"view": "ACHIEVEMENTS", "label": "Достижения", "icon": "Sparkles", "mobile": False},
        {"view": "SETTINGS", "label": "Настройки", "icon": "Shield", "mobile": False},
    ],
    "texts": {
        "sidebar": {
            "logoLine1": "Py",
            "logoLine2": "Path",
        },
        "header": {
            "xpLabel": "XP",
            "searchPlaceholder": "Поиск",
        },
        "editor": {
            "missionTab": "Задание",
            "filesTab": "Файлы",
            "goalsTitle": "Цели",
            "knowledgeBaseTitle": "Теория",
            "expectedOutputLabel": "Ожидаемый вывод",
            "commonErrorsTitle": "Частые ошибки",
            "miniCheckTitle": "Мини-проверка",
            "askMentor": "Спросить у наставника",
            "run": "Запуск",
            "terminalTitle": "Терминал",
            "successTitle": "Задание выполнено!",
            "successXp": "+XP начислен",
            "botMessages": {
                "initial": "Я рядом. Могу подсказать следующий шаг 👋",
                "running": "Проверяю код и результаты выполнения…",
                "success": "Отлично! Всё выполнено верно ✅",
                "error": "Есть неточность. Попробуем исправить вместе.",
            },
        },
    },
}


class DatabaseService:
    """Service for database operations"""

    def __init__(self, db: Session):
        self.db = db

    def _get_user_grade(self, user: Optional[User]) -> str:
        if not user:
            return "8"
        settings = self._get_user_settings(user)
        grade = str(settings.get("currentGrade") or "8")
        return grade if grade in {"pre", "8", "9"} else "8"

    def _course_grade_rank(self, grade: str | None) -> int:
        return {"pre": 0, "8": 1, "9": 2}.get(str(grade or "common"), 1)

    def _is_course_visible_for_grade(self, user_grade: str, course_grade: str | None) -> bool:
        if not course_grade or course_grade == "common":
            return True
        return self._course_grade_rank(course_grade) <= self._course_grade_rank(user_grade)

    def _course_content(self, course: Course) -> dict:
        theory_content = course.theory_content if isinstance(course.theory_content, dict) else {}
        quiz_bank = course.quiz_bank if isinstance(course.quiz_bank, (list, dict)) else []
        reward_preview = course.reward_preview if isinstance(course.reward_preview, dict) else {}
        if isinstance(quiz_bank, dict):
            quiz_count_source = quiz_bank.get("ru") or quiz_bank.get("kz") or []
            quiz_count = len(quiz_count_source) if isinstance(quiz_count_source, list) else 0
        else:
            quiz_count = len(quiz_bank)
        return {
            "theoryContent": theory_content,
            "quizBank": quiz_bank,
            "rewardPreview": reward_preview,
            "quizCount": quiz_count,
        }

    def _localize_course_content(self, content: dict, language: str) -> dict:
        language_key = normalize_language(language)

        theory_content = content.get("theoryContent") if isinstance(content.get("theoryContent"), dict) else {}
        if isinstance(theory_content, dict) and ("ru" in theory_content or "kz" in theory_content):
            selected_theory = theory_content.get(language_key) or theory_content.get("ru") or theory_content.get("kz") or {}
        elif language_key == "kz" and isinstance(theory_content, dict):
            selected_theory = {
                "intro": translate_ru_to_kz(str(theory_content.get("intro") or "")),
                "sections": [translate_ru_to_kz(str(item)) for item in (theory_content.get("sections") or [])],
                "example": translate_ru_to_kz(str(theory_content.get("example") or "")),
                "takeaways": [translate_ru_to_kz(str(item)) for item in (theory_content.get("takeaways") or [])],
                "focus": translate_ru_to_kz(str(theory_content.get("focus") or "")),
            }
        else:
            selected_theory = theory_content

        quiz_bank = content.get("quizBank")
        if isinstance(quiz_bank, dict) and ("ru" in quiz_bank or "kz" in quiz_bank):
            selected_quiz_bank = quiz_bank.get(language_key) or quiz_bank.get("ru") or quiz_bank.get("kz") or []
        elif language_key == "kz" and isinstance(quiz_bank, list):
            selected_quiz_bank = [
                {
                    **item,
                    "question": translate_ru_to_kz(str(item.get("question") or "")),
                    "options": [translate_ru_to_kz(str(option)) for option in (item.get("options") or [])],
                    "explanation": translate_ru_to_kz(str(item.get("explanation") or "")),
                }
                for item in quiz_bank
                if isinstance(item, dict)
            ]
        else:
            selected_quiz_bank = quiz_bank if isinstance(quiz_bank, list) else []

        reward_preview = content.get("rewardPreview") if isinstance(content.get("rewardPreview"), dict) else {}
        if language_key == "kz" and isinstance(reward_preview, dict):
            reward_preview = {
                **reward_preview,
                "badge": translate_ru_to_kz(str(reward_preview.get("badge") or "")),
                "medal": translate_ru_to_kz(str(reward_preview.get("medal") or "")),
            }

        return {
            "theoryContent": selected_theory,
            "quizBank": selected_quiz_bank,
            "rewardPreview": reward_preview,
            "quizCount": len(selected_quiz_bank) if isinstance(selected_quiz_bank, list) else 0,
        }

    # User operations
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_all_users(self, skip: int = 0, limit: int = 200) -> list[User]:
        """Get all registered users (admin only)."""
        return self.db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    def create_user(self, user_data: dict) -> User:
        """Create new user"""
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user_id: str, update_data: UserUpdate) -> Optional[User]:
        """Update user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None

        update_dict = update_data.model_dump(exclude_unset=True)
        settings_update = update_dict.pop("settings", None)
        for key, value in update_dict.items():
            setattr(user, key, value)

        if isinstance(settings_update, dict):
            settings = dict(user.settings or {})
            settings.update(settings_update)
            user.settings = settings

        self.db.commit()
        self.db.refresh(user)
        return user

    # Post operations
    def get_posts(self, sort: str = "popular", tag: Optional[str] = None) -> List[Post]:
        """Get all posts with optional filtering"""
        query = self.db.query(Post)
        
        if tag:
            query = query.filter(Post.tags.contains([tag]))

        if sort == "popular":
            query = query.order_by(Post.likes.desc())
        else:  # fresh
            query = query.order_by(Post.created_at.desc())

        return query.all()

    def create_post(self, post_data: PostCreate, user: Optional[User] = None) -> Post:
        """Create new post"""
        payload = post_data.model_dump()
        payload.setdefault("author_name", (user.name if user and user.name else "Ученик"))
        payload.setdefault("author_avatar", (user.avatar if user and user.avatar else "https://api.dicebear.com/7.x/avataaars/svg?seed=PyPath"))
        payload.setdefault("author_level", int(user.level_num if user and user.level_num else 1))
        payload.setdefault("time", "Только что")
        payload.setdefault("likes", 0)
        payload.setdefault("comments", 0)
        payload.setdefault("liked", False)

        post = Post(**payload)
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return post

    def like_post(self, post_id: int) -> Optional[Post]:
        """Toggle like on post"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            return None

        if post.liked:
            post.likes -= 1
            post.liked = False
        else:
            post.likes += 1
            post.liked = True

        self.db.commit()
        self.db.refresh(post)
        return post

    # Course operations
    def _get_courses_ordered(self) -> List[Course]:
        return self.db.query(Course).order_by(Course.id.asc()).all()

    def _infer_course_meta(self, course: Course) -> dict:
        title = str(course.title or '').lower()
        chapter_match = re.search(r"глава\s*(\d+)", title)
        chapter_number = int(chapter_match.group(1)) if chapter_match else None

        if chapter_number in {1, 2}:
            return {"gradeBand": "pre", "section": "Подготовка к 8/9: базовые шаги"}
        if chapter_number in {3, 4}:
            return {"gradeBand": "8", "section": "8 класс: условия и циклы"}
        if chapter_number in {5, 6} or 'босс' in title:
            return {"gradeBand": "9", "section": "9 класс: функции и проект"}
        if chapter_number in {7, 8, 9}:
            return {"gradeBand": "9", "section": "10 класс: массивы"}
        if chapter_number in {10, 11}:
            return {"gradeBand": "9", "section": "11 класс: PyGame"}
        if chapter_number == 12:
            return {"gradeBand": "9", "section": "11 класс: финальный проект"}
        if chapter_number in {13, 14}:
            return {"gradeBand": "9", "section": "12 класс: данные и файлы"}
        if chapter_number == 15:
            return {"gradeBand": "9", "section": "12 класс: ООП"}
        if chapter_number == 16:
            return {"gradeBand": "9", "section": "12 класс: capstone"}
        if chapter_number == 17:
            return {"gradeBand": "8", "section": "8 класс: практический Python"}
        if chapter_number == 18:
            return {"gradeBand": "pre", "section": "8/9 класс: переходный модуль"}
        return {"gradeBand": "common", "section": "Общий модуль"}

    def _localize_course_item(self, item: dict, language: str) -> dict:
        if normalize_language(language) != "kz":
            return item

        course_id = int(item.get("id") or 0)
        translated = COURSE_TRANSLATIONS.get("kz", {}).get(course_id)
        if not translated:
            return item

        unlock_requirement = item.get("unlockRequirement")
        if unlock_requirement == "Завершите предыдущий сезон":
            unlock_requirement = "Алдыңғы маусымды аяқтаңыз"
        elif unlock_requirement == "Завершите предыдущий курс":
            unlock_requirement = "Алдыңғы курсты аяқтаңыз"

        return {
            **item,
            "title": translated.get("title", item.get("title")),
            "description": translated.get("description", item.get("description")),
            "section": translated.get("section", item.get("section")),
            "unlockRequirement": unlock_requirement,
        }

    def _localize_mission_item(self, mission: Mission, previous_id: Optional[str], next_id: Optional[str], language: str) -> dict:
        base = {
            "id": mission.id,
            "title": mission.title,
            "chapter": mission.chapter,
            "description": mission.description,
            "difficulty": mission.difficulty,
            "xpReward": mission.xp_reward,
            "objectives": mission.objectives,
            "starterCode": mission.starter_code,
            "testCases": mission.test_cases,
            "hints": mission.hints,
            "previousMissionId": previous_id,
            "nextMissionId": next_id,
        }

        if normalize_language(language) != "kz":
            return base

        translated = MISSION_TRANSLATIONS.get("kz", {}).get(mission.id)
        if not translated:
            return base

        objectives = base.get("objectives") if isinstance(base.get("objectives"), list) else []
        translated_objectives = translated.get("objectives", [])
        localized_objectives = []
        for index, objective in enumerate(objectives):
            if isinstance(objective, dict):
                localized_objectives.append(
                    {
                        **objective,
                        "text": translated_objectives[index] if index < len(translated_objectives) else objective.get("text"),
                    }
                )
            else:
                localized_objectives.append(objective)

        return {
            **base,
            "title": translated.get("title", base["title"]),
            "chapter": translated.get("chapter", base["chapter"]),
            "description": translated.get("description", base["description"]),
            "objectives": localized_objectives,
            "hints": translated.get("hints", base["hints"]),
        }

    def _get_course_season(self, course_id: int) -> int:
        return ((course_id - 1) // COURSE_SEASON_SIZE) + 1

    def _parse_course_id_from_chapter(self, chapter: Optional[str]) -> Optional[int]:
        if not chapter:
            return None
        match = re.search(r"(\d+)", str(chapter))
        if not match:
            return None
        try:
            parsed = int(match.group(1))
            return parsed if parsed > 0 else None
        except (TypeError, ValueError):
            return None

    def _get_mission_counts_by_course(self) -> dict[int, int]:
        counts: dict[int, int] = {}
        for mission in self._get_mission_models():
            course_id = self._parse_course_id_from_chapter(mission.chapter)
            if not course_id:
                continue
            counts[course_id] = counts.get(course_id, 0) + 1
        return counts

    def _get_mission_models(self) -> List[Mission]:
        return self.db.query(Mission).order_by(Mission.id.asc()).all()

    def _normalize_user_course_progress(self, raw_progress: dict, courses: List[Course]) -> dict:
        normalized: dict = {}
        raw_progress = raw_progress if isinstance(raw_progress, dict) else {}
        ordered_courses = sorted(courses, key=lambda c: c.id)

        for index, course in enumerate(ordered_courses):
            key = str(course.id)
            source = raw_progress.get(key) if isinstance(raw_progress.get(key), dict) else {}

            total_lessons = int(course.total_lessons or 1)
            if total_lessons <= 0:
                total_lessons = 1

            completed_lessons = int(source.get("completedLessons", 0) or 0)
            completed_lessons = max(0, min(completed_lessons, total_lessons))

            completed = bool(source.get("completed", False)) or completed_lessons >= total_lessons
            if completed:
                completed_lessons = total_lessons

            stored_unlocked = source.get("unlocked")
            unlocked = bool(stored_unlocked) if isinstance(stored_unlocked, bool) else (index == 0)
            if index > 0:
                prev_key = str(ordered_courses[index - 1].id)
                if normalized.get(prev_key, {}).get("completed"):
                    unlocked = True

            if completed:
                unlocked = True

            stars = int(source.get("stars", 0) or 0)
            stars = max(0, min(stars, 3))

            normalized[key] = {
                "completedLessons": completed_lessons,
                "totalLessons": total_lessons,
                "progress": int(round((completed_lessons / total_lessons) * 100)),
                "stars": stars,
                "completed": completed,
                "unlocked": unlocked,
                "season": self._get_course_season(course.id),
                "updatedAt": source.get("updatedAt"),
            }

        return normalized

    def _get_user_course_progress(self, user: Optional[User], courses: List[Course]) -> dict:
        if not user:
            return {}
        settings = self._get_user_settings(user)
        raw_progress = settings.get("course_progress")
        return self._normalize_user_course_progress(raw_progress, courses)

    def _save_user_course_progress(self, user: Optional[User], progress: dict) -> None:
        if not user:
            return
        settings = self._get_user_settings(user)
        settings["course_progress"] = progress
        user.settings = settings

    def _get_active_course_id(self, progress: dict, requested_course_id: Optional[int] = None) -> Optional[int]:
        if requested_course_id is not None:
            requested = progress.get(str(requested_course_id))
            if isinstance(requested, dict) and requested.get("unlocked") and not requested.get("completed"):
                return requested_course_id

        for key, entry in progress.items():
            if entry.get("unlocked") and not entry.get("completed"):
                return int(key)

        unlocked_ids = [int(key) for key, entry in progress.items() if entry.get("unlocked")]
        return max(unlocked_ids) if unlocked_ids else None

    def _score_course_stars(self, completed_lessons: int, total_lessons: int) -> int:
        if total_lessons <= 0:
            return 0
        ratio = completed_lessons / total_lessons
        if ratio >= 1:
            return 3
        if ratio >= 0.66:
            return 2
        if ratio > 0:
            return 1
        return 0

    def _is_season_completed(self, progress: dict, season: int) -> bool:
        season_items = [entry for entry in progress.values() if entry.get("season") == season]
        return bool(season_items) and all(item.get("completed") for item in season_items)

    def _advance_course_progress(
        self,
        user: Optional[User],
        requested_course_id: Optional[int] = None,
        completed_mission_id: Optional[str] = None,
        count_completion: bool = False,
    ) -> dict:
        courses = self._get_courses_ordered()
        if not courses or not user:
            return {
                "lessonAdvanced": False,
                "courseCompleted": False,
                "nextCourseUnlocked": False,
                "activeCourseId": None,
                "activeSeason": None,
                "nextSeasonUnlocked": False,
            }

        progress = self._get_user_course_progress(user, courses)
        active_course_id = self._get_active_course_id(progress, requested_course_id)
        if active_course_id is None:
            return {
                "lessonAdvanced": False,
                "courseCompleted": False,
                "nextCourseUnlocked": False,
                "activeCourseId": None,
                "activeSeason": None,
                "nextSeasonUnlocked": False,
            }

        active_key = str(active_course_id)
        active_entry = progress.get(active_key)
        if not isinstance(active_entry, dict):
            return {
                "lessonAdvanced": False,
                "courseCompleted": False,
                "nextCourseUnlocked": False,
                "activeCourseId": active_course_id,
                "activeSeason": None,
                "nextSeasonUnlocked": False,
            }

        settings = self._get_user_settings(user)
        raw_completed = settings.get("course_completed_missions")
        completed_by_course = raw_completed if isinstance(raw_completed, dict) else {}
        active_completed = completed_by_course.get(active_key)
        if not isinstance(active_completed, list):
            active_completed = []
        active_completed = [str(item) for item in active_completed if item]

        mission_added = False
        if count_completion and completed_mission_id:
            mission_id_str = str(completed_mission_id)
            if mission_id_str not in active_completed:
                active_completed.append(mission_id_str)
                mission_added = True

        completed_by_course[active_key] = active_completed

        mission_counts = self._get_mission_counts_by_course()
        configured_total_lessons = int(active_entry.get("totalLessons", 1) or 1)
        configured_total_lessons = max(1, configured_total_lessons)
        mission_total_lessons = int(mission_counts.get(active_course_id, 0) or 0)
        total_lessons = (
            max(1, min(configured_total_lessons, mission_total_lessons))
            if mission_total_lessons > 0
            else configured_total_lessons
        )

        previous_completed_lessons = int(active_entry.get("completedLessons", 0) or 0)
        completed_lessons = min(len(active_completed), total_lessons)

        lesson_advanced = mission_added and completed_lessons > previous_completed_lessons
        course_completed_now = False
        next_course_unlocked = False

        active_entry["completedLessons"] = completed_lessons
        active_entry["totalLessons"] = total_lessons
        active_entry["progress"] = int(round((completed_lessons / total_lessons) * 100))
        active_entry["stars"] = max(int(active_entry.get("stars", 0) or 0), self._score_course_stars(completed_lessons, total_lessons))
        active_entry["updatedAt"] = datetime.utcnow().isoformat()

        if completed_lessons >= total_lessons and not active_entry.get("completed"):
            active_entry["completed"] = True
            course_completed_now = True

        ordered_ids = sorted(int(key) for key in progress.keys())

        # Enforce deterministic unlock chain based on previous course completion
        for index, course_id in enumerate(ordered_ids):
            key = str(course_id)
            entry = progress.get(key)
            if not isinstance(entry, dict):
                continue
            if index == 0:
                entry["unlocked"] = True
                continue
            prev_entry = progress.get(str(ordered_ids[index - 1]))
            should_unlock = bool(prev_entry.get("completed")) if isinstance(prev_entry, dict) else False
            if should_unlock:
                entry["unlocked"] = True

        if course_completed_now and active_course_id in ordered_ids:
            current_index = ordered_ids.index(active_course_id)
            if current_index < len(ordered_ids) - 1:
                next_key = str(ordered_ids[current_index + 1])
                next_entry = progress.get(next_key)
                if isinstance(next_entry, dict) and not next_entry.get("unlocked"):
                    next_entry["unlocked"] = True
                    next_entry["updatedAt"] = datetime.utcnow().isoformat()
                    next_course_unlocked = True

        settings["course_progress"] = progress
        settings["course_completed_missions"] = completed_by_course

        active_season = active_entry.get("season")
        next_season_unlocked = False
        if isinstance(active_season, int):
            next_season_unlocked = self._is_season_completed(progress, active_season)

            season_progress = settings.get("season_progress") if isinstance(settings.get("season_progress"), dict) else {}
            season_progress[str(active_season)] = {
                "completed": bool(next_season_unlocked),
                "updatedAt": datetime.utcnow().isoformat(),
            }
            settings["season_progress"] = season_progress

            current_season = int(settings.get("current_season") or 1)
            if next_season_unlocked and current_season <= active_season:
                settings["current_season"] = active_season + 1

        user.settings = settings

        return {
            "lessonAdvanced": lesson_advanced,
            "courseCompleted": bool(active_entry.get("completed")),
            "nextCourseUnlocked": next_course_unlocked,
            "activeCourseId": active_course_id,
            "activeSeason": active_season,
            "nextSeasonUnlocked": next_season_unlocked,
            "activeCourseProgress": active_entry.get("progress", 0),
            "completedLessons": active_entry.get("completedLessons", 0),
            "totalLessons": active_entry.get("totalLessons", 0),
        }

    def get_courses(self, user: Optional[User] = None, language: str = "ru") -> List[dict]:
        """Get all courses with per-user progression when authenticated"""
        courses = self._get_courses_ordered()
        progress = self._get_user_course_progress(user, courses) if user else {}
        ordered_ids = [course.id for course in courses]
        user_grade = self._get_user_grade(user)

        current_season = 1
        season_progress: dict = {}
        if user:
            settings = self._get_user_settings(user)
            try:
                current_season = int(settings.get("current_season") or 1)
            except (TypeError, ValueError):
                current_season = 1
            season_progress = settings.get("season_progress") if isinstance(settings.get("season_progress"), dict) else {}

        response: list[dict] = []
        for index, course in enumerate(courses):
            season = self._get_course_season(course.id)
            item = {
                "id": course.id,
                "title": course.title,
                "description": course.description,
                "gradeBand": self._infer_course_meta(course).get("gradeBand"),
                "section": self._infer_course_meta(course).get("section"),
                "progress": int(course.progress or 0),
                "totalLessons": int(course.total_lessons or 0),
                "icon": course.icon,
                "color": course.color,
                "difficulty": course.difficulty,
                "stars": int(course.stars or 0),
                "isBoss": bool(course.is_boss),
                "locked": bool(course.locked),
                **self._localize_course_content(self._course_content(course), language),
                "season": season,
                "status": "locked" if course.locked else ("completed" if int(course.progress or 0) >= 100 else "in_progress"),
                "completedLessons": 0,
                "nextCourseId": ordered_ids[index + 1] if index < len(ordered_ids) - 1 else None,
                "unlockRequirement": "",
                "seasonUnlocked": True,
                "seasonCompleted": bool(season_progress.get(str(season), {}).get("completed")),
                "currentSeason": current_season,
            }

            if user:
                user_progress = progress.get(str(course.id), {})
                season_unlocked = season <= current_season
                is_locked = (not bool(user_progress.get("unlocked"))) or (not season_unlocked) or (not self._is_course_visible_for_grade(user_grade, item.get("gradeBand")))
                is_completed = bool(user_progress.get("completed"))
                item.update(
                    {
                        "progress": int(user_progress.get("progress", 0) or 0),
                        "stars": int(user_progress.get("stars", 0) or 0),
                        "locked": is_locked,
                        "status": "locked" if is_locked else ("completed" if is_completed else "in_progress"),
                        "completedLessons": int(user_progress.get("completedLessons", 0) or 0),
                        "totalLessons": int(user_progress.get("totalLessons", course.total_lessons or 0) or 0),
                        "unlockRequirement": "" if not is_locked else ("Завершите предыдущий сезон" if not season_unlocked else "Завершите предыдущий курс"),
                        "seasonUnlocked": season_unlocked,
                        "seasonCompleted": bool(season_progress.get(str(season), {}).get("completed")),
                        "rewardPreview": course.reward_preview if isinstance(course.reward_preview, dict) else {},
                    }
                )
            else:
                item["rewardPreview"] = course.reward_preview if isinstance(course.reward_preview, dict) else {}

            response.append(self._localize_course_item(item, language))

        return response

    def get_progress_charts(self, user: Optional[User] = None) -> dict:
        """Build chart-ready progress data: line by tasks and topic completion."""
        if not user:
            return {
                "lineByTasks": [],
                "topicProgress": [],
                "updatedAt": None,
            }

        settings = self._get_user_settings(user)
        raw_events = settings.get("progress_events")
        events = raw_events if isinstance(raw_events, list) else []

        successful = [item for item in events if isinstance(item, dict) and item.get("success")]
        line_by_tasks = []
        for index, item in enumerate(successful):
            xp_total = item.get("xpTotal")
            try:
                level_value = int(xp_total if xp_total is not None else (index + 1) * 10)
            except (TypeError, ValueError):
                level_value = (index + 1) * 10
            line_by_tasks.append(
                {
                    "task": index + 1,
                    "level": level_value,
                    "missionId": str(item.get("missionId") or ""),
                }
            )

        missions = self._get_mission_models()
        totals_by_topic: dict[str, int] = {}
        completed_by_topic: dict[str, int] = {}

        mission_progress = settings.get("mission_progress") if isinstance(settings.get("mission_progress"), dict) else {}

        for mission in missions:
            topic = str(mission.chapter or "Тема")
            totals_by_topic[topic] = totals_by_topic.get(topic, 0) + 1
            progress_item = mission_progress.get(mission.id)
            if isinstance(progress_item, dict) and progress_item.get("completed"):
                completed_by_topic[topic] = completed_by_topic.get(topic, 0) + 1

        topic_progress = []
        for topic, total in totals_by_topic.items():
            done = completed_by_topic.get(topic, 0)
            percent = int(round((done / total) * 100)) if total > 0 else 0
            topic_progress.append(
                {
                    "topic": topic,
                    "progress": percent,
                    "completed": done,
                    "total": total,
                }
            )

        topic_progress.sort(key=lambda item: item["topic"])
        updated_at = successful[-1].get("timestamp") if successful else None
        return {
            "lineByTasks": line_by_tasks,
            "topicProgress": topic_progress,
            "updatedAt": updated_at,
        }

    def get_course_by_id(self, course_id: int) -> Optional[Course]:
        """Get course by ID"""
        return self.db.query(Course).filter(Course.id == course_id).first()

    def serialize_course(self, course: Course, language: str = "ru", user: Optional[User] = None) -> dict:
        course_meta = self._infer_course_meta(course)
        item = {
            "id": course.id,
            "title": course.title,
            "description": course.description,
            "gradeBand": course_meta.get("gradeBand"),
            "section": course_meta.get("section"),
            "progress": int(course.progress or 0),
            "totalLessons": int(course.total_lessons or 0),
            "icon": course.icon,
            "color": course.color,
            "difficulty": course.difficulty,
            "stars": int(course.stars or 0),
            "isBoss": bool(course.is_boss),
            "locked": bool(course.locked),
            **self._localize_course_content(self._course_content(course), language),
            "rewardPreview": course.reward_preview if isinstance(course.reward_preview, dict) else {},
        }

        if user:
            progress = self._get_user_course_progress(user, [course])
            user_progress = progress.get(str(course.id), {})
            season = self._get_course_season(course.id)
            current_season = 1
            season_progress = {}
            settings = self._get_user_settings(user)
            try:
                current_season = int(settings.get("current_season") or 1)
            except (TypeError, ValueError):
                current_season = 1
            if isinstance(settings.get("season_progress"), dict):
                season_progress = settings.get("season_progress")
            season_unlocked = season <= current_season
            is_locked = (not bool(user_progress.get("unlocked"))) or (not season_unlocked) or (not self._is_course_visible_for_grade(self._get_user_grade(user), course_meta.get("gradeBand")))
            is_completed = bool(user_progress.get("completed"))
            item.update(
                {
                    "progress": int(user_progress.get("progress", 0) or 0),
                    "stars": int(user_progress.get("stars", 0) or 0),
                    "locked": is_locked,
                    "status": "locked" if is_locked else ("completed" if is_completed else "in_progress"),
                    "completedLessons": int(user_progress.get("completedLessons", 0) or 0),
                    "totalLessons": int(user_progress.get("totalLessons", course.total_lessons or 0) or 0),
                    "unlockRequirement": "" if not is_locked else ("Завершите предыдущий сезон" if not season_unlocked else "Завершите предыдущий курс"),
                    "seasonUnlocked": season_unlocked,
                    "seasonCompleted": bool(season_progress.get(str(season), {}).get("completed")),
                    "currentSeason": current_season,
                }
            )

        return self._localize_course_item(item, language)

    def get_course_journey(self, user: Optional[User] = None, language: str = "ru") -> list[dict]:
        """Return structured journey topics: theory first, then 6/7 practices."""
        courses = self.get_courses(user, language)
        missions = self.get_missions(language)
        topics: list[dict] = []

        theory_by_course = {
            1: {
                "ru": "Python начинается с вывода текста на экран. Сначала важно понять print, кавычки и запуск простых программ.",
                "kz": "Python тілінде ең алдымен экранға мәтін шығаруды үйренеміз. print командасын, тырнақшаларды және алғашқы бағдарламаларды түсіну маңызды.",
            },
            2: {
                "ru": "Переменные хранят данные, а типы помогают понять, с чем работает программа: со строками, числами или логикой.",
                "kz": "Айнымалылар деректерді сақтайды, ал түрлер бағдарлама нені өңдеп жатқанын түсінуге көмектеседі: жолдар, сандар немесе логика.",
            },
            3: {
                "ru": "Условия if / else позволяют программе выбирать ветку выполнения в зависимости от результата проверки.",
                "kz": "if / else шарттары тексеру нәтижесіне қарай бағдарламаның қай тармақты орындайтынын анықтайды.",
            },
            4: {
                "ru": "Циклы for и while повторяют действия и помогают проходить по спискам, диапазонам и пошаговым задачам.",
                "kz": "for және while циклдері әрекеттерді қайталайды және тізімдер, диапазондар мен қадамдық тапсырмалармен жұмыс істеуге көмектеседі.",
            },
            5: {
                "ru": "Функции помогают собирать повторяющийся код в отдельные блоки, чтобы его было проще читать и переиспользовать.",
                "kz": "Функциялар қайталанатын кодты бөлек блоктарға жинайды, сондықтан оны оқу және қайта қолдану жеңіл болады.",
            },
            6: {
                "ru": "Мини-проект соединяет все базовые навыки: вывод, переменные, условия, циклы и функции.",
                "kz": "Мини-жоба барлық базалық дағдыларды біріктіреді: шығару, айнымалылар, шарттар, циклдер және функциялар.",
            },
        }

        theory_details_by_course = {
            1: {
                "ru": [
                    "print выводит текст и значения на экран.",
                    "Строки нужно писать в кавычках.",
                    "Отступы и скобки помогают избежать ошибок в первых программах.",
                ],
                "kz": [
                    "print мәтінді және мәндерді экранға шығарады.",
                    "Жолдар тырнақшамен жазылады.",
                    "Басымдық пен жақшалар алғашқы бағдарламаларда қателікті азайтады.",
                ],
                "example": {
                    "ru": 'print("Привет, мир!")',
                    "kz": 'print("Сәлем, әлем!")',
                },
                "hint": {
                    "ru": "Сначала научитесь получать простой вывод, потом переходите к переменным.",
                    "kz": "Алдымен қарапайым шығару жасауды үйреніп, содан кейін айнымалыларға өт.",
                },
            },
            2: {
                "ru": [
                    "Переменная хранит значение, чтобы использовать его позже.",
                    "Тип помогает понять, можно ли складывать, сравнивать или объединять данные.",
                    "Числа и строки обрабатываются по-разному.",
                ],
                "kz": [
                    "Айнымалы мәнді кейін қолдану үшін сақтайды.",
                    "Түр деректерді қосуға, салыстыруға немесе біріктіруге болатынын түсіндіреді.",
                    "Сандар мен жолдар әртүрлі өңделеді.",
                ],
                "example": {
                    "ru": "\n".join(['name = "Аня"', 'age = 14', 'print(name, age)']),
                    "kz": "\n".join(['name = "Алия"', 'age = 14', 'print(name, age)']),
                },
                "hint": {
                    "ru": "Если данные нужны позже, сохраните их в переменную сразу.",
                    "kz": "Егер дерек кейін керек болса, оны бірден айнымалыға сақтаңыз.",
                },
            },
            3: {
                "ru": [
                    "if запускает блок, когда условие истинно.",
                    "else нужен для случая, когда условие не сработало.",
                    "Сравнения строятся на операторах >, <, >=, <=, ==, !=.",
                ],
                "kz": [
                    "if шарт ақиқат болғанда блокты іске қосады.",
                    "else шарт орындалмаған жағдайға арналған.",
                    "Салыстыру үшін >, <, >=, <=, ==, != операторлары қолданылады.",
                ],
                "example": {
                    "ru": "\n".join(['age = 12', 'if age >= 10:', '    print("Можно")', 'else:', '    print("Пока рано")']),
                    "kz": "\n".join(['age = 12', 'if age >= 10:', '    print("Рұқсат")', 'else:', '    print("Әлі ерте")']),
                },
                "hint": {
                    "ru": "Сначала формулируйте условие словами, потом переводите в код.",
                    "kz": "Алдымен шартты сөзбен айтыңыз, содан кейін оны кодқа аударыңыз.",
                },
            },
            4: {
                "ru": [
                    "for удобен, когда нужно пройтись по списку или диапазону.",
                    "while повторяет блок, пока условие остаётся истинным.",
                    "Цикл заканчивается, когда меняется условие или диапазон.",
                ],
                "kz": [
                    "for тізім немесе диапазон бойымен өту керек болғанда ыңғайлы.",
                    "while шарт ақиқат болып тұрғанда блокты қайталайды.",
                    "Цикл шарт немесе диапазон өзгергенде аяқталады.",
                ],
                "example": {
                    "ru": "\n".join(['for number in range(3):', '    print(number)', '', 'count = 3', 'while count > 0:', '    count -= 1']),
                    "kz": "\n".join(['for number in range(3):', '    print(number)', '', 'count = 3', 'while count > 0:', '    count -= 1']),
                },
                "hint": {
                    "ru": "Если заранее знаете количество повторений, начните с for.",
                    "kz": "Қайталану саны белгілі болса, алдымен for қолданып көріңіз.",
                },
            },
            5: {
                "ru": [
                    "Функция собирает код в отдельный блок с именем.",
                    "Параметры передают данные внутрь функции.",
                    "return возвращает результат обратно в программу.",
                ],
                "kz": [
                    "Функция кодты атауы бар бөлек блокқа жинайды.",
                    "Параметрлер деректерді функцияның ішіне береді.",
                    "return нәтижені қайтарады.",
                ],
                "example": {
                    "ru": "\n".join(['def add(a, b):', '    return a + b', '', 'print(add(2, 3))']),
                    "kz": "\n".join(['def add(a, b):', '    return a + b', '', 'print(add(2, 3))']),
                },
                "hint": {
                    "ru": "Если код повторяется, его почти всегда стоит вынести в функцию.",
                    "kz": "Егер код қайталанса, оны функцияға бөлуге болады.",
                },
            },
            6: {
                "ru": [
                    "В проекте важно связать все изученные конструкции в одну логичную цепочку.",
                    "Сначала вывод и переменные, потом условия, затем циклы и функции.",
                    "Мини-проект — это проверка, что основы уже работают вместе.",
                ],
                "kz": [
                    "Жобада үйренген барлық құрылымды бір логикалық тізбекке біріктіру маңызды.",
                    "Алдымен шығару мен айнымалылар, кейін шарттар, соңында циклдер мен функциялар.",
                    "Мини-жоба негіздердің бірге жұмыс істейтінін тексереді.",
                ],
                "example": {
                    "ru": "\n".join(['def greet(name):', '    print("Привет,", name)', '', 'for i in range(3):', '    greet("друг")']),
                    "kz": "\n".join(['def greet(name):', '    print("Сәлем,", name)', '', 'for i in range(3):', '    greet("дос")']),
                },
                "hint": {
                    "ru": "Собирайте проект из маленьких шагов и проверяйте каждый блок отдельно.",
                    "kz": "Жобаны шағын қадамдармен құрып, әр блокты бөлек тексеріңіз.",
                },
            },
        }

        practice_catalog_by_course = {
            1: [
                {"ru": {"title": "Приветствие и print", "description": "Выведи приветствие и имя ученика на экран."}, "kz": {"title": "Сәлем және print", "description": "Экранға сәлемдесу мен оқушының атын шығар."}},
                {"ru": {"title": "Переменные name и age", "description": "Создай строковую и числовую переменные."}, "kz": {"title": "name және age айнымалылары", "description": "Жолдық және сандық айнымалыларды жаса."}},
                {"ru": {"title": "Строки и пробел", "description": "Собери полное имя из двух строк."}, "kz": {"title": "Жолдарды біріктіру", "description": "Екі жолдан толық атты құрастыр."}},
                {"ru": {"title": "Числа и сумма", "description": "Сложи два числа и сохрани результат."}, "kz": {"title": "Сандар қосындысы", "description": "Екі санды қосып, нәтижені сақта."}},
                {"ru": {"title": "type() и str()", "description": "Проверь тип и преобразуй число в строку."}, "kz": {"title": "type() және str()", "description": "Түрді тексеріп, санды жолға айналдыр."}},
                {"ru": {"title": "Мини-калькулятор", "description": "Считай два значения через input и выведи сумму."}, "kz": {"title": "Шағын калькулятор", "description": "input арқылы екі мәнді сұрап, қосындысын шығар."}},
            ],
            2: [
                {"ru": {"title": "Преобразование в int", "description": "Преобразуй строку с числом в int."}, "kz": {"title": "int-ке түрлендіру", "description": "Сан жазылған жолды int түріне айналдыр."}},
                {"ru": {"title": "Строка и число", "description": "Собери текст из строки и числа без ошибки типов."}, "kz": {"title": "Жол және сан", "description": "Түр қателігінсіз жол мен саннан мәтін құрастыр."}},
                {"ru": {"title": "Проверка типа", "description": "Узнай тип значения и сохрани его в переменную."}, "kz": {"title": "Түрді тексеру", "description": "Мәннің түрін анықтап, айнымалыға сақта."}},
                {"ru": {"title": "Ввод возраста", "description": "Считай возраст и покажи его после преобразования."}, "kz": {"title": "Жасты енгізу", "description": "Жасты енгізіп, түрлендіргеннен кейін шығар."}},
                {"ru": {"title": "Сложение и формат", "description": "Сложи два числа и выведи красивое сообщение."}, "kz": {"title": "Қосу және формат", "description": "Екі санды қосып, әдемі хабарлама шығар."}},
                {"ru": {"title": "Типы данных", "description": "Разберись, где строка, число и логический тип."}, "kz": {"title": "Дерек түрлері", "description": "Қайсысы жол, сан және логикалық тип екенін ажырат."}},
            ],
            3: [
                {"ru": {"title": "Проверка возраста", "description": "Выведи разный ответ для взрослого и ребёнка."}, "kz": {"title": "Жасты тексеру", "description": "Ересек пен балаға әртүрлі жауап шығар."}},
                {"ru": {"title": "Чётное или нечётное", "description": "Определи, делится ли число на 2 без остатка."}, "kz": {"title": "Жұп немесе тақ", "description": "Санның 2-ге қалдықсыз бөлінетінін анықта."}},
                {"ru": {"title": "Сравнение чисел", "description": "Найди большее из двух чисел."}, "kz": {"title": "Сандарды салыстыру", "description": "Екі санның үлкенін тап."}},
                {"ru": {"title": "Оценка по баллам", "description": "Преобразуй score в буквенную оценку."}, "kz": {"title": "Балл бойынша баға", "description": "score мәнін әріптік бағаға айналдыр."}},
                {"ru": {"title": "Два условия", "description": "Проверь сразу два условия через and."}, "kz": {"title": "Екі шарт", "description": "Екі шартты and арқылы тексер."}},
                {"ru": {"title": "Проверка пароля", "description": "Сравни пароль и выведи результат входа."}, "kz": {"title": "Құпия сөзді тексеру", "description": "Парольді салыстырып, кіру нәтижесін шығар."}},
            ],
            4: [
                {"ru": {"title": "Цикл for", "description": "Выведи числа через range в цикле for."}, "kz": {"title": "for циклі", "description": "range арқылы сандарды for циклімен шығар."}},
                {"ru": {"title": "Сумма чисел", "description": "Посчитай сумму чисел от 1 до 10."}, "kz": {"title": "Сандар қосындысы", "description": "1-ден 10-ға дейінгі сандардың қосындысын есепте."}},
                {"ru": {"title": "Проход по списку", "description": "Пройди по списку имён и выведи каждое."}, "kz": {"title": "Тізіммен өту", "description": "Аттар тізімімен өтіп, әрқайсын шығар."}},
                {"ru": {"title": "Счётчик while", "description": "Считай назад с помощью while."}, "kz": {"title": "while санауышы", "description": "while арқылы кері сана."}},
                {"ru": {"title": "Повторение действий", "description": "Повтори действие несколько раз и измени счётчик."}, "kz": {"title": "Әрекетті қайталау", "description": "Әрекетті бірнеше рет қайталап, санағышты өзгерт."}},
                {"ru": {"title": "Выход из цикла", "description": "Останови цикл, когда условие больше не подходит."}, "kz": {"title": "Циклден шығу", "description": "Шарт сәйкес келмегенде циклді тоқтат."}},
            ],
            5: [
                {"ru": {"title": "Первая функция", "description": "Создай функцию и вызови её один раз."}, "kz": {"title": "Алғашқы функция", "description": "Функция құрып, оны бір рет шақыр."}},
                {"ru": {"title": "Функция с параметром", "description": "Передай аргумент и используй его внутри."}, "kz": {"title": "Параметрі бар функция", "description": "Аргумент беріп, оны функция ішінде қолдан."}},
                {"ru": {"title": "Возврат значения", "description": "Верни результат через return."}, "kz": {"title": "Мәнді қайтару", "description": "return арқылы нәтижені қайтар."}},
                {"ru": {"title": "Параметры по умолчанию", "description": "Настрой значение по умолчанию для функции."}, "kz": {"title": "Әдепкі параметр", "description": "Функцияға әдепкі мән орнат."}},
                {"ru": {"title": "Несколько параметров", "description": "Прими два и более значения в функции."}, "kz": {"title": "Бірнеше параметр", "description": "Функцияда екі және одан көп мән қабылда."}},
                {"ru": {"title": "Помощник для повторов", "description": "Вынеси повторяющийся код в helper."}, "kz": {"title": "Қайталанатын көмекші", "description": "Қайталанатын кодты helper функциясына шығар."}},
                {"ru": {"title": "Мини-калькулятор", "description": "Собери сложение в отдельную функцию."}, "kz": {"title": "Шағын калькулятор", "description": "Қосуды бөлек функцияға жина."}},
            ],
            6: [
                {"ru": {"title": "Старт проекта", "description": "Определи цель мини-проекта и первые шаги."}, "kz": {"title": "Жоба бастау", "description": "Мини-жобаның мақсатын және алғашқы қадамдарын анықта."}},
                {"ru": {"title": "Ввод и вывод", "description": "Добавь чтение данных и красивый вывод."}, "kz": {"title": "Енгізу және шығару", "description": "Дерек енгізуді және әдемі шығаруды қос."}},
                {"ru": {"title": "Добавь условие", "description": "Сделай выбор ответа через if / else."}, "kz": {"title": "Шарт қосу", "description": "if / else арқылы жауап таңдауды жаса."}},
                {"ru": {"title": "Цикл в проекте", "description": "Повтори часть логики несколько раз."}, "kz": {"title": "Жобадағы цикл", "description": "Логиканың бір бөлігін бірнеше рет қайтала."}},
                {"ru": {"title": "Функция внутри проекта", "description": "Вынеси общий шаг в функцию."}, "kz": {"title": "Жобадағы функция", "description": "Ортақ қадамды функцияға шығар."}},
                {"ru": {"title": "Проверка сценария", "description": "Прогони проект на нескольких примерах."}, "kz": {"title": "Сценарийді тексеру", "description": "Жобаны бірнеше мысалда тексер."}},
                {"ru": {"title": "Финальная доработка", "description": "Улучшай код и убирай лишнее."}, "kz": {"title": "Соңғы жетілдіру", "description": "Кодты жақсартып, артықтарын алып таста."}},
            ],
        }

        for course in courses:
            course_id = int(course.get("id") or 0)
            language_key = normalize_language(language)
            localized_course_content = self._localize_course_content(
                {
                    "theoryContent": course.get("theoryContent") if isinstance(course.get("theoryContent"), dict) else {},
                    "quizBank": course.get("quizBank") if isinstance(course.get("quizBank"), (list, dict)) else [],
                    "rewardPreview": course.get("rewardPreview") if isinstance(course.get("rewardPreview"), dict) else {},
                },
                language,
            )
            theory_content = localized_course_content.get("theoryContent") if isinstance(localized_course_content.get("theoryContent"), dict) else {}
            quiz_bank = localized_course_content.get("quizBank") if isinstance(localized_course_content.get("quizBank"), list) else []
            theory_entry = theory_by_course.get(course_id, {})
            theory_lines = theory_details_by_course.get(course_id, {})
            default_theory = str(course.get("description") or "").strip() or "Изучите базовую теорию темы и затем переходите к практике шаг за шагом."
            default_kz_theory = str(course.get("description") or "").strip() or "Тақырыптың негізгі теориясын оқып, содан кейін практикаға өтіңіз."
            theory = theory_content.get("intro") or theory_entry.get(language_key) or theory_entry.get("ru") or (default_kz_theory if language_key == "kz" else default_theory)

            details = theory_content.get("sections") or theory_lines.get(language_key) or theory_lines.get("ru") or [
                default_kz_theory if language_key == "kz" else default_theory,
                ("Келесі қадам - практика" if language_key == "kz" else "Следующий шаг - практика"),
                ("Тапсырмалар арқылы бекітіңіз" if language_key == "kz" else "Закрепите тему через задания"),
            ]
            example = theory_content.get("example") or theory_lines.get("example", {}).get(language_key) or theory_lines.get("example", {}).get("ru") or (
                "print('Тақырыпты меңгеру')" if language_key == "kz" else "print('Разбор темы')"
            )
            hint = (theory_content.get("takeaways") or [None])[0] or theory_lines.get("hint", {}).get(language_key) or theory_lines.get("hint", {}).get("ru") or (
                "Теорияны оқып, бірден кодтаңыз" if language_key == "kz" else "Прочитайте теорию и сразу закрепите кодом"
            )

            related = [m for m in missions if self._parse_course_id_from_chapter(m.get("chapter")) == course_id]

            practices = []
            for index, mission in enumerate(related, start=1):
                title = str(mission.get("title") or f"Практика {index}")
                description = str(mission.get("description") or "").rstrip(".")
                practice_line = f"{index}. {title}"
                if description:
                    practice_line = f"{practice_line} — {description}"
                practices.append(practice_line)

            if not practices:
                for index, practice in enumerate(practice_catalog_by_course.get(course_id, []), start=1):
                    locale_practice = practice.get(language_key) or practice.get("ru") or {}
                    title = str(locale_practice.get("title") or f"Практика {index}")
                    description = str(locale_practice.get("description") or "")
                    practice_line = f"{index}. {title}"
                    if description:
                        practice_line = f"{practice_line} — {description}"
                    practices.append(practice_line)

            if not practices:
                fallback_count = 7 if course.get("gradeBand") == "9" else 6
                for practice_number in range(1, fallback_count + 1):
                    practices.append(
                        f"{practice_number}. {language_key == 'kz' and 'Тақырыпты бекіту' or 'Закрепление темы'} — {language_key == 'kz' and 'мысалдарды қайталап шық' or 'повтори примеры и закрепи тему'}"
                    )

            topics.append(
                {
                    "id": f"course-{course_id}",
                    "section": course.get("section") or "Общий модуль",
                    "title": str(course.get("title") or f"Тема {course_id}"),
                    "grade": course.get("gradeBand") if course.get("gradeBand") in {"pre", "8", "9"} else "pre",
                    "theory": theory,
                    "theoryDetails": details,
                    "theoryExample": example,
                    "theoryHint": hint,
                    "quizBank": quiz_bank,
                    "practices": practices,
                }
            )

        return topics

    def get_course_journey_progress(self, user: Optional[User]) -> dict:
        if not user:
            return {}
        settings = self._get_user_settings(user)
        raw = settings.get("journey_progress")
        if not isinstance(raw, dict):
            return {}

        sanitized: dict = {}
        for topic_id, value in raw.items():
            if not isinstance(value, dict):
                continue
            completed = value.get("completedPractices")
            completed_list = completed if isinstance(completed, list) else []
            normalized = sorted({int(item) for item in completed_list if isinstance(item, int) or (isinstance(item, str) and str(item).isdigit())})
            sanitized[str(topic_id)] = {
                "theoryOpened": bool(value.get("theoryOpened")),
                "completedPractices": normalized,
                "quizCompleted": bool(value.get("quizCompleted")),
                "quizScore": int(value.get("quizScore")) if isinstance(value.get("quizScore"), int) else None,
                "quizTotal": int(value.get("quizTotal")) if isinstance(value.get("quizTotal"), int) else None,
            }
        return sanitized

    def _sync_course_progress_from_journey(self, user: Optional[User], settings: dict, topic_id: str, topic_state: dict, topic_max_practices: int) -> None:
        if not user or not isinstance(settings, dict):
            return

        course_match = re.search(r"(\d+)", str(topic_id))
        if not course_match:
            return

        try:
            course_id = int(course_match.group(1))
        except (TypeError, ValueError):
            return

        courses = self._get_courses_ordered()
        if not courses:
            return

        raw_course_progress = settings.get("course_progress") if isinstance(settings.get("course_progress"), dict) else {}
        progress = self._normalize_user_course_progress(raw_course_progress, courses)
        topic_key = str(course_id)
        if topic_key not in progress:
            return

        entry = progress.get(topic_key)
        if not isinstance(entry, dict):
            return

        completed_practices = topic_state.get("completedPractices")
        completed_count = len(completed_practices) if isinstance(completed_practices, list) else 0
        theory_opened = bool(topic_state.get("theoryOpened"))
        quiz_completed = bool(topic_state.get("quizCompleted"))
        is_course_completed = theory_opened and completed_count >= topic_max_practices and quiz_completed

        if is_course_completed:
            entry["completedLessons"] = int(entry.get("totalLessons", 1) or 1)
            entry["progress"] = 100
            entry["stars"] = max(int(entry.get("stars", 0) or 0), 3)
            entry["completed"] = True
            entry["unlocked"] = True
            entry["updatedAt"] = datetime.utcnow().isoformat()

            ordered_ids = sorted(int(key) for key in progress.keys())
            if course_id in ordered_ids:
                current_index = ordered_ids.index(course_id)
                if current_index < len(ordered_ids) - 1:
                    next_key = str(ordered_ids[current_index + 1])
                    next_entry = progress.get(next_key)
                    if isinstance(next_entry, dict):
                        next_entry["unlocked"] = True
                        next_entry["updatedAt"] = datetime.utcnow().isoformat()

        settings["course_progress"] = progress

    def save_course_journey_progress(self, user: Optional[User], topic_id: str, progress: dict) -> dict:
        if not user:
            return {}

        settings = self._get_user_settings(user)
        all_progress = settings.get("journey_progress") if isinstance(settings.get("journey_progress"), dict) else {}

        topic_max_practices = 7
        for topic in self.get_course_journey(user):
            if str(topic.get("id")) == str(topic_id):
                practices = topic.get("practices") if isinstance(topic, dict) else []
                if isinstance(practices, list) and practices:
                    topic_max_practices = len(practices)
                break

        completed = progress.get("completedPractices") if isinstance(progress, dict) else []
        completed_list = completed if isinstance(completed, list) else []
        normalized = sorted(
            {
                int(item)
                for item in completed_list
                if (isinstance(item, int) or (isinstance(item, str) and str(item).isdigit()))
                and 0 <= int(item) < topic_max_practices
            }
        )

        theory_opened = bool(progress.get("theoryOpened") if isinstance(progress, dict) else False)
        quiz_completed = bool(progress.get("quizCompleted") if isinstance(progress, dict) else False)
        quiz_score = progress.get("quizScore") if isinstance(progress, dict) else None
        quiz_total = progress.get("quizTotal") if isinstance(progress, dict) else None

        if not isinstance(quiz_score, int):
            quiz_score = None
        if not isinstance(quiz_total, int):
            quiz_total = None

        if not theory_opened:
            normalized = []
            quiz_completed = False
            quiz_score = None
            quiz_total = None
        else:
            # Keep only contiguous completion from the first practice (0,1,2...).
            contiguous: list[int] = []
            expected = 0
            for idx in normalized:
                if idx == expected:
                    contiguous.append(idx)
                    expected += 1
                elif idx > expected:
                    break
            normalized = contiguous

            # Final quiz can be marked complete only after all practices are complete.
            if len(normalized) < topic_max_practices:
                quiz_completed = False
                quiz_score = None
                quiz_total = None

        all_progress[str(topic_id)] = {
            "theoryOpened": theory_opened,
            "completedPractices": normalized,
            "quizCompleted": quiz_completed,
            "quizScore": quiz_score,
            "quizTotal": quiz_total,
            "updatedAt": datetime.utcnow().isoformat(),
        }

        self._sync_course_progress_from_journey(user, settings, topic_id, all_progress[str(topic_id)], topic_max_practices)
        settings["journey_progress"] = all_progress
        self._save_user_settings(user, settings)
        return self.get_course_journey_progress(user)

    def create_course(self, payload: CourseCreate) -> Course:
        """Create a new course"""
        next_id = (self.db.query(Course).order_by(Course.id.desc()).first().id + 1) if self.db.query(Course).first() else 1
        course = Course(
            id=next_id,
            title=payload.title,
            description=payload.description,
            theory_content=payload.theoryContent or {},
            quiz_bank=payload.quizBank or [],
            reward_preview=payload.rewardPreview or {},
            progress=0,
            total_lessons=payload.totalLessons,
            icon=payload.icon,
            color=payload.color,
            difficulty=payload.difficulty,
            stars=0,
            is_boss=payload.isBoss,
            locked=payload.locked,
        )
        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)
        return course

    def update_course(self, course_id: int, payload: CourseUpdate) -> Optional[Course]:
        course = self.get_course_by_id(course_id)
        if not course:
            return None

        data = payload.model_dump(exclude_unset=True)
        field_map = {
            "totalLessons": "total_lessons",
            "isBoss": "is_boss",
            "theoryContent": "theory_content",
            "quizBank": "quiz_bank",
            "rewardPreview": "reward_preview",
        }
        for key, value in data.items():
            setattr(course, field_map.get(key, key), value)

        self.db.commit()
        self.db.refresh(course)
        return course

    def delete_course(self, course_id: int) -> bool:
        course = self.get_course_by_id(course_id)
        if not course:
            return False

        self.db.delete(course)
        self.db.commit()
        return True

    def create_mission(self, payload: MissionCreate) -> Mission:
        """Create a new mission"""
        mission = Mission(
            id=payload.id,
            title=payload.title,
            chapter=payload.chapter,
            description=payload.description,
            difficulty=payload.difficulty,
            xp_reward=payload.xpReward,
            objectives=[
                {
                    "id": idx + 1,
                    "text": obj.text,
                    "testCaseId": obj.testCaseId,
                    "completed": False,
                }
                for idx, obj in enumerate(payload.objectives)
            ],
            starter_code=payload.starterCode,
            test_cases=[tc.model_dump() for tc in payload.testCases],
            hints=payload.hints,
        )
        self.db.add(mission)
        self.db.commit()
        self.db.refresh(mission)
        return mission

    def update_mission(self, mission_id: str, payload: MissionUpdate) -> Optional[Mission]:
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return None

        data = payload.model_dump(exclude_unset=True)

        if "title" in data:
            mission.title = data["title"]
        if "chapter" in data:
            mission.chapter = data["chapter"]
        if "description" in data:
            mission.description = data["description"]
        if "difficulty" in data:
            mission.difficulty = data["difficulty"]
        if "xpReward" in data:
            mission.xp_reward = data["xpReward"]
        if "starterCode" in data:
            mission.starter_code = data["starterCode"]
        if "hints" in data:
            mission.hints = data["hints"]
        if "testCases" in data and data["testCases"] is not None:
            mission.test_cases = [tc.model_dump() for tc in data["testCases"]]
        if "objectives" in data and data["objectives"] is not None:
            mission.objectives = [
                {
                    "id": idx + 1,
                    "text": obj.text,
                    "testCaseId": obj.testCaseId,
                    "completed": False,
                }
                for idx, obj in enumerate(data["objectives"])
            ]

        self.db.commit()
        self.db.refresh(mission)
        return mission

    def delete_mission(self, mission_id: str) -> bool:
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return False

        self.db.delete(mission)
        self.db.commit()
        return True

    # Mission operations
    def get_missions(self, language: str = "ru") -> List[dict]:
        """Get all missions"""
        missions = self._get_mission_models()
        mission_ids = [m.id for m in missions]
        response: list[dict] = []
        for idx, mission in enumerate(missions):
            response.append(
                self._localize_mission_item(
                    mission,
                    mission_ids[idx - 1] if idx > 0 else None,
                    mission_ids[idx + 1] if idx < len(mission_ids) - 1 else None,
                    language,
                )
            )
        return response

    def get_mission_by_id(self, mission_id: str) -> Optional[Mission]:
        """Get mission by ID"""
        return self.db.query(Mission).filter(Mission.id == mission_id).first()

    def update_mission_objectives(self, mission_id: str, objectives: list) -> Optional[Mission]:
        """Update mission objectives"""
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return None

        mission.objectives = objectives
        self.db.commit()
        self.db.refresh(mission)
        return mission

    def _get_user_settings(self, user: Optional[User]) -> dict:
        if not user:
            return {}
        return dict(user.settings or {})

    def _save_user_settings(self, user: Optional[User], settings: dict) -> None:
        if not user:
            return
        user.settings = settings
        flag_modified(user, "settings")
        self.db.commit()
        self.db.refresh(user)

    def _get_default_mission_files(self, mission: Mission) -> list:
        return [
            {
                "id": "main",
                "name": "main.py",
                "type": "file",
                "language": "python",
                "content": mission.starter_code or "# Write your code here\n",
                "parentId": "root",
            }
        ]

    def get_mission_neighbors(self, mission_id: str) -> dict:
        missions = self._get_mission_models()
        mission_ids = [m.id for m in missions]
        if mission_id not in mission_ids:
            return {"previousMissionId": None, "nextMissionId": None}

        idx = mission_ids.index(mission_id)
        previous_id = mission_ids[idx - 1] if idx > 0 else None
        next_id = mission_ids[idx + 1] if idx < len(mission_ids) - 1 else None
        return {"previousMissionId": previous_id, "nextMissionId": next_id}

    def get_mission_workspace(self, mission_id: str, user: Optional[User]) -> dict:
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return {"files": [], "activeFileId": None, "updatedAt": None}

        settings = self._get_user_settings(user)
        workspaces = settings.get("mission_workspaces") or {}
        workspace = workspaces.get(mission_id)

        if workspace and isinstance(workspace, dict):
            files = workspace.get("files") or []
            active_file_id = workspace.get("activeFileId") or (files[0].get("id") if files else None)
            return {
                "files": files,
                "activeFileId": active_file_id,
                "updatedAt": workspace.get("updatedAt"),
            }

        files = self._get_default_mission_files(mission)
        return {
            "files": files,
            "activeFileId": files[0]["id"] if files else None,
            "updatedAt": None,
        }

    def save_mission_workspace(self, mission_id: str, files: list, active_file_id: Optional[str], user: Optional[User]) -> dict:
        if not user:
            return {
                "files": files,
                "activeFileId": active_file_id,
                "updatedAt": datetime.utcnow().isoformat(),
            }

        settings = self._get_user_settings(user)
        workspaces = settings.get("mission_workspaces") or {}
        workspaces[mission_id] = {
            "files": files,
            "activeFileId": active_file_id,
            "updatedAt": datetime.utcnow().isoformat(),
        }
        settings["mission_workspaces"] = workspaces
        self._save_user_settings(user, settings)
        return workspaces[mission_id]

    def _get_user_mission_objectives(self, mission: Mission, user: Optional[User]) -> list:
        if not user:
            return mission.objectives or []

        settings = self._get_user_settings(user)
        progress = settings.get("mission_progress") or {}
        saved = progress.get(mission.id)
        if isinstance(saved, dict) and isinstance(saved.get("objectives"), list):
            return saved.get("objectives")
        return mission.objectives or []

    def _save_user_mission_progress(self, mission: Mission, objectives: list, success: bool, user: Optional[User]) -> None:
        if not user:
            return

        settings = self._get_user_settings(user)
        progress = settings.get("mission_progress") or {}
        previous = progress.get(mission.id) if isinstance(progress.get(mission.id), dict) else {}
        was_completed = bool(previous.get("completed"))
        progress[mission.id] = {
            "objectives": objectives,
            "completed": bool(success or was_completed),
            "updatedAt": datetime.utcnow().isoformat(),
        }
        settings["mission_progress"] = progress
        self._save_user_settings(user, settings)

    def _append_progress_event(
        self,
        user: Optional[User],
        mission: Mission,
        success: bool,
        xp_earned: int,
        xp_total: int,
    ) -> None:
        if not user:
            return

        settings = self._get_user_settings(user)
        raw_events = settings.get("progress_events")
        events = raw_events if isinstance(raw_events, list) else []

        events.append(
            {
                "missionId": mission.id,
                "topic": mission.chapter or "Тема",
                "success": bool(success),
                "xpEarned": int(xp_earned),
                "xpTotal": int(xp_total),
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

        settings["progress_events"] = events[-300:]
        user.settings = settings

    def _execute_python_code(self, code: str) -> dict:
        is_safe, safety_error = self._validate_python_code_safety(code)
        if not is_safe:
            return {
                "stdout": "",
                "stderr": safety_error,
                "returncode": 126,
                "timedOut": False,
                "blocked": True,
            }

        try:
            with tempfile.TemporaryDirectory(prefix="pypath_exec_") as sandbox_dir:
                result = subprocess.run(
                    [sys.executable, "-I", "-S", "-B", "-c", code],
                    capture_output=True,
                    text=True,
                    timeout=4,
                    cwd=sandbox_dir,
                    stdin=subprocess.DEVNULL,
                    env={"PYTHONIOENCODING": "utf-8"},
                )

            stdout = (result.stdout or "")
            stderr = (result.stderr or "")
            if len(stdout) > MAX_OUTPUT_CHARS:
                stdout = f"{stdout[:MAX_OUTPUT_CHARS]}\n... output truncated ..."
            if len(stderr) > MAX_OUTPUT_CHARS:
                stderr = f"{stderr[:MAX_OUTPUT_CHARS]}\n... error output truncated ..."

            return {
                "stdout": stdout,
                "stderr": stderr,
                "returncode": result.returncode,
                "timedOut": False,
                "blocked": False,
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": "Execution timed out (possible infinite loop).",
                "returncode": 124,
                "timedOut": True,
                "blocked": False,
            }

    def _validate_python_code_safety(self, code: str) -> tuple[bool, str]:
        try:
            tree = ast.parse(code)
        except SyntaxError:
            return True, ""

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    root = (alias.name or "").split(".")[0]
                    if root in BLOCKED_IMPORTS:
                        return False, f"Blocked import detected: {root}"

            if isinstance(node, ast.ImportFrom):
                root = (node.module or "").split(".")[0]
                if root in BLOCKED_IMPORTS:
                    return False, f"Blocked import detected: {root}"

            if isinstance(node, ast.Call):
                if isinstance(node.func, ast.Name) and node.func.id in BLOCKED_CALLS:
                    return False, f"Blocked call detected: {node.func.id}"
                if isinstance(node.func, ast.Attribute):
                    if node.func.attr in BLOCKED_ATTRIBUTES:
                        return False, f"Blocked attribute usage detected: {node.func.attr}"
                    if isinstance(node.func.value, ast.Name) and node.func.value.id in BLOCKED_IMPORTS:
                        return False, f"Blocked call target detected: {node.func.value.id}.{node.func.attr}"

            if isinstance(node, ast.Attribute) and node.attr in BLOCKED_ATTRIBUTES:
                return False, f"Blocked attribute usage detected: {node.attr}"

        return True, ""

    def _regex_flags(self, flags: Optional[str]) -> int:
        parsed = 0
        if not flags:
            return parsed
        flag_map = {
            "i": re.IGNORECASE,
            "m": re.MULTILINE,
            "s": re.DOTALL,
        }
        for ch in flags.lower():
            parsed |= flag_map.get(ch, 0)
        return parsed

    def _evaluate_test_cases(self, mission: Mission, code: str, exec_result: dict) -> list:
        test_cases = mission.test_cases if isinstance(mission.test_cases, list) else []
        if not test_cases:
            return []

        results: list[dict] = []
        for raw_test in test_cases:
            test = raw_test if isinstance(raw_test, dict) else {}
            test_id = str(test.get("id") or "unknown")
            test_type = str(test.get("type") or "")
            value = test.get("value")
            label = str(test.get("label") or test_id)

            passed = False
            if test_type == "code_regex" and isinstance(value, str):
                passed = bool(re.search(value, code, self._regex_flags(test.get("flags"))))
            elif test_type == "output_contains" and isinstance(value, str):
                passed = value in str(exec_result.get("stdout") or "")
            elif test_type == "output_regex" and isinstance(value, str):
                passed = bool(re.search(value, str(exec_result.get("stdout") or ""), self._regex_flags(test.get("flags"))))
            elif test_type == "returncode_equals":
                try:
                    passed = int(exec_result.get("returncode", 1)) == int(value)
                except (TypeError, ValueError):
                    passed = False

            results.append(
                {
                    "id": test_id,
                    "passed": passed,
                    "message": label,
                }
            )

        return results

    def _course_practice_checks(self, topic_id: str, topic_title: str, practice_index: int, practice_name: str, language: str) -> tuple[str, list[dict]]:
        language_key = normalize_language(language)
        starter_code = '# Кодты мұнда жаз\n' if language_key == 'kz' else '# Write your code here\n'
        topic_title_lower = topic_title.lower()
        practice_text_lower = f'{topic_title} {practice_name}'.lower()

        def normalized(value: str) -> str:
            return value.lower()

        def has_all(value: str, tokens: list[str]) -> bool:
            lowered = normalized(value)
            return all(token.lower() in lowered for token in tokens)

        def has_any(value: str, tokens: list[str]) -> bool:
            lowered = normalized(value)
            return any(token.lower() in lowered for token in tokens)

        def count(value: str, token: str) -> int:
            lowered = normalized(value)
            return lowered.count(token.lower())

        generic_checks = [
            {
                'id': 'code_written',
                'description': 'Код жазылған' if language_key == 'kz' else 'Код написан',
                'checkFunction': lambda code: bool(code and code.strip()) and any(
                    line.strip() and not line.strip().startswith('#')
                    for line in code.splitlines()
                ),
            },
        ]

        if any(keyword in practice_text_lower for keyword in ('if / else', 'if/else', 'услови', 'шарт')):
            checks_by_index = {
                0: [
                    {'id': 'has_if_else', 'description': 'if және else қолданылған' if language_key == 'kz' else 'Использованы if и else', 'checkFunction': lambda code: has_all(code, ['if', 'else'])},
                    {'id': 'has_compare', 'description': 'Жас салыстырылады' if language_key == 'kz' else 'Есть сравнение возраста', 'checkFunction': lambda code: has_any(code, ['>=', '<=', '>', '<'])},
                    {'id': 'has_output', 'description': 'Экранға жауап шығарылады' if language_key == 'kz' else 'Есть вывод ответа', 'checkFunction': lambda code: has_any(code, ['print('])},
                ],
                1: [
                    {'id': 'has_even_check', 'description': 'Жұп/тақ тексерісі бар' if language_key == 'kz' else 'Есть проверка чётности', 'checkFunction': lambda code: has_any(code, ['% 2', '%2'])},
                    {'id': 'has_if', 'description': 'if қолданылған' if language_key == 'kz' else 'Использован if', 'checkFunction': lambda code: has_any(code, ['if '])},
                ],
                2: [{'id': 'compare_values', 'description': 'Екі мән салыстырылады' if language_key == 'kz' else 'Сравниваются два значения', 'checkFunction': lambda code: has_any(code, ['>', '<', '>=', '<='])}],
                3: [{'id': 'grade_condition', 'description': 'Баға шарты бар' if language_key == 'kz' else 'Есть условие для оценки', 'checkFunction': lambda code: has_any(code, ['>=', '<=', 'elif', 'if'])}],
                4: [{'id': 'nested_if', 'description': 'Кірістірілген if бар' if language_key == 'kz' else 'Есть вложенный if', 'checkFunction': lambda code: count(code, 'if') >= 2 or has_any(code, ['elif'])}],
                5: [{'id': 'access_condition', 'description': 'Қолжетімділік шарты бар' if language_key == 'kz' else 'Есть условие доступа', 'checkFunction': lambda code: has_all(code, ['if', 'else'])}],
            }
            description = f'{practice_name}: ' + ('шарт арқылы шешілетін тапсырма' if language_key == 'kz' else 'задача на условие')
            return description, [
                {'id': item['id'], 'description': item['description'], 'passed': bool(item['checkFunction'])} if False else item
                for item in checks_by_index.get(practice_index, generic_checks)
            ]

        checks_by_index: dict[int, list[dict]]
        description: str

        if topic_id in {'course-1', 'pre-variables'} or 'variables' in topic_id:
            checks_by_index = {
                0: [
                    {'id': 'has_assignment', 'description': 'Екі айнымалы бар' if language_key == 'kz' else 'Есть две переменные', 'checkFunction': lambda code: has_any(code, ['=', 'print('])},
                    {'id': 'has_output', 'description': 'Нәтиже экранға шығарылады' if language_key == 'kz' else 'Результат выводится на экран', 'checkFunction': lambda code: has_any(code, ['print('])},
                ],
                1: [
                    {'id': 'has_addition', 'description': 'Қосу операторы қолданылған' if language_key == 'kz' else 'Использован оператор сложения', 'checkFunction': lambda code: has_any(code, ['+'])},
                    {'id': 'has_output', 'description': 'Экранға шығару бар' if language_key == 'kz' else 'Есть вывод на экран', 'checkFunction': lambda code: has_any(code, ['print('])},
                ],
                2: [{'id': 'join_strings', 'description': 'Жолдар біріктірілген' if language_key == 'kz' else 'Строки объединены', 'checkFunction': lambda code: has_any(code, ['+', 'print('])}],
                3: [{'id': 'conversion', 'description': 'Түрлендіру қолданылады' if language_key == 'kz' else 'Используется преобразование', 'checkFunction': lambda code: has_any(code, ['str(', 'int('])}],
                4: [{'id': 'type_check', 'description': 'type() шақырылған' if language_key == 'kz' else 'Вызван type()', 'checkFunction': lambda code: has_any(code, ['type('])}],
                5: [{'id': 'calculation', 'description': 'Нәтиже есептелген' if language_key == 'kz' else 'Результат вычислен', 'checkFunction': lambda code: has_any(code, ['+', '-', '*', '/'])}],
            }
            description = f'{practice_name}: ' + ('тақырып бойынша практика' if language_key == 'kz' else 'практика по теме')
        elif 'if' in topic_id or 'услов' in topic_title_lower:
            checks_by_index = {
                0: [
                    {'id': 'has_if_else', 'description': 'if және else қолданылған' if language_key == 'kz' else 'Использованы if и else', 'checkFunction': lambda code: has_all(code, ['if', 'else'])},
                    {'id': 'has_compare', 'description': 'Жас салыстырылады' if language_key == 'kz' else 'Есть сравнение возраста', 'checkFunction': lambda code: has_any(code, ['>=', '<=', '>', '<'])},
                    {'id': 'has_output', 'description': 'Экранға жауап шығарылады' if language_key == 'kz' else 'Есть вывод ответа', 'checkFunction': lambda code: has_any(code, ['print('])},
                ],
                1: [
                    {'id': 'has_even_check', 'description': 'Жұп/тақ тексерісі бар' if language_key == 'kz' else 'Есть проверка чётности', 'checkFunction': lambda code: has_any(code, ['% 2', '%2'])},
                    {'id': 'has_if', 'description': 'if қолданылған' if language_key == 'kz' else 'Использован if', 'checkFunction': lambda code: has_any(code, ['if '])},
                ],
                2: [{'id': 'compare_values', 'description': 'Екі мән салыстырылады' if language_key == 'kz' else 'Сравниваются два значения', 'checkFunction': lambda code: has_any(code, ['>', '<', '>=', '<='])}],
                3: [{'id': 'grade_condition', 'description': 'Баға шарты бар' if language_key == 'kz' else 'Есть условие для оценки', 'checkFunction': lambda code: has_any(code, ['>=', '<=', 'elif', 'if'])}],
                4: [{'id': 'nested_if', 'description': 'Кірістірілген if бар' if language_key == 'kz' else 'Есть вложенный if', 'checkFunction': lambda code: count(code, 'if') >= 2 or has_any(code, ['elif'])}],
                5: [{'id': 'access_condition', 'description': 'Қолжетімділік шарты бар' if language_key == 'kz' else 'Есть условие доступа', 'checkFunction': lambda code: has_all(code, ['if', 'else'])}],
            }
            description = f'{practice_name}: ' + ('шарт арқылы шешілетін тапсырма' if language_key == 'kz' else 'задача на условие')
        elif 'loop' in topic_id:
            checks_by_index = {
                0: [{'id': 'range_used', 'description': 'range() қолданылған' if language_key == 'kz' else 'Используется range()', 'checkFunction': lambda code: has_any(code, ['range('])}],
                1: [
                    {'id': 'sum_accumulated', 'description': 'Қосынды жиналады' if language_key == 'kz' else 'Собирается сумма', 'checkFunction': lambda code: has_any(code, ['+=', 'sum'])},
                    {'id': 'loop_used', 'description': 'Цикл қолданылған' if language_key == 'kz' else 'Использован цикл', 'checkFunction': lambda code: has_any(code, ['for ', 'while '])},
                ],
                2: [
                    {'id': 'multiplication', 'description': 'Көбейту бар' if language_key == 'kz' else 'Есть умножение', 'checkFunction': lambda code: has_any(code, ['*'])},
                    {'id': 'loop_used', 'description': 'Цикл қолданылған' if language_key == 'kz' else 'Использован цикл', 'checkFunction': lambda code: has_any(code, ['for ', 'while '])},
                ],
                3: [{'id': 'max_compare', 'description': 'Максимум салыстыру арқылы табылады' if language_key == 'kz' else 'Максимум ищется через сравнение', 'checkFunction': lambda code: has_any(code, ['if ', '>', '<'])}],
                4: [
                    {'id': 'while_used', 'description': 'while қолданылған' if language_key == 'kz' else 'Используется while', 'checkFunction': lambda code: has_any(code, ['while '])},
                    {'id': 'counter_changed', 'description': 'Санағыш өзгертіледі' if language_key == 'kz' else 'Счётчик изменяется', 'checkFunction': lambda code: has_any(code, ['+=', '-='])},
                ],
                5: [{'id': 'loop_exit', 'description': 'Циклден шығу бар' if language_key == 'kz' else 'Есть выход из цикла', 'checkFunction': lambda code: has_any(code, ['break', 'while '])}],
            }
            description = f'{practice_name}: ' + ('цикл бойынша практика' if language_key == 'kz' else 'практика по циклам')
        elif 'func' in topic_id:
            checks_by_index = {
                0: [
                    {'id': 'def_used', 'description': 'def қолданылған' if language_key == 'kz' else 'Использован def', 'checkFunction': lambda code: has_any(code, ['def '])},
                    {'id': 'has_output', 'description': 'Экранға шығару бар' if language_key == 'kz' else 'Есть вывод на экран', 'checkFunction': lambda code: has_any(code, ['print('])},
                ],
                1: [{'id': 'sum_returned', 'description': 'Қосу қайтарылады' if language_key == 'kz' else 'Возвращается сумма', 'checkFunction': lambda code: has_any(code, ['return', '+'])}],
                2: [{'id': 'area_calculated', 'description': 'Аудан есептеледі' if language_key == 'kz' else 'Считается площадь', 'checkFunction': lambda code: has_any(code, ['return', '*'])}],
                3: [{'id': 'prime_condition', 'description': 'Жай сан шарты бар' if language_key == 'kz' else 'Есть условие простого числа', 'checkFunction': lambda code: has_any(code, ['%', 'for ', 'if '])}],
                4: [{'id': 'default_param', 'description': 'Әдепкі параметр қолданылған' if language_key == 'kz' else 'Есть параметр по умолчанию', 'checkFunction': lambda code: has_any(code, ['='])}],
                5: [{'id': 'function_defined', 'description': 'Функция анықталған' if language_key == 'kz' else 'Функция определена', 'checkFunction': lambda code: has_any(code, ['def '])}],
            }
            description = f'{practice_name}: ' + ('функциялармен жұмыс' if language_key == 'kz' else 'работа с функциями')
        elif 'list' in topic_id:
            checks_by_index = {
                0: [{'id': 'append_used', 'description': 'Тізімге қосу бар' if language_key == 'kz' else 'Есть добавление в список', 'checkFunction': lambda code: has_any(code, ['append(', '['])}],
                1: [{'id': 'remove_used', 'description': 'Жою операциясы бар' if language_key == 'kz' else 'Есть операция удаления', 'checkFunction': lambda code: has_any(code, ['remove(', 'pop('])}],
                2: [{'id': 'slice_used', 'description': 'Срез қолданылған' if language_key == 'kz' else 'Используется срез', 'checkFunction': lambda code: has_any(code, [':'])}],
                3: [{'id': 'frequency_counted', 'description': 'Жиілік есептеледі' if language_key == 'kz' else 'Считается частота', 'checkFunction': lambda code: has_any(code, ['count(', 'for '])}],
                4: [{'id': 'dict_created', 'description': 'Сөздік жасалған' if language_key == 'kz' else 'Создан словарь', 'checkFunction': lambda code: has_any(code, ['{', ':'])}],
                5: [{'id': 'journal_updated', 'description': 'Журналға қосу бар' if language_key == 'kz' else 'Есть добавление в журнал', 'checkFunction': lambda code: has_any(code, ['append(', 'for '])}],
                6: [{'id': 'search_condition', 'description': 'Іздеу шарты бар' if language_key == 'kz' else 'Есть условие поиска', 'checkFunction': lambda code: has_any(code, ['in ', 'get('])}],
            }
            description = f'{practice_name}: ' + ('коллекциялармен жұмыс' if language_key == 'kz' else 'работа с коллекциями')
        else:
            checks_by_index = {}
            description = f'{practice_name}: ' + ('тақырып бойынша практика' if language_key == 'kz' else 'практика по теме')

        checks = checks_by_index.get(practice_index, generic_checks)
        return description, [
            {'id': item['id'], 'description': item['description'], 'passed': bool(item['checkFunction'])} if False else item
            for item in checks
        ]

    def submit_course_practice(self, payload: JourneyPracticeSubmit, user: Optional[User] = None, language: str = 'ru') -> dict:
        topics = self.get_course_journey(user, language)
        topic = next((item for item in topics if str(item.get('id')) == str(payload.topicId)), None)
        if not topic:
            return {
                'success': False,
                'message': 'Topic not found',
                'testResults': [],
                'starterCode': '',
                'description': '',
            }

        practices = topic.get('practices') if isinstance(topic, dict) else []
        if not isinstance(practices, list) or payload.practiceIndex < 0 or payload.practiceIndex >= len(practices):
            return {
                'success': False,
                'message': 'Practice not found',
                'testResults': [],
                'starterCode': '',
                'description': '',
            }

        practice_name = str(practices[payload.practiceIndex])
        topic_title = str(topic.get('title') or '')
        description, tests = self._course_practice_checks(str(payload.topicId), topic_title, payload.practiceIndex, practice_name, language)
        code = payload.code or ''

        test_results = []
        all_passed = True
        for test in tests:
            if not isinstance(test, dict):
                continue
            check_function = test.get('checkFunction')
            passed = bool(check_function(code)) if callable(check_function) else False
            test_results.append({
                'id': test.get('id', 'unknown'),
                'passed': passed,
                'message': test.get('description', 'Check'),
            })
            if not passed:
                all_passed = False

        if not code.strip():
            all_passed = False
            if not test_results:
                test_results.append({
                    'id': 'code_written',
                    'passed': False,
                    'message': 'Код написан' if normalize_language(language) == 'kz' else 'Код написан',
                })

        return {
            'success': all_passed,
            'message': 'Задание выполнено' if all_passed else 'Проверьте код и попробуйте снова',
            'description': description,
            'starterCode': '# Кодты мұнда жаз\n' if normalize_language(language) == 'kz' else '# Write your code here\n',
            'testResults': test_results,
        }

    # Achievement operations
    def get_achievements(self, category: str = "all", user: Optional[User] = None) -> list[dict]:
        """Get achievements with optional category filter and user-based progress"""
        definitions = [
            {
                "id": 1,
                "title": "Первый байт",
                "description": "Решите первую миссию",
                "flavorText": "Каждый большой путь начинается с маленького шага.",
                "icon": "Code2",
                "rarity": "common",
                "category": "coding",
                "maxProgress": 1,
                "globalRate": 92.0,
                "xpReward": 20,
                "metric": "solved_missions",
            },
            {
                "id": 2,
                "title": "Практикант",
                "description": "Решите 3 миссии",
                "flavorText": "Тренировка превращает знания в навык.",
                "icon": "Target",
                "rarity": "rare",
                "category": "coding",
                "maxProgress": 3,
                "globalRate": 68.0,
                "xpReward": 40,
                "metric": "solved_missions",
            },
            {
                "id": 3,
                "title": "Код-мастер",
                "description": "Решите 10 миссий",
                "flavorText": "Упорство и практика открывают уровень мастера.",
                "icon": "Crown",
                "rarity": "epic",
                "category": "coding",
                "maxProgress": 10,
                "globalRate": 24.0,
                "xpReward": 90,
                "metric": "solved_missions",
            },
            {
                "id": 4,
                "title": "Серия 3",
                "description": "Удерживайте серию 3 дня",
                "flavorText": "Главный секрет — возвращаться к практике каждый день.",
                "icon": "Flame",
                "rarity": "rare",
                "category": "streak",
                "maxProgress": 3,
                "globalRate": 44.0,
                "xpReward": 50,
                "metric": "streak_days",
            },
            {
                "id": 5,
                "title": "Огненная серия",
                "description": "Удерживайте серию 7 дней",
                "flavorText": "Семь дней подряд — это уже суперсила ученика.",
                "icon": "Sparkles",
                "rarity": "legendary",
                "category": "streak",
                "maxProgress": 7,
                "globalRate": 9.0,
                "xpReward": 140,
                "metric": "streak_days",
            },
            {
                "id": 6,
                "title": "Первый пост",
                "description": "Опубликуйте первую запись в сообществе",
                "flavorText": "Делиться знаниями — важная часть обучения.",
                "icon": "Gift",
                "rarity": "common",
                "category": "community",
                "maxProgress": 1,
                "globalRate": 56.0,
                "xpReward": 25,
                "metric": "community_posts",
            },
            {
                "id": 7,
                "title": "Голос сообщества",
                "description": "Опубликуйте 5 записей",
                "flavorText": "Ты вдохновляешь других своим прогрессом.",
                "icon": "Trophy",
                "rarity": "rare",
                "category": "community",
                "maxProgress": 5,
                "globalRate": 16.0,
                "xpReward": 60,
                "metric": "community_posts",
            },
            {
                "id": 8,
                "title": "Секрет: Упорный",
                "description": "Сделайте 15 попыток запуска",
                "flavorText": "Ошибки — не помеха, а лестница к результату.",
                "icon": "LockKeyhole",
                "rarity": "epic",
                "category": "secret",
                "maxProgress": 15,
                "globalRate": 13.0,
                "xpReward": 80,
                "metric": "total_attempts",
            },
            {
                "id": 9,
                "title": "Секрет: Финалист",
                "description": "Завершите 3 курса",
                "flavorText": "Ты умеешь доводить обучение до конца.",
                "icon": "Sword",
                "rarity": "legendary",
                "category": "secret",
                "maxProgress": 3,
                "globalRate": 7.0,
                "xpReward": 150,
                "metric": "completed_courses",
            },
        ]

        metrics = {
            "solved_missions": 0,
            "streak_days": 0,
            "community_posts": 0,
            "total_attempts": 0,
            "completed_courses": 0,
        }

        unlock_dates: dict[str, str] = {}
        should_save_unlock_dates = False

        if user:
            settings = self._get_user_settings(user)
            mission_progress = settings.get("mission_progress") if isinstance(settings.get("mission_progress"), dict) else {}
            mission_attempts = settings.get("mission_attempts") if isinstance(settings.get("mission_attempts"), dict) else {}
            course_progress = settings.get("course_progress") if isinstance(settings.get("course_progress"), dict) else {}

            metrics["solved_missions"] = sum(
                1
                for value in mission_progress.values()
                if isinstance(value, dict) and value.get("completed")
            )
            metrics["streak_days"] = int(user.streak or 0)
            metrics["total_attempts"] = sum(
                int((value or {}).get("totalAttempts", 0) or 0)
                for value in mission_attempts.values()
                if isinstance(value, dict)
            )
            metrics["completed_courses"] = sum(
                1
                for value in course_progress.values()
                if isinstance(value, dict) and value.get("completed")
            )

            post_author_candidates = [str(user.name or "").strip(), str(user.username or "").strip()]
            post_author_candidates = [candidate for candidate in post_author_candidates if candidate]
            if post_author_candidates:
                metrics["community_posts"] = (
                    self.db.query(Post)
                    .filter(Post.author_name.in_(post_author_candidates))
                    .count()
                )

            raw_unlock_dates = settings.get("achievement_unlock_dates")
            if isinstance(raw_unlock_dates, dict):
                unlock_dates = {str(key): str(value) for key, value in raw_unlock_dates.items()}

        db_achievements = self.db.query(Achievement).all()
        db_overrides = {int(item.id): item for item in db_achievements}

        items: list[dict] = []
        for definition in definitions:
            achievement_id = int(definition["id"])
            db_item = db_overrides.get(achievement_id)
            max_progress = int(definition["maxProgress"])

            if db_item:
                max_progress = max(1, int(db_item.total or max_progress))

            metric_name = str(definition["metric"])
            current_raw = int(metrics.get(metric_name, 0) or 0)
            progress = max(0, min(current_raw, max_progress))
            unlocked = progress >= max_progress

            key = str(achievement_id)
            if unlocked and key not in unlock_dates and user:
                unlock_dates[key] = datetime.utcnow().strftime("%d.%m.%Y")
                should_save_unlock_dates = True

            if category != "all" and definition["category"] != category:
                continue

            items.append(
                {
                    "id": achievement_id,
                    "title": db_item.title if db_item and db_item.title else definition["title"],
                    "description": db_item.description if db_item and db_item.description else definition["description"],
                    "flavorText": definition["flavorText"],
                    "icon": db_item.icon if db_item and db_item.icon else definition["icon"],
                    "rarity": db_item.rarity if db_item and db_item.rarity else definition["rarity"],
                    "category": db_item.category if db_item and db_item.category else definition["category"],
                    "progress": int(progress),
                    "maxProgress": int(max_progress),
                    "total": int(max_progress),
                    "unlocked": bool(unlocked),
                    "date": unlock_dates.get(key),
                    "globalRate": float(definition["globalRate"]),
                    "xpReward": int(definition["xpReward"]),
                }
            )

        if should_save_unlock_dates and user:
            settings = self._get_user_settings(user)
            settings["achievement_unlock_dates"] = unlock_dates
            self._save_user_settings(user, settings)

        return sorted(items, key=lambda item: int(item["id"]))

    # Leaderboard operations
    def get_leaderboard(
        self, 
        scope: Literal["global", "friends", "school"] = "global",
        period: Literal["all", "month"] = "all"
    ) -> List[LeaderboardEntry]:
        """Get leaderboard entries"""
        query = self.db.query(LeaderboardEntry)
        
        if scope != "global":
            query = query.filter(LeaderboardEntry.scope == scope)

        query = query.order_by(LeaderboardEntry.rank.asc())
        return query.all()

    # Stats operations
    def get_stats(self, user: Optional[User] = None) -> dict:
        """Get user stats from database/user state without mock fallbacks"""
        if not user:
            return {
                "totalXp": 0,
                "problemsSolved": 0,
                "codingHours": 0,
                "accuracy": 0,
            }

        settings = self._get_user_settings(user)
        mission_progress = settings.get("mission_progress") or {}
        solved = sum(1 for value in mission_progress.values() if isinstance(value, dict) and value.get("completed"))

        mission_attempts = settings.get("mission_attempts") if isinstance(settings.get("mission_attempts"), dict) else {}
        total_attempts = 0
        for attempt in mission_attempts.values():
            if isinstance(attempt, dict):
                total_attempts += int(attempt.get("totalAttempts", 0) or 0)

        if total_attempts > 0:
            accuracy = int(round((solved / total_attempts) * 100))
            accuracy = max(0, min(100, accuracy))
        else:
            accuracy = 100 if solved > 0 else 0

        coding_hours = settings.get("coding_hours")
        derived_hours = round(max(0.3, solved * 0.25, total_attempts * 0.12), 1) if (solved or total_attempts) else 0
        if isinstance(coding_hours, (int, float)):
            coding_hours = max(float(coding_hours), derived_hours)
        else:
            coding_hours = derived_hours

        stored_accuracy = settings.get("accuracy")
        if isinstance(stored_accuracy, (int, float)):
            accuracy = int(max(0, min(100, stored_accuracy)))

        return {
            "totalXp": int(user.xp or 0),
            "problemsSolved": int(solved),
            "codingHours": float(coding_hours),
            "accuracy": int(accuracy),
        }

    def get_activity(self, user: Optional[User] = None) -> list:
        """Get user activity from persisted user settings"""
        if not user:
            return []
        settings = self._get_user_settings(user)
        activity = settings.get("activity")
        if isinstance(activity, list) and activity:
            return activity

        mission_progress = settings.get("mission_progress") or {}
        solved = sum(1 for value in mission_progress.values() if isinstance(value, dict) and value.get("completed"))
        mission_attempts = settings.get("mission_attempts") if isinstance(settings.get("mission_attempts"), dict) else {}
        total_attempts = sum(int((value or {}).get("totalAttempts", 0) or 0) for value in mission_attempts.values() if isinstance(value, dict))

        from datetime import timedelta
        today = datetime.utcnow().date()
        baseline = max(0, int(user.xp or 0) // 8)
        momentum = max(0, solved * 3 + total_attempts)

        generated = []
        for offset in range(6, -1, -1):
            day = today - timedelta(days=offset)
            day_gain = baseline + max(0, momentum - offset * 2)
            generated.append({
                "day": day.strftime("%a"),
                "xp": int(max(0, day_gain)),
            })
        return generated

    def get_skills(self, user: Optional[User] = None) -> list:
        """Get user skills from persisted user settings"""
        if not user:
            return []
        settings = self._get_user_settings(user)
        skills = settings.get("skills")
        if isinstance(skills, list) and skills:
            return skills

        stats = self.get_stats(user)
        solved = int(stats.get("problemsSolved", 0) or 0)
        accuracy = int(stats.get("accuracy", 0) or 0)

        logic = min(100, 20 + solved * 6)
        syntax = min(100, 15 + solved * 7)
        speed = min(100, 10 + solved * 5)
        attention = min(100, max(15, accuracy))
        creativity = min(100, 25 + solved * 4)
        persistence = min(100, 20 + solved * 5)

        return [
            {"skill": "Логика", "value": logic},
            {"skill": "Синтаксис", "value": syntax},
            {"skill": "Скорость", "value": speed},
            {"skill": "Внимательность", "value": attention},
            {"skill": "Креативность", "value": creativity},
            {"skill": "Упорство", "value": persistence},
        ]

    def get_friends(self) -> list:
        """Community friends are disabled in solo mode"""
        return []

    def get_mission_progress(self, mission_id: str, user: Optional[User] = None) -> dict:
        """Get mission progress"""
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return {}

        return {
            "missionId": mission_id,
            "objectives": self._get_user_mission_objectives(mission, user),
            "testResults": []
        }

    def _get_mission_attempts(self, user: Optional[User]) -> dict:
        if not user:
            return {}
        settings = self._get_user_settings(user)
        attempts = settings.get("mission_attempts")
        return attempts if isinstance(attempts, dict) else {}

    def _save_mission_attempts(self, user: Optional[User], attempts: dict) -> None:
        if not user:
            return
        settings = self._get_user_settings(user)
        settings["mission_attempts"] = attempts
        self._save_user_settings(user, settings)

    def _get_submit_gate(self, user: Optional[User], mission_id: str) -> dict:
        if not user:
            return {"allowed": True, "retryAfterSeconds": 0}

        attempts = self._get_mission_attempts(user)
        mission_attempt = attempts.get(mission_id)
        if not isinstance(mission_attempt, dict):
            return {"allowed": True, "retryAfterSeconds": 0}

        cooldown_until = mission_attempt.get("cooldownUntil")
        if not cooldown_until:
            return {"allowed": True, "retryAfterSeconds": 0}

        try:
            cooldown_dt = datetime.fromisoformat(cooldown_until)
        except ValueError:
            return {"allowed": True, "retryAfterSeconds": 0}

        now = datetime.utcnow()
        if cooldown_dt <= now:
            return {"allowed": True, "retryAfterSeconds": 0}

        retry_after = int((cooldown_dt - now).total_seconds())
        if retry_after < 1:
            retry_after = 1
        return {"allowed": False, "retryAfterSeconds": retry_after}

    def _register_mission_attempt(self, user: Optional[User], mission_id: str, success: bool) -> dict:
        default_meta = {
            "totalAttempts": 0,
            "consecutiveFailures": 0,
            "cooldownUntil": None,
            "lastResult": "none",
            "lastAttemptAt": None,
        }

        if not user:
            return default_meta

        attempts = self._get_mission_attempts(user)
        current = attempts.get(mission_id) if isinstance(attempts.get(mission_id), dict) else {}

        total_attempts = int(current.get("totalAttempts", 0) or 0) + 1
        consecutive_failures = 0 if success else int(current.get("consecutiveFailures", 0) or 0) + 1

        cooldown_until = None
        if not success and consecutive_failures >= MAX_CONSECUTIVE_FAILS:
            cooldown_until = (datetime.utcnow() + timedelta(seconds=MISSION_COOLDOWN_SECONDS)).isoformat()
            consecutive_failures = 0

        meta = {
            "totalAttempts": total_attempts,
            "consecutiveFailures": consecutive_failures,
            "cooldownUntil": cooldown_until,
            "lastResult": "success" if success else "failed",
            "lastAttemptAt": datetime.utcnow().isoformat(),
        }

        attempts[mission_id] = meta
        self._save_mission_attempts(user, attempts)
        return meta

    def submit_mission(self, mission_id: str, payload: MissionSubmit, user: Optional[User] = None) -> dict:
        """Submit mission solution"""
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return {"success": False, "message": "Mission not found"}

        submit_gate = self._get_submit_gate(user, mission_id)
        if not submit_gate.get("allowed"):
            return {
                "success": False,
                "message": f"Слишком много неудачных попыток. Повторите через {submit_gate.get('retryAfterSeconds', 0)} сек.",
                "xpEarned": 0,
                "objectives": self._get_user_mission_objectives(mission, user),
                "terminalOutput": "",
                "terminalError": "Действует временная блокировка попыток",
                "courseProgress": {
                    "lessonAdvanced": False,
                    "courseCompleted": False,
                    "nextCourseUnlocked": False,
                    "activeCourseId": None,
                    "activeSeason": None,
                    "nextSeasonUnlocked": False,
                },
                "attemptMeta": {
                    "retryAfterSeconds": submit_gate.get("retryAfterSeconds", 0),
                    "cooldownActive": True,
                },
                "testResults": [],
            }

        # Basic validation - just check if code is provided
        if not payload.code or len(payload.code.strip()) < 10:
            attempt_meta = self._register_mission_attempt(user, mission_id, False)
            return {
                "success": False,
                "message": "Код слишком короткий",
                "xpEarned": 0,
                "objectives": self._get_user_mission_objectives(mission, user),
                "terminalOutput": "",
                "terminalError": "Код слишком короткий",
                "attemptMeta": {
                    "totalAttempts": attempt_meta.get("totalAttempts", 0),
                    "consecutiveFailures": attempt_meta.get("consecutiveFailures", 0),
                    "cooldownUntil": attempt_meta.get("cooldownUntil"),
                    "cooldownActive": bool(attempt_meta.get("cooldownUntil")),
                    "retryAfterSeconds": MISSION_COOLDOWN_SECONDS if attempt_meta.get("cooldownUntil") else 0,
                },
                "testResults": []
            }

        code = payload.code
        exec_result = self._execute_python_code(code)

        dynamic_test_results = self._evaluate_test_cases(mission, code, exec_result)

        checks = {
            "ports_list": bool(re.search(r"\bports\s*=\s*\[[^\]]+\]", code, re.MULTILINE)),
            "for_loop": bool(re.search(r"\bfor\s+\w+\s+in\s+ports\b", code, re.MULTILINE)),
            "print_check": bool(re.search(r"\bprint\s*\([^\)]*port[^\)]*\)", code, re.IGNORECASE | re.MULTILINE)),
            "access_granted": bool(re.search(r"\breturn\s+[\"']ACCESS GRANTED[\"']", code, re.MULTILINE)),
            "runtime_ok": exec_result["returncode"] == 0,
        }

        goal_patterns = [
            (["список", "ports"], checks["ports_list"]),
            (["цикл", "for"], checks["for_loop"]),
            (["сообщение", "провер"], checks["print_check"]),
            (["access granted", "верн"], checks["access_granted"]),
        ]

        objectives_source = self._get_user_mission_objectives(mission, user)
        test_results = dynamic_test_results
        if not test_results:
            test_results = [
                {"id": "ports_list", "passed": checks["ports_list"], "message": "Создан список ports"},
                {"id": "for_loop", "passed": checks["for_loop"], "message": "Добавлен цикл for по ports"},
                {"id": "print_check", "passed": checks["print_check"], "message": "Выводится сообщение проверки порта"},
                {"id": "access_granted", "passed": checks["access_granted"], "message": "Возвращается ACCESS GRANTED"},
                {"id": "runtime_ok", "passed": checks["runtime_ok"], "message": "Код выполняется без runtime ошибок"},
            ]

        result_by_id = {str(item.get("id")): bool(item.get("passed")) for item in test_results}

        updated_objectives = []
        for index, obj in enumerate(objectives_source or []):
            obj_copy = obj.copy() if isinstance(obj, dict) else {"title": str(obj), "completed": False}
            text = str(obj_copy.get("text", "")).lower()
            test_case_id = obj_copy.get("testCaseId")

            if test_case_id and str(test_case_id) in result_by_id:
                obj_copy["completed"] = result_by_id[str(test_case_id)]
                updated_objectives.append(obj_copy)
                continue

            completed = False
            for keywords, result in goal_patterns:
                if all(keyword in text for keyword in keywords):
                    completed = result
                    break

            if not text and index < len(goal_patterns):
                completed = goal_patterns[index][1]

            obj_copy["completed"] = completed
            updated_objectives.append(obj_copy)

        # Fallback by order if texts did not match known phrases
        if updated_objectives and not any(obj.get("completed") for obj in updated_objectives):
            for index, obj in enumerate(updated_objectives):
                if index == 0:
                    obj["completed"] = checks["ports_list"]
                elif index == 1:
                    obj["completed"] = checks["for_loop"]
                elif index == 2:
                    obj["completed"] = checks["print_check"]
                elif index == 3:
                    obj["completed"] = checks["access_granted"]

        all_completed = bool(updated_objectives) and all(obj.get("completed") for obj in updated_objectives)

        was_completed_before = False
        if user:
            settings = self._get_user_settings(user)
            saved_progress = settings.get("mission_progress") or {}
            previous = saved_progress.get(mission_id)
            if isinstance(previous, dict):
                was_completed_before = bool(previous.get("completed"))

        # Update mission/user progress
        self._save_user_mission_progress(mission, updated_objectives, all_completed, user)

        course_progress = {
            "lessonAdvanced": False,
            "courseCompleted": False,
            "nextCourseUnlocked": False,
            "activeCourseId": None,
            "activeSeason": None,
            "nextSeasonUnlocked": False,
        }

        xp_earned = 0

        if user and all_completed:
            resolved_course_id = payload.courseId or self._parse_course_id_from_chapter(mission.chapter)
            is_first_completion = not was_completed_before
            course_progress = self._advance_course_progress(
                user,
                resolved_course_id,
                completed_mission_id=mission_id,
                count_completion=is_first_completion,
            )
            if is_first_completion:
                xp_earned = int(mission.xp_reward or 0)

            if xp_earned > 0:
                user.xp = int(user.xp or 0) + xp_earned

        if user:
            self._append_progress_event(
                user=user,
                mission=mission,
                success=all_completed,
                xp_earned=xp_earned,
                xp_total=int(user.xp or 0),
            )

        attempt_meta = self._register_mission_attempt(user, mission_id, all_completed)

        if user:
            self.db.commit()
            self.db.refresh(user)

        # Save workspace snapshot for authenticated user
        if user:
            current_workspace = self.get_mission_workspace(mission_id, user)
            files = current_workspace.get("files") or self._get_default_mission_files(mission)
            if files:
                updated_files = []
                for file_item in files:
                    if file_item.get("name", "").endswith(".py"):
                        copy_file = dict(file_item)
                        copy_file["content"] = code
                        updated_files.append(copy_file)
                    else:
                        updated_files.append(file_item)
                self.save_mission_workspace(mission_id, updated_files, current_workspace.get("activeFileId"), user)

        return {
            "success": all_completed,
            "message": (
                "Задание уже выполнено ранее. XP начисляется только за первое прохождение."
                if all_completed and was_completed_before
                else ("Миссия выполнена!" if all_completed else "Не все цели выполнены. Проверь условия задания.")
            ),
            "xpEarned": xp_earned,
            "objectives": updated_objectives,
            "terminalOutput": exec_result["stdout"],
            "terminalError": exec_result["stderr"],
            "courseProgress": course_progress,
            "attemptMeta": {
                "totalAttempts": attempt_meta.get("totalAttempts", 0),
                "consecutiveFailures": attempt_meta.get("consecutiveFailures", 0),
                "cooldownUntil": attempt_meta.get("cooldownUntil"),
                "cooldownActive": bool(attempt_meta.get("cooldownUntil")),
                "retryAfterSeconds": MISSION_COOLDOWN_SECONDS if attempt_meta.get("cooldownUntil") else 0,
            },
            "runtime": {
                "returncode": exec_result["returncode"],
                "timedOut": exec_result["timedOut"],
            },
            "testResults": test_results,
        }

    def get_ui_data(self) -> dict:
        """UI metadata endpoint backed by server-side defaults"""
        return deepcopy(DEFAULT_UI_DATA)

    def get_logs(self) -> list:
        """System logs are not mocked and not persisted yet"""
        return []
