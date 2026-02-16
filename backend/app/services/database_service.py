"""Database service using SQLAlchemy"""
from typing import List, Optional, Literal
import ast
import re
import subprocess
import sys
import tempfile
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from app.models.models import User, Post, Course, Mission, Achievement, LeaderboardEntry
from app.schemas.requests import (
    UserUpdate,
    PostCreate,
    MissionSubmit,
    CourseCreate,
    CourseUpdate,
    MissionCreate,
    MissionUpdate,
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


class DatabaseService:
    """Service for database operations"""

    def __init__(self, db: Session):
        self.db = db

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
        for key, value in update_dict.items():
            setattr(user, key, value)

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

    def create_post(self, post_data: PostCreate) -> Post:
        """Create new post"""
        post = Post(**post_data.model_dump())
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

    def _get_course_season(self, course_id: int) -> int:
        return ((course_id - 1) // COURSE_SEASON_SIZE) + 1

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

    def _advance_course_progress(self, user: Optional[User], requested_course_id: Optional[int] = None) -> dict:
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

        lesson_advanced = False
        course_completed_now = False
        next_course_unlocked = False

        completed_lessons = int(active_entry.get("completedLessons", 0) or 0)
        total_lessons = int(active_entry.get("totalLessons", 1) or 1)

        if completed_lessons < total_lessons:
            completed_lessons += 1
            lesson_advanced = True

        active_entry["completedLessons"] = completed_lessons
        active_entry["progress"] = int(round((completed_lessons / total_lessons) * 100))
        active_entry["stars"] = max(int(active_entry.get("stars", 0) or 0), self._score_course_stars(completed_lessons, total_lessons))
        active_entry["updatedAt"] = datetime.utcnow().isoformat()

        if completed_lessons >= total_lessons and not active_entry.get("completed"):
            active_entry["completed"] = True
            course_completed_now = True

        ordered_ids = sorted(int(key) for key in progress.keys())
        if course_completed_now and active_course_id in ordered_ids:
            current_index = ordered_ids.index(active_course_id)
            if current_index < len(ordered_ids) - 1:
                next_key = str(ordered_ids[current_index + 1])
                next_entry = progress.get(next_key)
                if isinstance(next_entry, dict) and not next_entry.get("unlocked"):
                    next_entry["unlocked"] = True
                    next_entry["updatedAt"] = datetime.utcnow().isoformat()
                    next_course_unlocked = True

        self._save_user_course_progress(user, progress)

        active_season = active_entry.get("season")
        next_season_unlocked = False
        if isinstance(active_season, int):
            next_season_unlocked = self._is_season_completed(progress, active_season)

            settings = self._get_user_settings(user)
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

    def get_courses(self, user: Optional[User] = None) -> List[dict]:
        """Get all courses with per-user progression when authenticated"""
        courses = self._get_courses_ordered()
        progress = self._get_user_course_progress(user, courses) if user else {}
        ordered_ids = [course.id for course in courses]

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
                "progress": int(course.progress or 0),
                "totalLessons": int(course.total_lessons or 0),
                "icon": course.icon,
                "color": course.color,
                "difficulty": course.difficulty,
                "stars": int(course.stars or 0),
                "isBoss": bool(course.is_boss),
                "locked": bool(course.locked),
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
                is_locked = (not bool(user_progress.get("unlocked"))) or (not season_unlocked)
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
                    }
                )

            response.append(item)

        return response

    def get_course_by_id(self, course_id: int) -> Optional[Course]:
        """Get course by ID"""
        return self.db.query(Course).filter(Course.id == course_id).first()

    def create_course(self, payload: CourseCreate) -> Course:
        """Create a new course"""
        next_id = (self.db.query(Course).order_by(Course.id.desc()).first().id + 1) if self.db.query(Course).first() else 1
        course = Course(
            id=next_id,
            title=payload.title,
            description=payload.description,
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
    def get_missions(self) -> List[Mission]:
        """Get all missions"""
        return self.db.query(Mission).order_by(Mission.id.asc()).all()

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
        missions = self.get_missions()
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

    # Achievement operations
    def get_achievements(self, category: str = "all") -> List[Achievement]:
        """Get achievements with optional category filter"""
        query = self.db.query(Achievement)
        
        if category != "all":
            query = query.filter(Achievement.category == category)

        return query.all()

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

        coding_hours = settings.get("coding_hours")
        if not isinstance(coding_hours, (int, float)):
            coding_hours = 0

        accuracy = settings.get("accuracy")
        if not isinstance(accuracy, (int, float)):
            accuracy = 0

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
        return activity if isinstance(activity, list) else []

    def get_skills(self, user: Optional[User] = None) -> list:
        """Get user skills from persisted user settings"""
        if not user:
            return []
        settings = self._get_user_settings(user)
        skills = settings.get("skills")
        return skills if isinstance(skills, list) else []

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
            course_progress = self._advance_course_progress(user, payload.courseId)
            if not was_completed_before:
                xp_earned = int(mission.xp_reward or 0)
            elif course_progress.get("lessonAdvanced"):
                xp_earned = max(5, int((mission.xp_reward or 0) * 0.2))

            if xp_earned > 0:
                user.xp = int(user.xp or 0) + xp_earned

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
            "message": "Миссия выполнена!" if all_completed else "Не все цели выполнены. Проверь условия задания.",
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
        """UI metadata endpoint without JSON-backed mock data"""
        return {}

    def get_logs(self) -> list:
        """System logs are not mocked and not persisted yet"""
        return []
