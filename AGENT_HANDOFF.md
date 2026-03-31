# PyPath Handoff For New AI Agent

Repository: https://github.com/baltabekpro/PyPath

## What this project is

PyPath is an educational platform for learning Python with gamification, missions, ratings, an embedded code editor, and an AI assistant.

Frontend stack: React 18 + TypeScript + Vite.
Backend stack: FastAPI + SQLAlchemy + Alembic + Pydantic 2.

## Where to work

- Local workspace root: `C:/Users/workb/Downloads/edu/PyPath`
- Backend code: `backend/`
- Frontend code: root TypeScript/React files and `components/`

## SSH access

Target server:

- Host: `94.131.92.125`
- User: `baltabek`

Key files in the repo root:

- Private key: `ssh-key-1772386225948`
- Public key: `ssh-key-1772386225948.pub`

Connect from another machine with OpenSSH:

```bash
ssh -i /path/to/ssh-key-1772386225948 baltabek@94.131.92.125
```

On Windows, use the same `ssh -i` form from PowerShell or Git Bash. Keep the private key secure and do not commit it anywhere else.

## Deployment model

Frontend deployment:

- Deploy to Vercel from the GitHub repository.
- Vercel rewrite rule in `vercel.json` routes `/api-proxy/(.*)` to `http://94.131.92.125:8000/$1`.

Backend deployment:

- Deploy to the server `94.131.92.125`.
- Remote backend path: `/home/baltabek/pypath`
- Backend container is managed with `docker-compose` on that server.

## Deployment steps

1. Pull or upload the exact changed files to the server using full target paths. Do not copy multiple files into one destination directory without explicit target paths, because `scp` can flatten paths by filename.
2. For backend changes, upload them into `/home/baltabek/pypath/backend` or the matching exact server path.
3. On the server, refresh the backend with:

```bash
cd /home/baltabek/pypath/backend
docker-compose down
docker-compose up -d --build
```

4. If Docker reports an old container / compose state issue, always prefer `docker-compose down` followed by `docker-compose up -d --build`.
5. After backend deploy, verify the API health endpoints and the routes used by the frontend proxy.

## Important runtime notes

- The backend needs `GOOGLE_API_KEY` in `backend/.env` for Gemini features.
- The server uses `docker-compose` 1.29.2, not the newer `docker compose` plugin.
- If `/courses/journey` returns `422` with `int_parsing` for `course_id`, redeploy the backend from the current branch before debugging the frontend.

## Quick verification

- Backend docs: `http://94.131.92.125:8000/docs`
- Backend health: `http://94.131.92.125:8000/health`
- Frontend should continue to call the backend through `/api-proxy/*` on Vercel.
