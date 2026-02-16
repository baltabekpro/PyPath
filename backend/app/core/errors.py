from __future__ import annotations

from http import HTTPStatus
from typing import Any

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


def problem_response(
    *,
    status: int,
    title: str,
    detail: str,
    instance: str,
    extra: dict[str, Any] | None = None,
) -> JSONResponse:
    payload: dict[str, Any] = {
        "type": "about:blank",
        "title": title,
        "status": status,
        "detail": detail,
        "instance": instance,
    }
    if extra:
        payload.update(extra)
    return JSONResponse(status_code=status, content=payload)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    status = exc.status_code
    title = HTTPStatus(status).phrase if status in HTTPStatus._value2member_map_ else "HTTP Error"
    detail = str(exc.detail)
    return problem_response(status=status, title=title, detail=detail, instance=str(request.url.path))


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return problem_response(
        status=422,
        title="Validation Error",
        detail="Request validation failed",
        instance=str(request.url.path),
        extra={"errors": exc.errors()},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    return problem_response(
        status=500,
        title="Internal Server Error",
        detail="Unexpected server error",
        instance=str(request.url.path),
    )
