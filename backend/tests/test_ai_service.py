from __future__ import annotations

import pytest


class _DummyResponse:
    def __init__(self, content: str, finish_reason: str = "stop") -> None:
        self._payload = {
            "choices": [
                {
                    "message": {"content": content},
                    "finish_reason": finish_reason,
                }
            ]
        }

    def raise_for_status(self) -> None:
        return None

    def json(self) -> dict:
        return self._payload


class _DummyClient:
    def __init__(self, responses: list[_DummyResponse]) -> None:
        self.responses = responses
        self.requests: list[dict] = []
        self.stream_responses: list[_DummyStreamResponse] = []

    def post(self, path: str, json: dict) -> _DummyResponse:
        self.requests.append({"path": path, "json": json})
        if not self.responses:
            raise AssertionError("Unexpected extra OpenRouter request")
        return self.responses.pop(0)

    def stream(self, method: str, path: str, json: dict) -> _DummyStreamResponse:
        self.requests.append({"method": method, "path": path, "json": json})
        if not self.stream_responses:
            raise AssertionError("Unexpected extra OpenRouter stream request")
        return self.stream_responses.pop(0)


class _DummyStreamResponse:
    def __init__(self, lines: list[str]) -> None:
        self.lines = lines

    def __enter__(self) -> _DummyStreamResponse:
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        return None

    def raise_for_status(self) -> None:
        return None

    def iter_lines(self):
        yield from self.lines


