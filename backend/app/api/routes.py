from __future__ import annotations

from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.models import User
from app.schemas.requests import MissionSubmit, PostCreate, UserUpdate, NotificationPreferencesUpdate
from app.services.database_service import DatabaseService
from app.api.dependencies import get_db_service, get_current_user_optional, get_current_user


router = APIRouter()


DEFAULT_NOTIFICATIONS = [
    {
        "id": "n_1",
        "time": "2 мин назад",
        "text": "Новый квест доступен: Циклы и условия",
        "read": False,
    },
    {
        "id": "n_2",
        "time": "1 час назад",
        "text": "Оракул ответил на ваш последний вопрос",
        "read": False,
    },
    {
        "id": "n_3",
        "time": "вчера",
        "text": "Друг получил достижение: Баг-охотник",
        "read": True,
    },
]


DEFAULT_NOTIFICATION_PREFERENCES = [
    {"label": "Новые квесты и задачи", "enabled": True},
    {"label": "Ответы ментора", "enabled": True},
    {"label": "Достижения друзей", "enabled": False},
    {"label": "Новости обновлений", "enabled": False},
]


@router.get("/", tags=["Health"])
def root() -> dict[str, str]:
    """Root endpoint with API info"""
    return {
        "name": "PyPath Backend API",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@router.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    """Basic health check"""
    return {"status": "ok"}


@router.get("/health/live", tags=["Health"])
def live() -> dict[str, str]:
    """Liveness probe for orchestrators"""
    return {"status": "alive"}


@router.get("/health/ready", tags=["Health"])
def ready(service: DatabaseService = Depends(get_db_service)) -> dict[str, str]:
    """Readiness probe - checks database connection"""
    # Just check DB connection
    service.db.execute("SELECT 1")
    return {"status": "ready"}


@router.get("/currentUser", tags=["User"])
def get_current_user_route(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Get current authenticated user profile"""
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "fullName": user.full_name,
        "name": user.name,
        "avatar": user.avatar,
        "bio": user.bio,
        "level": user.level,
        "levelNum": user.level_num,
        "xp": user.xp,
        "maxXp": user.max_xp,
        "streak": user.streak,
        "rank": user.rank,
        "league": user.league,
        "settings": user.settings
    }


@router.put("/currentUser", tags=["User"])
def update_current_user(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Update current authenticated user profile"""
    updated_user = service.update_user(user.id, payload)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": updated_user.id,
        "username": updated_user.username,
        "email": updated_user.email,
        "fullName": updated_user.full_name,
        "name": updated_user.name,
        "avatar": updated_user.avatar,
        "bio": updated_user.bio,
        "level": updated_user.level,
        "levelNum": updated_user.level_num,
        "xp": updated_user.xp,
        "maxXp": updated_user.max_xp,
        "streak": updated_user.streak,
        "rank": updated_user.rank,
        "league": updated_user.league,
        "settings": updated_user.settings
    }


@router.get("/notifications", tags=["User"])
def get_notifications(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Get notifications list with unread and history groups"""
    settings = user.settings or {}
    notifications = settings.get("notifications_feed") or DEFAULT_NOTIFICATIONS
    preferences = settings.get("notification_preferences") or DEFAULT_NOTIFICATION_PREFERENCES

    unread = [n for n in notifications if not n.get("read")]
    history = [n for n in notifications if n.get("read")]

    return {
        "items": notifications,
        "unread": unread,
        "history": history,
        "preferences": preferences,
    }


@router.get("/notifications/history", tags=["User"])
def get_notifications_history(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Get notifications history (read items)"""
    settings = user.settings or {}
    notifications = settings.get("notifications_feed") or DEFAULT_NOTIFICATIONS
    history = [n for n in notifications if n.get("read")]
    return {"history": history}


@router.get("/notifications/preferences", tags=["User"])
def get_notification_preferences(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Get notification preferences"""
    settings = user.settings or {}
    preferences = settings.get("notification_preferences") or DEFAULT_NOTIFICATION_PREFERENCES
    return {"preferences": preferences}


@router.put("/notifications/preferences", tags=["User"])
def update_notification_preferences(
    payload: NotificationPreferencesUpdate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Update notification preferences"""
    settings = user.settings or {}
    settings["notification_preferences"] = payload.preferences
    user.settings = settings
    service.db.commit()
    return {"preferences": settings["notification_preferences"]}


@router.post("/notifications/mark-all-read", tags=["User"])
def mark_all_notifications_read(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Mark all notifications as read"""
    settings = user.settings or {}
    notifications = settings.get("notifications_feed") or DEFAULT_NOTIFICATIONS

    updated = []
    for item in notifications:
        copy_item = dict(item)
        copy_item["read"] = True
        updated.append(copy_item)

    settings["notifications_feed"] = updated
    user.settings = settings
    service.db.commit()

    return {"message": "All notifications marked as read", "items": updated}


@router.get("/stats", tags=["User"])
def get_stats(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user statistics (XP, problems solved, coding hours, accuracy)"""
    return service.get_stats()


@router.get("/activity", tags=["User"])
def get_activity(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user activity chart (XP earned by day)"""
    return service.get_activity()


@router.get("/skills", tags=["User"])
def get_skills(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user skill radar chart (algorithms, logic, Python, speed, teamwork, architecture)"""
    return service.get_skills()


@router.get("/courses", tags=["Courses"])
def get_courses(service: DatabaseService = Depends(get_db_service)):
    """Get all available courses with progress tracking"""
    courses = service.get_courses()
    return [
        {
            "id": c.id,
            "title": c.title,
            "description": c.description,
            "progress": c.progress,
            "totalLessons": c.total_lessons,
            "icon": c.icon,
            "color": c.color,
            "difficulty": c.difficulty,
            "stars": c.stars,
            "isBoss": c.is_boss,
            "locked": c.locked
        }
        for c in courses
    ]


@router.get("/courses/{course_id}", tags=["Courses"])
def get_course_by_id(course_id: int, service: DatabaseService = Depends(get_db_service)):
    """Get detailed information about specific course"""
    course = service.get_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "progress": course.progress,
        "totalLessons": course.total_lessons,
        "icon": course.icon,
        "color": course.color,
        "difficulty": course.difficulty,
        "stars": course.stars,
        "isBoss": course.is_boss,
        "locked": course.locked
    }


@router.get("/leaderboard", tags=["Community"])
def get_leaderboard(
    scope: Literal["global", "friends", "school"] = Query(default="global"),
    period: Literal["all", "month"] = Query(default="all"),
    service: DatabaseService = Depends(get_db_service),
):
    """Get leaderboard rankings (global, friends, or school scope)"""
    entries = service.get_leaderboard(scope, period)
    return [
        {
            "rank": e.rank,
            "name": e.name,
            "avatar": e.avatar,
            "xp": e.xp,
            "level": e.level,
            "badge": e.badge,
            "school": e.school
        }
        for e in entries
    ]


@router.get("/friends", tags=["Community"])
def get_friends(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user's friends list with online status"""
    return service.get_friends()


@router.get("/posts", tags=["Community"])
def get_posts(
    sort: Literal["popular", "fresh"] = Query(default="popular"),
    tag: str | None = None,
    service: DatabaseService = Depends(get_db_service),
):
    """Get community posts (sorted by popularity or freshness, filterable by tag)"""
    posts = service.get_posts(sort, tag)
    return [
        {
            "id": p.id,
            "author": {
                "name": p.author_name,
                "avatar": p.author_avatar,
                "level": p.author_level
            },
            "time": p.time,
            "content": p.content,
            "tags": p.tags,
            "likes": p.likes,
            "comments": p.comments,
            "liked": p.liked,
            "code": p.code
        }
        for p in posts
    ]


@router.post("/posts", status_code=201, tags=["Community"])
def create_post(
    payload: PostCreate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Create new community post with code snippets and tags"""
    post = service.create_post(payload)
    return {
        "id": post.id,
        "author": {
            "name": post.author_name,
            "avatar": post.author_avatar,
            "level": post.author_level
        },
        "time": post.time,
        "content": post.content,
        "tags": post.tags,
        "likes": post.likes,
        "comments": post.comments,
        "liked": post.liked,
        "code": post.code
    }


@router.post("/posts/{post_id}/like", tags=["Community"])
def like_post(
    post_id: int,
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Toggle like on community post"""
    post = service.like_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {
        "id": post.id,
        "likes": post.likes,
        "liked": post.liked
    }


@router.get("/achievements", tags=["Achievements"])
def get_achievements(
    category: Literal["all", "coding", "community", "streak", "secret"] = Query(default="all"),
    service: DatabaseService = Depends(get_db_service),
):
    """Get user achievements (filterable by category: coding, community, streak, secret)"""
    achievements = service.get_achievements(category)
    return [
        {
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "icon": a.icon,
            "rarity": a.rarity,
            "progress": a.progress,
            "total": a.total,
            "unlocked": a.unlocked,
            "category": a.category
        }
        for a in achievements
    ]


@router.get("/missions", tags=["Missions"])
def get_missions(service: DatabaseService = Depends(get_db_service)):
    """Get all available coding missions"""
    missions = service.get_missions()
    return [
        {
            "id": m.id,
            "title": m.title,
            "chapter": m.chapter,
            "description": m.description,
            "difficulty": m.difficulty,
            "xpReward": m.xp_reward,
            "objectives": m.objectives,
            "starterCode": m.starter_code,
            "testCases": m.test_cases,
            "hints": m.hints
        }
        for m in missions
    ]


@router.get("/missions/{mission_id}", tags=["Missions"])
def get_mission_by_id(mission_id: str, service: DatabaseService = Depends(get_db_service)):
    """Get detailed mission with starter code, test cases, and hints"""
    mission = service.get_mission_by_id(mission_id)
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    return {
        "id": mission.id,
        "title": mission.title,
        "chapter": mission.chapter,
        "description": mission.description,
        "difficulty": mission.difficulty,
        "xpReward": mission.xp_reward,
        "objectives": mission.objectives,
        "starterCode": mission.starter_code,
        "testCases": mission.test_cases,
        "hints": mission.hints
    }


@router.get("/missions/{mission_id}/progress", tags=["Missions"])
def get_mission_progress(mission_id: str, service: DatabaseService = Depends(get_db_service)):
    """Get current progress for specific mission"""
    return service.get_mission_progress(mission_id)


@router.post("/missions/{mission_id}/submit", tags=["Missions"])
def submit_mission(
    mission_id: str,
    payload: MissionSubmit,
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Submit code solution for mission and run test cases"""
    return service.submit_mission(mission_id, payload)


@router.get("/uiData", tags=["System"])
def get_ui_data(service: DatabaseService = Depends(get_db_service)):
    """Get UI configuration and feature flags"""
    return service.get_ui_data()


@router.get("/logs", tags=["System"])
def get_logs(service: DatabaseService = Depends(get_db_service)):
    """Get system logs (for debugging)"""
    return service.get_logs()

