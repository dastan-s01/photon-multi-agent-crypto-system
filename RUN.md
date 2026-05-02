# Photon — runbook

## Backend (local)

```bash
cd back
cp backend/env.example backend/.env
docker compose up --build
```

API `http://localhost:666` · Swagger `/api/docs/` · Health `/api/health/`

## Frontend (local)

```bash
cd front/photon_frontend
pnpm install
pnpm dev
```

`http://localhost:3000` — set `NEXT_PUBLIC_API_URL` in `.env.local` if the API is not on localhost.

Docker frontend: `docker compose -f docker-compose.prod.yml up --build` → `http://localhost:3002`

## Full stack (repo root)

```bash
cp .env.deploy.example .env.deploy
docker compose -f docker-compose.deploy.yml --env-file .env.deploy up --build
```

## Stop

```bash
cd back && docker compose down
cd front/photon_frontend && docker compose -f docker-compose.prod.yml down
```

Root compose: `docker compose -f docker-compose.deploy.yml down`

## Ports (deploy compose)

| Service | Port |
|---------|------|
| API     | 666  |
| Next.js | 3002 |
| Redis (host) | 6380 |
| Postgres (host) | 15432 |

## Notes

- `NEXT_PUBLIC_API_URL` must match the URL the browser uses for the API.
- Deploy compose sets `API_URL_SERVER=http://backend:8000/api` for SSR inside Docker.
