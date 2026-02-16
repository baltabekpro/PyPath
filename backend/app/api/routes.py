from __future__ import annotations

from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, Query

from app.core.config import get_settings
from app.schemas.requests import MissionSubmit, PostCreate, UserUpdate
from app.services.pypath_service import PyPathService
from app.services.repository import JsonRepository


def get_service() -> PyPathService:
    settings = get_settings()
    root_dir = Path(__file__).resolve().parents[2]
    data_file = root_dir / settings.data_file
    return PyPathService(JsonRepository(data_file))


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
def ready(service: PyPathService = Depends(get_service)) -> dict[str, str]:
    service.get_current_user()
    return {"status": "ready"}


@router.get("/currentUser")
def get_current_user(service: PyPathService = Depends(get_service)):
    return service.get_current_user()


@router.put("/currentUser")
def update_current_user(payload: UserUpdate, service: PyPathService = Depends(get_service)):
    return service.update_current_user(payload)


@router.get("/stats")
def get_stats(service: PyPathService = Depends(get_service)):
    return service.get_stats()


@router.get("/activity")
def get_activity(service: PyPathService = Depends(get_service)):
    return service.get_activity()


@router.get("/skills")
def get_skills(service: PyPathService = Depends(get_service)):
    return service.get_skills()


@router.get("/courses")
def get_courses(service: PyPathService = Depends(get_service)):
    return service.get_courses()


@router.get("/courses/{course_id}")
def get_course_by_id(course_id: int, service: PyPathService = Depends(get_service)):
    return service.get_course_by_id(course_id)


@router.get("/leaderboard")
def get_leaderboard(
    scope: Literal["global", "friends", "school"] = Query(default="global"),
    period: Literal["all", "month"] = Query(default="all"),
    service: PyPathService = Depends(get_service),
):
    return service.get_leaderboard(scope, period)


@router.get("/friends")
def get_friends(service: PyPathService = Depends(get_service)):
    return service.get_friends()


@router.get("/posts")
def get_posts(
    sort: Literal["popular", "fresh"] = Query(default="popular"),
    tag: str | None = None,
    service: PyPathService = Depends(get_service),
):
    return service.get_posts(sort, tag)


@router.post("/posts", status_code=201)
def create_post(payload: PostCreate, service: PyPathService = Depends(get_service)):
    return service.create_post(payload)


@router.post("/posts/{post_id}/like")
def like_post(post_id: int, service: PyPathService = Depends(get_service)):
    return service.like_post(post_id)


@router.get("/achievements")
def get_achievements(
    category: Literal["all", "coding", "community", "streak", "secret"] = Query(default="all"),
    service: PyPathService = Depends(get_service),
):
    return service.get_achievements(category)


@router.get("/missions")
def get_missions(service: PyPathService = Depends(get_service)):
    return service.get_missions()


@router.get("/missions/{mission_id}")
def get_mission_by_id(mission_id: str, service: PyPathService = Depends(get_service)):
    return service.get_mission_by_id(mission_id)


@router.get("/missions/{mission_id}/progress")
def get_mission_progress(mission_id: str, service: PyPathService = Depends(get_service)):
    return service.get_mission_progress(mission_id)


@router.post("/missions/{mission_id}/submit")
def submit_mission(mission_id: str, payload: MissionSubmit, service: PyPathService = Depends(get_service)):
    return service.submit_mission(mission_id, payload)


@router.get("/uiData")
def get_ui_data(service: PyPathService = Depends(get_service)):
    return service.get_ui_data()


@router.get("/logs")
def get_logs(service: PyPathService = Depends(get_service)):
    return service.get_logs()
