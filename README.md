# Photon — Multi-Agent Trading System

Multi-agent automated trading system for crypto and stock markets. Three AI agents work together: Market Monitoring → Decision Making → Execution.

## Structure

```
photon/
├── back/    # Django backend
├── front/   # Next.js frontend
├── ml/      # ML models (placeholder)
└── README.md
```

## Architecture

- **Market Monitoring Agent** — collects real-time data from Binance, Bybit, yfinance
- **Decision-Making Agent** — ML (Random Forest, Gradient Boosting), outputs BUY/SELL/HOLD
- **Execution Agent** — demo trades only, no real orders

## Tech Stack

- Backend: Django 5, DRF, Celery, PostgreSQL, Redis
- Frontend: Next.js 16, TypeScript
- Data: Binance, Bybit, yfinance (no API keys for market data)

## Quick Start

### Backend

```bash
cd back/photon-backend
cp backend/env.example backend/.env
docker compose up --build
```

http://localhost:666  
Swagger: http://localhost:666/api/docs/

### Frontend

```bash
cd front/photon_frontend
pnpm install
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:666/api
pnpm dev
```

http://localhost:3000
