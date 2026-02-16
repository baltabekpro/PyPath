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


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_current_user(client: TestClient) -> None:
    response = client.get("/currentUser")
    assert response.status_code == 200
    assert response.json()["id"] == "u_1337"


def test_create_and_like_post(client: TestClient) -> None:
    payload = {
        "content": "Это тестовый пост для проверки FastAPI backend.",
        "tags": ["Python", "FastAPI"],
    }
    create_response = client.post("/posts", json=payload)
    assert create_response.status_code == 201
    post = create_response.json()
    assert post["likes"] == 0

    like_response = client.post(f"/posts/{post['id']}/like")
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
