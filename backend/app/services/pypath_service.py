from __future__ import annotations

from typing import Any

from fastapi import HTTPException

from app.schemas.requests import MissionSubmit, PostCreate, UserUpdate
from app.services.repository import JsonRepository


class PyPathService:
    def __init__(self, repo: JsonRepository) -> None:
        self.repo = repo

    @staticmethod
    def _sort_posts(posts: list[dict[str, Any]], sort: str) -> list[dict[str, Any]]:
        if sort == "fresh":
            return sorted(posts, key=lambda post: post.get("id", 0), reverse=True)
        return sorted(posts, key=lambda post: post.get("likes", 0), reverse=True)

    @staticmethod
    def _relative_time_label() -> str:
        return "только что"

    def get_current_user(self) -> dict[str, Any]:
        return self.repo.read_section("currentUser")

    def update_current_user(self, payload: UserUpdate) -> dict[str, Any]:
        def updater(db: dict[str, Any]) -> dict[str, Any]:
            current_user = db["currentUser"]
            updates = payload.model_dump(exclude_none=True)
            settings_updates = updates.pop("settings", None)
            current_user.update(updates)
            if settings_updates:
                current_settings = current_user.get("settings", {})
                current_settings.update(settings_updates)
                current_user["settings"] = current_settings
            db["currentUser"] = current_user
            return current_user

        return self.repo.update_db(updater)

    def get_stats(self) -> dict[str, Any]:
        return self.repo.read_section("stats")

    def get_activity(self) -> list[dict[str, Any]]:
        return self.repo.read_section("activity")

    def get_skills(self) -> list[dict[str, Any]]:
        return self.repo.read_section("skills")

    def get_courses(self) -> list[dict[str, Any]]:
        return self.repo.read_section("courses")

    def get_course_by_id(self, course_id: int) -> dict[str, Any]:
        courses = self.get_courses()
        for course in courses:
            if course.get("id") == course_id:
                return course
        raise HTTPException(status_code=404, detail="Course not found")

    def get_leaderboard(self, scope: str, period: str) -> list[dict[str, Any]]:
        db = self.repo.load()
        leaderboard = db["leaderboard"]
        current_user_name = db["currentUser"]["name"]

        if scope == "friends":
            filtered = [item for item in leaderboard if item.get("isFriend") or item.get("name") == current_user_name]
        elif scope == "school":
            filtered = [item for item in leaderboard if item.get("isSchool") or item.get("name") == current_user_name]
        else:
            filtered = leaderboard

        if period == "month":
            filtered = sorted(filtered, key=lambda entry: entry.get("xp", 0), reverse=True)

        return sorted(filtered, key=lambda entry: entry.get("rank", 10_000))

    def get_friends(self) -> list[dict[str, Any]]:
        return self.repo.read_section("friends")

    def get_posts(self, sort: str, tag: str | None) -> list[dict[str, Any]]:
        posts = self.repo.read_section("posts")
        if tag:
            normalized = tag.strip().lower()
            posts = [
                post
                for post in posts
                if any(existing_tag.lower() == normalized for existing_tag in post.get("tags", []))
            ]
        return self._sort_posts(posts, sort)

    def create_post(self, payload: PostCreate) -> dict[str, Any]:
        def updater(db: dict[str, Any]) -> dict[str, Any]:
            posts = db["posts"]
            next_id = max((post.get("id", 0) for post in posts), default=0) + 1
            user = db["currentUser"]
            new_post = {
                "id": next_id,
                "author": {
                    "name": user.get("fullName") or user.get("name"),
                    "avatar": user.get("avatar"),
                    "level": user.get("levelNum", 1),
                },
                "time": self._relative_time_label(),
                "content": payload.content,
                "code": payload.code,
                "tags": payload.tags,
                "likes": 0,
                "comments": 0,
                "liked": False,
            }
            posts.insert(0, new_post)
            db["posts"] = posts
            return new_post

        return self.repo.update_db(updater)

    def like_post(self, post_id: int) -> dict[str, Any]:
        def updater(db: dict[str, Any]) -> dict[str, Any]:
            posts = db["posts"]
            for post in posts:
                if post.get("id") == post_id:
                    post["likes"] = int(post.get("likes", 0)) + 1
                    post["liked"] = True
                    return {"success": True, "likes": post["likes"]}
            raise HTTPException(status_code=404, detail="Post not found")

        return self.repo.update_db(updater)

    def get_achievements(self, category: str) -> list[dict[str, Any]]:
        achievements = self.repo.read_section("achievements")
        if category == "all":
            return achievements
        return [item for item in achievements if item.get("category") == category]

    def get_missions(self) -> list[dict[str, Any]]:
        return self.repo.read_section("missions")

    def get_mission_by_id(self, mission_id: str) -> dict[str, Any]:
        missions = self.get_missions()
        for mission in missions:
            if mission.get("id") == mission_id:
                return mission
        raise HTTPException(status_code=404, detail="Mission not found")

    def get_mission_progress(self, mission_id: str) -> dict[str, Any]:
        mission = self.get_mission_by_id(mission_id)
        objectives = mission.get("objectives", [])
        total = len(objectives)
        completed = sum(1 for objective in objectives if objective.get("completed"))
        completion_percent = round((completed / total) * 100) if total > 0 else 0

        return {
            "missionId": mission_id,
            "objectives": objectives,
            "completed": completed,
            "total": total,
            "completionPercent": completion_percent,
        }

    def submit_mission(self, mission_id: str, payload: MissionSubmit) -> dict[str, Any]:
        normalized_code = payload.code.upper()
        has_access_granted = "ACCESS GRANTED" in normalized_code
        has_for_loop = "FOR " in normalized_code
        has_ports = "PORTS" in normalized_code
        has_print = "PRINT(" in normalized_code

        success = has_access_granted

        def updater(db: dict[str, Any]) -> dict[str, Any]:
            missions = db.get("missions", [])
            mission = next((item for item in missions if item.get("id") == mission_id), None)
            if mission is None:
                raise HTTPException(status_code=404, detail="Mission not found")

            objectives = mission.get("objectives", [])
            objective_rules = [
                lambda: has_ports,
                lambda: has_for_loop,
                lambda: has_print,
                lambda: has_access_granted,
            ]

            for idx, objective in enumerate(objectives):
                if success:
                    objective["completed"] = True
                elif idx < len(objective_rules):
                    objective["completed"] = bool(objective_rules[idx]())

            mission["objectives"] = objectives

            return {
                "success": success,
                "message": "Миссия выполнена. Система взломана!" if success else "Код принят, но цель не достигнута. Проверь условие и вывод.",
                "xpEarned": 50 if success else 0,
                "objectives": objectives,
            }

        return self.repo.update_db(updater)

    def get_ui_data(self) -> dict[str, Any]:
        return self.repo.read_section("uiData")

    def get_logs(self) -> list[dict[str, Any]]:
        return self.repo.read_section("logs")
