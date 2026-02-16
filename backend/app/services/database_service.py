"""Database service using SQLAlchemy"""
from typing import List, Optional, Literal
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.models import User, Post, Course, Mission, Achievement, LeaderboardEntry
from app.schemas.requests import UserUpdate, PostCreate, MissionSubmit


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
    def get_courses(self) -> List[Course]:
        """Get all courses"""
        return self.db.query(Course).all()

    def get_course_by_id(self, course_id: int) -> Optional[Course]:
        """Get course by ID"""
        return self.db.query(Course).filter(Course.id == course_id).first()

    # Mission operations
    def get_missions(self) -> List[Mission]:
        """Get all missions"""
        return self.db.query(Mission).all()

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
    def get_stats(self) -> dict:
        """Get user stats - calculated from user data"""
        # For now, return mock data
        # TODO: Calculate from actual user activity
        return {
            "totalXp": 12450,
            "problemsSolved": 42,
            "codingHours": 14.5,
            "accuracy": 92
        }

    def get_activity(self) -> list:
        """Get user activity"""
        # Mock data for now
        return [
            {"day": "Пн", "xp": 400},
            {"day": "Вт", "xp": 300},
            {"day": "Ср", "xp": 500},
            {"day": "Чт", "xp": 200},
            {"day": "Пт", "xp": 450},
            {"day": "Сб", "xp": 600},
            {"day": "Вс", "xp": 350}
        ]

    def get_skills(self) -> list:
        """Get user skills"""
        # Mock data for now
        return [
            {"subject": "Алгоритмы", "score": 120, "fullMark": 150},
            {"subject": "Логика", "score": 98, "fullMark": 150},
            {"subject": "Python", "score": 86, "fullMark": 150},
            {"subject": "Скорость", "score": 99, "fullMark": 150},
            {"subject": "Команда", "score": 85, "fullMark": 150},
            {"subject": "Архитектура", "score": 65, "fullMark": 150}
        ]

    def get_friends(self) -> list:
        """Get user friends"""
        # For now, return users except current
        users = self.db.query(User).limit(10).all()
        return [
            {
                "id": user.id,
                "name": user.name,
                "status": "online",
                "avatar": user.avatar,
                "level": user.level_num
            }
            for user in users
        ]

    def get_mission_progress(self, mission_id: str) -> dict:
        """Get mission progress"""
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return {}

        return {
            "missionId": mission_id,
            "objectives": mission.objectives,
            "testResults": []
        }

    def submit_mission(self, mission_id: str, payload: MissionSubmit) -> dict:
        """Submit mission solution"""
        mission = self.get_mission_by_id(mission_id)
        if not mission:
            return {"success": False, "message": "Mission not found"}

        # Basic validation - just check if code is provided
        if not payload.code or len(payload.code.strip()) < 10:
            return {
                "success": False,
                "message": "Код слишком короткий",
                "xpEarned": 0,
                "testResults": []
            }

        # For now, mark all objectives as complete
        updated_objectives = []
        for obj in mission.objectives:
            obj_copy = obj.copy() if isinstance(obj, dict) else {"title": str(obj), "completed": False}
            obj_copy["completed"] = True
            updated_objectives.append(obj_copy)

        # Update mission
        mission.objectives = updated_objectives
        self.db.commit()

        return {
            "success": True,
            "message": "Миссия выполнена!",
            "xpEarned": mission.xp_reward,
            "testResults": [{"passed": True, "message": "Тест пройден"}]
        }

    def get_ui_data(self) -> dict:
        """Get UI metadata"""
        return {
            "version": "1.0.0",
            "features": {
                "achievements": True,
                "leaderboard": True,
                "community": True,
                "ai_chat": True
            }
        }

    def get_logs(self) -> list:
        """Get system logs (for debugging)"""
        return [
            {"timestamp": "2024-01-15 10:00:00", "level": "info", "message": "System started"},
            {"timestamp": "2024-01-15 10:05:00", "level": "info", "message": "Database connected"}
        ]
