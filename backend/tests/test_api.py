from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_app


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch):
    test_db = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{test_db}")
    monkeypatch.setenv("API_V1_PREFIX", "/api/v1")
    get_settings.cache_clear()
    # Reset the cached database engine so the new DATABASE_URL takes effect.
    from app.core.database import reset_engine
    reset_engine()
    app = create_app()
    with TestClient(app) as client:
        yield client


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


def test_current_user_grade_persists(client: TestClient, auth_headers: dict[str, str]) -> None:
    update_response = client.put(
        "/currentUser",
        json={"settings": {"currentGrade": "9"}},
        headers=auth_headers,
    )
    assert update_response.status_code == 200

    response = client.get("/currentUser", headers=auth_headers)
    assert response.status_code == 200
    payload = response.json()
    assert payload["settings"]["currentGrade"] == "9"


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


def test_courses_journey_endpoint_kazakh(client: TestClient) -> None:
    response = client.get("/courses/journey", headers={"X-App-Language": "kz"})
    assert response.status_code == 200
    payload = response.json()
    assert isinstance(payload, list)
    assert len(payload) > 0
    assert "theory" in payload[0]
    assert any(char in payload[0]["theory"].lower() for char in "әіңғүұқөһ")
    assert any(keyword in payload[0]["title"].lower() for keyword in ("тарау", "сынып"))


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


def test_courses_journey_practice_submit_rejects_blank_code(client: TestClient) -> None:
    response = client.post(
        "/courses/journey/practice/submit",
        json={
            "topicId": "course-1",
            "practiceIndex": 0,
            "code": "",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is False
    assert payload["testResults"]
    assert all(result["passed"] is False for result in payload["testResults"])


def test_courses_journey_practice_submit_passes_valid_code(client: TestClient) -> None:
    response = client.post(
        "/courses/journey/practice/submit",
        json={
            "topicId": "course-1",
            "practiceIndex": 0,
            "code": "name = 'A'\nprint(name)",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert all(result["passed"] is True for result in payload["testResults"])


def test_courses_journey_practice_submit_rejects_starter_template(client: TestClient) -> None:
    response = client.post(
        "/courses/journey/practice/submit",
        json={
            "topicId": "course-3",
            "practiceIndex": 0,
            "code": "# Write your code here\n",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is False
    assert any(result["passed"] is False for result in payload["testResults"])


def test_courses_journey_practice_submit_checks_if_else_topic(client: TestClient) -> None:
    response = client.post(
        "/courses/journey/practice/submit",
        json={
            "topicId": "course-3",
            "practiceIndex": 0,
            "code": "age = 12\nif age >= 10:\n    print('Можно')\nelse:\n    print('Пока рано')",
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["success"] is True
    assert all(result["passed"] is True for result in payload["testResults"])


# ---------------------------------------------------------------------------
# Registration tests
# ---------------------------------------------------------------------------

def test_registration_creates_user(client: TestClient) -> None:
    """Registration endpoint should return 201 with an access token."""
    response = client.post(
        "/auth/register",
        json={
            "username": "brand_new_user",
            "email": "brand_new@example.com",
            "password": "securepass123",
            "fullName": "Brand New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_registration_duplicate_username_rejected(client: TestClient) -> None:
    """Registering with an already-taken username must return 400."""
    payload = {
        "username": "dup_user",
        "email": "dup1@example.com",
        "password": "pass12345",
        "fullName": "Dup User",
    }
    first = client.post("/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post(
        "/auth/register",
        json={**payload, "email": "dup2@example.com"},
    )
    assert second.status_code == 400


def test_login_after_registration(client: TestClient) -> None:
    """A user registered via the API should be able to login immediately."""
    creds = {
        "username": "login_test_user",
        "email": "login_test@example.com",
        "password": "loginpass123",
        "fullName": "Login Test",
    }
    client.post("/auth/register", json=creds)
    login_resp = client.post(
        "/auth/login",
        json={"username": creds["username"], "password": creds["password"]},
    )
    assert login_resp.status_code == 200
    assert "access_token" in login_resp.json()


# ---------------------------------------------------------------------------
# Language detection tests
# ---------------------------------------------------------------------------

def test_language_detection_kazakh() -> None:
    """Kazakh-specific Unicode characters should be detected as 'kz'."""
    from app.services.ai_service import detect_language

    assert detect_language("Сәлем, Python!") == "kz"
    assert detect_language("Айнымалы дегеніміз не?") == "kz"


def test_language_detection_russian() -> None:
    """Russian text without Kazakh-unique characters should be detected as 'ru'."""
    from app.services.ai_service import detect_language

    assert detect_language("Привет! Как дела?") == "ru"
    assert detect_language("print выводит текст") == "ru"


# ---------------------------------------------------------------------------
# Admin users endpoint tests
# ---------------------------------------------------------------------------

def test_admin_users_requires_auth(client: TestClient) -> None:
    """The /admin/users endpoint must reject unauthenticated requests."""
    response = client.get("/admin/users")
    assert response.status_code == 401


def test_admin_users_requires_admin_role(client: TestClient, auth_headers: dict[str, str]) -> None:
    """A regular user must not access /admin/users."""
    response = client.get("/admin/users", headers=auth_headers)
    assert response.status_code == 403


def test_admin_users_accessible_to_admin(client: TestClient) -> None:
    """An admin user should receive the user list from /admin/users."""
    # Register a regular user first so there is data to return
    client.post(
        "/auth/register",
        json={
            "username": "some_regular_user",
            "email": "regular@example.com",
            "password": "pass12345",
            "fullName": "Regular",
        },
    )

    # Authenticate as the seeded admin account (created by ensure_admin_account)
    login = client.post(
        "/auth/login",
        json={"username": "admin_pypath", "password": "Admin12345!"},
    )
    assert login.status_code == 200, login.text
    admin_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    response = client.get("/admin/users", headers=admin_headers)
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)
    assert len(users) >= 1
    # Each entry must have the expected fields and no password hash
    for u in users:
        assert "id" in u
        assert "username" in u
        assert "email" in u
        assert "password" not in u


# ---------------------------------------------------------------------------
# Quiz generation tests
# ---------------------------------------------------------------------------

def test_quiz_generate_returns_questions(client: TestClient) -> None:
    """The quiz generation endpoint should return a valid response structure."""
    response = client.post(
        "/ai/generate-quiz",
        json={
            "topic": "Переменные в Python",
            "theory_content": "Переменные хранят значения. Например: x = 5.",
            "num_questions": 1,
            "language": "ru",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "questions" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) >= 1
    q = data["questions"][0]
    assert "question" in q
    assert "options" in q
    assert "correct_index" in q


def test_quiz_generate_kazakh_language(client: TestClient) -> None:
    """Quiz generation in Kazakh language should return kz in the response."""
    response = client.post(
        "/ai/generate-quiz",
        json={
            "topic": "Айнымалылар",
            "theory_content": "Айнымалы мән сақтайды.",
            "num_questions": 1,
            "language": "kz",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["language"] == "kz"
    assert len(data["questions"]) >= 1


def test_quiz_generate_returns_bilingual_translations(client: TestClient) -> None:
    response = client.post(
        "/ai/generate-quiz",
        json={
            "topic": "Переменные",
            "theory_content": "Переменные хранят значения. Например: x = 5.",
            "num_questions": 1,
            "language": "ru",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "translations" in data
    assert "ru" in data["translations"]
    assert "kz" in data["translations"]
    assert len(data["translations"]["kz"]) >= 1
