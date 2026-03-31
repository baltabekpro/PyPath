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
