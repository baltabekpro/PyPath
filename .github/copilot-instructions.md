# PyPath Project Guidelines

PyPath is an educational platform for learning Python with gamification, missions, ratings, a built-in code editor, and an AI assistant.

## Architecture

- **Frontend:** React 18, TypeScript, Vite. Functional components with hooks mapping UI. State is managed at the root component (`App.tsx`) with props drilling or local state—no heavy state libraries like Redux.
- **Backend:** FastAPI with modular architecture. Uses a dedicated Service Layer (`DatabaseService`, `AIService`) decoupled from route handlers. 
- **Deployment:** Frontend on Vercel with `/api-proxy/*` rewrite rules to a Dockerized remote backend.

## Code Style & Conventions

- **Frontend Styling:** Use Tailwind CSS exclusively. Always support light/dark mode using `dark:` variants appropriately (avoid hardcoded `text-white` on light background).
- **Icons & Lazy Loading:** Use `lucide-react` for icons and `React.lazy` with `Suspense` for heavy components (e.g., `AdminPanel`).
- **Backend Type Hinting:** Use concise modern type hints (`str | None`, `list[str]`).
- **Backend Schemas:** Use Pydantic V2 (`BaseModel`, explicit `Field()` with constraints, `@field_validator`).
- **Dependencies (Backend):** Use `Depends()` extensively for DB sessions and services (e.g., `Depends(get_db)`, `Depends(get_db_service)`).
- **Error Handling (Backend):** Always use Problem Details JSON format for errors and ensure `X-Request-ID` is in every response.

## Build and Test

These commands are used for building, running, and testing. Agents should use them to verify code:

- **Frontend Dev:**
  ```bash
  npm install
  npm run dev
  ```
- **Backend Dev:**
  ```bash
  cd backend
  python -m venv .venv
  source .venv/Scripts/activate  # or .venv/bin/activate on Linux/Mac
  pip install -r requirements.txt
  uvicorn main:app --reload --port 8000
  ```
- **Backend Tests:**
  ```bash
  cd backend
  pytest -q
  ```
- **Docker Build:**
  ```bash
  cd backend
  docker compose up --build
  ```

## Infrastructure Rules

- Ensure Vercel rewrite proxy `/api-proxy/(.*)` -> `http://<API_IP>:8000/$1` rules reflect local development paths natively.
- Use explicit Vercel and Docker commands. Do not use generalized local tools like Apache or SCP to deploy this environment.
- Backend requires `GOOGLE_API_KEY` in `backend/.env` for Gemini integrations.
