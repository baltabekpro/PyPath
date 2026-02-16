# PyPath Python Backend

Полноценный FastAPI backend в отдельной директории `backend/` с модульной архитектурой, валидацией, middleware, обработкой ошибок и тестами.

## Архитектура

```text
backend/
  app/
    api/           # маршруты
    core/          # config, middleware, exception handlers
    schemas/       # pydantic схемы запросов
    services/      # бизнес-логика + доступ к данным
    main.py        # create_app()
  data/db.json     # JSON хранилище
  tests/           # smoke tests
  main.py          # entrypoint (uvicorn main:app)
```

## Возможности

- Полный API-контракт PyPath (все эндпоинты из Swagger).
- Совместимость путей:
  - `/<endpoint>` (текущие фронтенд-роуты)
  - `/api/v1/<endpoint>` (версионированный алиас)
- CORS для локальной разработки.
- Единый формат ошибок (Problem Details JSON).
- `X-Request-ID` в каждом ответе + request logging middleware.
- Health checks:
  - `GET /health`
  - `GET /health/live`
  - `GET /health/ready`

## Локальный запуск

### 1) Установить зависимости

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Linux/Mac:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### 2) Конфиг (опционально)

```bash
cp .env.example .env
```

### 3) Запуск API

```bash
uvicorn main:app --reload --port 8000
```

Документация:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Docker

```bash
cd backend
cp .env.example .env
docker compose up --build
```

## Тесты

```bash
cd backend
pytest -q
```

## Примеры запросов

```bash
curl http://localhost:8000/currentUser
curl "http://localhost:8000/leaderboard?scope=friends&period=all"
curl -X POST http://localhost:8000/posts \
  -H "Content-Type: application/json" \
  -d '{"content":"Проверка FastAPI backend через API","tags":["Python","FastAPI"]}'
```
