# Photon

Trading dashboard (Next.js) and REST API (Django): market data, portfolio, simulated orders, Celery workers. Paper / demo execution only.

## Team

| Student ID | Name           |
|------------|----------------|
| 230103388  | Dastan Sapiyev |
| 230103189  | Ernar Shameke  |

## Layout

```
photon/
├── back/backend/
├── back/docker-compose.yml
├── front/photon_frontend/
├── docker-compose.deploy.yml
├── .env.deploy.example
├── .github/workflows/
├── RUN.md
└── README.md
```

## Stack

Django 5, DRF, PostgreSQL, Redis, Celery, Next.js 16, Docker.

## Local

**API**

```bash
cd back
cp backend/env.example backend/.env
docker compose up --build
```

**UI**

```bash
cd front/photon_frontend
pnpm install
pnpm dev
```

Details: [RUN.md](RUN.md).

## License

See [front/photon_frontend/LICENSE](front/photon_frontend/LICENSE) if present.
