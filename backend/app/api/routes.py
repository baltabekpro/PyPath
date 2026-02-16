from __future__ import annotations

from pathlib import Path
from typing import Literal, Optional

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import get_db
from app.models.models import User
from app.schemas.requests import MissionSubmit, PostCreate, UserUpdate
from app.services.database_service import DatabaseService
from app.api.dependencies import get_db_service, get_current_user_optional, get_current_user


router = APIRouter(tags=["PyPath"])


@router.get("/")
def root() -> dict[str, str]:
    return {
        "name": "PyPath Backend API",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/live")
def live() -> dict[str, str]:
    return {"status": "alive"}


@router.get("/health/ready")
def ready(service: DatabaseService = Depends(get_db_service)) -> dict[str, str]:
    # Just check DB connection
    service.db.execute("SELECT 1")
    return {"status": "ready"}


@router.get("/currentUser")
def get_current_user_route(
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Get current authenticated user"""
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


@router.put("/currentUser")
def update_current_user(
    payload: UserUpdate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Update current user"""
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


@router.get("/stats")
def get_stats(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user stats"""
    return service.get_stats()


@router.get("/activity")
def get_activity(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user activity"""
    return service.get_activity()


@router.get("/skills")
def get_skills(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user skills"""
    return service.get_skills()


@router.get("/courses")
def get_courses(service: DatabaseService = Depends(get_db_service)):
    """Get all courses"""
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


@router.get("/courses/{course_id}")
def get_course_by_id(course_id: int, service: DatabaseService = Depends(get_db_service)):
    """Get course by ID"""
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


@router.get("/leaderboard")
def get_leaderboard(
    scope: Literal["global", "friends", "school"] = Query(default="global"),
    period: Literal["all", "month"] = Query(default="all"),
    service: DatabaseService = Depends(get_db_service),
):
    """Get leaderboard"""
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


@router.get("/friends")
def get_friends(
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Get user friends"""
    return service.get_friends()


@router.get("/posts")
def get_posts(
    sort: Literal["popular", "fresh"] = Query(default="popular"),
    tag: str | None = None,
    service: DatabaseService = Depends(get_db_service),
):
    """Get posts"""
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


@router.post("/posts", status_code=201)
def create_post(
    payload: PostCreate,
    user: User = Depends(get_current_user),
    service: DatabaseService = Depends(get_db_service)
):
    """Create new post"""
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


@router.post("/posts/{post_id}/like")
def like_post(
    post_id: int,
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Like/unlike a post"""
    post = service.like_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return {
        "id": post.id,
        "likes": post.likes,
        "liked": post.liked
    }


@router.get("/achievements")
def get_achievements(
    category: Literal["all", "coding", "community", "streak", "secret"] = Query(default="all"),
    service: DatabaseService = Depends(get_db_service),
):
    """Get achievements"""
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


@router.get("/missions")
def get_missions(service: DatabaseService = Depends(get_db_service)):
    """Get all missions"""
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


@router.get("/missions/{mission_id}")
def get_mission_by_id(mission_id: str, service: DatabaseService = Depends(get_db_service)):
    """Get mission by ID"""
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


@router.get("/missions/{mission_id}/progress")
def get_mission_progress(mission_id: str, service: DatabaseService = Depends(get_db_service)):
    """Get mission progress"""
    return service.get_mission_progress(mission_id)


@router.post("/missions/{mission_id}/submit")
def submit_mission(
    mission_id: str,
    payload: MissionSubmit,
    user: Optional[User] = Depends(get_current_user_optional),
    service: DatabaseService = Depends(get_db_service)
):
    """Submit mission solution"""
    return service.submit_mission(mission_id, payload)


@router.get("/uiData")
def get_ui_data(service: DatabaseService = Depends(get_db_service)):
    """Get UI metadata"""
    return service.get_ui_data()


@router.get("/logs")
def get_logs(service: DatabaseService = Depends(get_db_service)):
    """Get system logs"""
    return service.get_logs()

