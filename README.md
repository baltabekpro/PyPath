# PyPath

PyPath - образовательная платформа для изучения Python с геймификацией, миссиями, рейтингами, встроенным редактором кода и AI-ассистентом.

## Языки программирования

- TypeScript / JavaScript (frontend)
- Python (backend)
- SQL (через SQLAlchemy/Alembic)
- HTML / CSS
- Bash (деплой и инфраструктурные команды)

## Технологический стек

### Frontend

- React 18
- TypeScript 5
- Vite 5
- Monaco Editor (`@monaco-editor/react`)
- xterm.js (`xterm`, `xterm-addon-fit`)
- Recharts (графики)
- Lucide React (иконки)

### Backend

- FastAPI
- Uvicorn
- Pydantic 2 + pydantic-settings
- SQLAlchemy 2
- Alembic
- Python-JOSE (JWT)
- Passlib + bcrypt (хеширование паролей)
- Google Generative AI (Gemini)
- Pytest

### Инфраструктура и деплой

- Docker + Docker Compose
- Vercel (frontend)
- Rewrite-прокси с Vercel на backend (`/api-proxy/*`)

## Архитектура проекта

```text
PyPath/
   components/          # React-компоненты UI
   api.ts               # Клиент API для frontend
   backend/
      app/
         api/             # FastAPI роуты
         core/            # Конфиг, middleware, auth, db
         models/          # ORM модели
         schemas/         # Pydantic схемы
         services/        # Бизнес-логика и AI-сервис
      tests/             # Тесты backend
      Dockerfile
      docker-compose.yml
   vercel.json          # Конфиг деплоя frontend
```

## Как работает связка frontend/backend

- Локально frontend может ходить в backend напрямую (например, `http://localhost:8000`).
- На Vercel frontend использует префикс `/api-proxy`.
- В `vercel.json` настроен rewrite:
   - `/api-proxy/(.*)` -> `http://94.131.92.125:8000/$1`

## Быстрый старт

### 1. Frontend

```bash
npm install
npm run dev
```

### 2. Backend (локально)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Backend (Docker)

```bash
cd backend
docker compose up --build
```

## Ключевые возможности

- Курсы, миссии и прогресс обучения
- Авторизация пользователей (JWT)
- Лидерборд, комьюнити, достижения
- AI-чат помощник (Gemini)
- Health endpoints (`/health`, `/health/live`, `/health/ready`)

## Документация API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Примечания по AI

Для работы AI в backend должен быть задан `GOOGLE_API_KEY` в `backend/.env`.