@pytest.fixture
def ai_service(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-openrouter-key")
    monkeypatch.setenv("OPENROUTER_MODEL", "stepfun/step-3.5-flash:free")
    monkeypatch.setenv("OPENROUTER_REFERER", "https://py-path.vercel.app")
    monkeypatch.setenv("OPENROUTER_TITLE", "PyPath")

    from app.core.config import get_settings
    from app.services import ai_service as ai_service_module

    get_settings.cache_clear()

    dummy_client = _DummyClient(
        [
            _DummyResponse(
                "Сәлем! Мен саған көмектесуге әрқашан дайынмын. Бірақ менің басты мақсатым — сенің нағыз бағдар",
                finish_reason="length",
            ),
            _DummyResponse(
                "беру, яғни толық шешім емес, түсінікті бағыт пен келесі қадам ұсыну.",
                finish_reason="stop",
            ),
        ]
    )

    dummy_client.stream_responses = [
        _DummyStreamResponse(
            [
                'data: {"choices":[{"delta":{"content":"Сәлем! "},"finish_reason":null}]}',
                'data: {"choices":[{"delta":{"content":"Python — "},"finish_reason":null}]}',
                'data: {"choices":[{"delta":{"content":"үйренуге өте ыңғайлы тіл."},"finish_reason":"stop"}]}',
                'data: [DONE]',
            ]
        )
    ]

    monkeypatch.setattr(ai_service_module.httpx, "Client", lambda *args, **kwargs: dummy_client)

    return ai_service_module.AIService(), dummy_client


def test_chat_continues_truncated_response(ai_service):
    service, client = ai_service

    result = service.chat("user-1", "Сәлем, көмектесші", language="kz")

    assert "нағыз бағдар" in result
    assert "толық шешім емес" in result
    assert len(client.requests) == 2
    assert client.requests[0]["path"] == "/chat/completions"
    assert client.requests[0]["json"]["model"] == "stepfun/step-3.5-flash:free"
    assert service.message_history["user-1"][-1]["text"] == result


def test_stream_chat_yields_chunks_and_records_history(ai_service):
    service, client = ai_service

    chunks = list(service.stream_chat("user-2", "Сәлем, көмектесші", language="kz"))

    assert chunks == ["Сәлем! ", "Python — ", "үйренуге өте ыңғайлы тіл."]
    assert len(client.requests) == 1
    assert client.requests[0]["method"] == "POST"
    assert client.requests[0]["path"] == "/chat/completions"
    assert client.requests[0]["json"]["stream"] is True
    assert service.message_history["user-2"][-1]["text"] == "Сәлем! Python — үйренуге өте ыңғайлы тіл."


def test_chat_with_scaffolding_validates_response(ai_service):
    """Test that chat_with_scaffolding integrates scaffolding engine and validator."""
    service, client = ai_service
    
    # Clear initial responses from fixture
    client.responses.clear()
    
    # Add a response that should pass validation (has question, limited code)
    client.responses.append(
        _DummyResponse(
            "Хороший вопрос! Давай подумаем вместе. Какой подход ты уже пробовал? "
            "Вот небольшой пример:\n```python\nprint('Hello')\n```\nЧто дальше?",
            finish_reason="stop"
        )
    )
    
    result = service.chat_with_scaffolding("user-3", "Как написать программу?", language="ru")
    
    # Verify scaffolded response structure
    assert result.scaffolding_applied is True
    assert result.request_type is not None
    assert result.validation_result is not None
    assert result.validation_result.code_line_count <= 3
    # The original response has questions, so validation should detect them
    assert result.validation_result.has_leading_question is True
    assert len(result.rules_applied) > 0
    
    # Verify response text is returned (either original or fallback)
    assert len(result.response) > 0


def test_chat_with_scaffolding_detects_complete_solution(ai_service):
    """Test that chat_with_scaffolding detects and replaces complete solutions."""
    service, client = ai_service
    
    # Clear initial responses from fixture
    client.responses.clear()
    
    # Add a response with too much code (should fail validation)
    client.responses.append(
        _DummyResponse(
            "Вот полное решение:\n```python\ndef solve():\n    x = 5\n    y = 10\n    z = x + y\n    return z\n```",
            finish_reason="stop"
        )
    )
    
    result = service.chat_with_scaffolding("user-4", "Реши задачу", language="ru")
    
    # Verify validation detected the code
    assert result.validation_result.code_line_count > 3
    
    # Verify validation failed due to too much code
    assert result.validation_result.passed is False
    
    # Verify fallback hint was used instead (response should be different from original)
    assert "не могу дать полное решение" in result.response.lower() or "подсказка" in result.response.lower()


def test_get_scaffolding_status_returns_configuration(ai_service):
    """Test that get_scaffolding_status returns current configuration."""
    service, _ = ai_service
    
    status = service.get_scaffolding_status()
    
    # Verify status structure
    assert status.enabled is True
    assert len(status.rules) > 0
    assert status.system_prompt_preview is not None
    
    # Verify rules have required fields
    for rule in status.rules:
        assert "id" in rule
        assert "description" in rule
        assert "constraint_type" in rule
        assert "active" in rule
    
    # Verify system prompt contains scaffolding instructions
    assert "ментор" in status.system_prompt_preview.lower() or "mentor" in status.system_prompt_preview.lower()


def test_chat_with_scaffolding_logs_interaction(ai_service):
    """Test that chat_with_scaffolding logs interactions."""
    service, client = ai_service
    
    # Clear initial responses from fixture
    client.responses.clear()
    
    # Add a valid response
    client.responses.append(
        _DummyResponse(
            "Давай разберемся! Что ты уже знаешь об этой теме?",
            finish_reason="stop"
        )
    )
    
    # Get initial log count
    initial_logs = service.validation_logger.get_recent_logs(limit=1000)
    initial_count = len(initial_logs)
    
    # Make a scaffolded chat request
    result = service.chat_with_scaffolding("user-5", "Объясни циклы", language="ru")
    
    # Verify log was created
    new_logs = service.validation_logger.get_recent_logs(limit=1000)
    assert len(new_logs) == initial_count + 1
    
    # Verify log entry contains expected data
    latest_log = new_logs[0]
    assert latest_log.user_id == "user-5"
    assert latest_log.request_type is not None
    assert latest_log.validation_passed is not None
    assert len(latest_log.rules_applied) > 0
