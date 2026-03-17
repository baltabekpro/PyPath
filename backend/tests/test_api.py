from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> TestClient:
    test_db = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{test_db}")
    monkeypatch.setenv("API_V1_PREFIX", "/api/v1")
    get_settings.cache_clear()
    app = create_app()
    return TestClient(app)


@pytest.fixture
def auth_headers(client: TestClient) -> dict[str, str]:
    register_payload = {
        "username": "test_user",
        "email": "test_user@example.com",
        "password": "testpass123",
        "fullName": "Test User",
    }
    response = client.post("/auth/register", json=register_payload)
    if response.status_code == 201:
        token = response.json()["access_token"]
    else:
        login_response = client.post(
            "/auth/login",
            json={"username": register_payload["username"], "password": register_payload["password"]},
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_current_user(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.get("/currentUser", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "test_user"


def test_create_and_like_post(client: TestClient, auth_headers: dict[str, str]) -> None:
    payload = {
        "content": "Это тестовый пост для проверки FastAPI backend.",
        "tags": ["Python", "FastAPI"],
    }
    create_response = client.post("/posts", json=payload, headers=auth_headers)
    assert create_response.status_code == 201
    post = create_response.json()
    assert post["likes"] == 0

    like_response = client.post(f"/posts/{post['id']}/like", headers=auth_headers)
    assert like_response.status_code == 200
    assert like_response.json()["likes"] == 1


def test_versioned_alias(client: TestClient) -> None:
    response = client.get("/api/v1/stats")
    assert response.status_code == 200
    assert "totalXp" in response.json()


def test_not_found_problem_details(client: TestClient) -> None:
    response = client.get("/courses/999999")
    assert response.status_code == 404
    payload = response.json()
    assert payload["title"] == "Not Found"
    assert payload["status"] == 404


def test_progress_charts_endpoint(client: TestClient) -> None:
    response = client.get("/progress/charts")
    assert response.status_code == 200
    payload = response.json()
    assert "lineByTasks" in payload
    assert "topicProgress" in payload


def test_courses_include_grade_metadata(client: TestClient) -> None:
    response = client.get("/courses")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0
    assert "gradeBand" in payload[0]
    assert "section" in payload[0]


def test_courses_journey_endpoint(client: TestClient) -> None:
    response = client.get("/courses/journey")
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0
    assert "theory" in payload[0]
    assert "practices" in payload[0]


def test_courses_journey_progress_roundtrip(client: TestClient, auth_headers: dict[str, str]) -> None:
    get_response = client.get("/courses/journey/progress", headers=auth_headers)
    assert get_response.status_code == 200

    put_response = client.put(
        "/courses/journey/progress",
        json={
            "topicId": "course-1",
            "progress": {
                "theoryOpened": True,
                "completedPractices": [0, 1, 2],
            },
        },
        headers=auth_headers,
    )
    assert put_response.status_code == 200
    payload = put_response.json()
    assert "course-1" in payload
    assert payload["course-1"]["theoryOpened"] is True


def test_courses_journey_progress_blocks_practice_without_theory(client: TestClient, auth_headers: dict[str, str]) -> None:
    put_response = client.put(
        "/courses/journey/progress",
        json={
            "topicId": "course-2",
            "progress": {
                "theoryOpened": False,
                "completedPractices": [0, 1, 2],
            },
        },
        headers=auth_headers,
    )
    assert put_response.status_code == 200
    payload = put_response.json()
    assert payload["course-2"]["theoryOpened"] is False
    assert payload["course-2"]["completedPractices"] == []


def test_courses_journey_progress_enforces_sequential_practice(client: TestClient, auth_headers: dict[str, str]) -> None:
    put_response = client.put(
        "/courses/journey/progress",
        json={
            "topicId": "course-3",
            "progress": {
                "theoryOpened": True,
                "completedPractices": [0, 2, 3],
            },
        },
        headers=auth_headers,
    )
    assert put_response.status_code == 200
    payload = put_response.json()
    assert payload["course-3"]["completedPractices"] == [0]
