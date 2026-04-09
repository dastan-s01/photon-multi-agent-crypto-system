# Photon — запуск и проверка

Краткий гайд по запуску в Docker и проверке, что всё работает.

---

## 1. Backend (Docker)

```bash
cd back
cp backend/env.example backend/.env
# При необходимости отредактировать backend/.env (секреты, CORS и т.д.)
docker compose up --build
```

**Сервисы:**
- API: http://localhost:666
- Swagger: http://localhost:666/api/docs/
- PostgreSQL: localhost:5432
- Redis: localhost:6377

**Проверить:**
- `curl http://localhost:666/api/` — ответ API
- Открыть Swagger → пройтись по эндпоинтам (auth может потребовать токен)

---

## 2. Frontend

### Вариант A: без Docker (dev)

```bash
cd front/photon_frontend
pnpm install
# Создать .env.local: NEXT_PUBLIC_API_URL=http://localhost:666/api
pnpm dev
```

Приложение: http://localhost:3000

### Вариант B: в Docker (prod-like)

```bash
cd front/photon_frontend
# .env.local: NEXT_PUBLIC_API_URL=http://localhost:666/api
docker compose -f docker-compose.prod.yml up --build
```

Приложение: http://localhost:3002

**Важно:** Backend должен быть уже запущен (localhost:666). В Docker фронт ходит на бэк через `host.docker.internal:666`.

---

## 3. Порядок запуска

1. Поднять backend: `cd back && docker compose up -d`
2. Дождаться миграций и запуска (≈30 сек)
3. Поднять frontend: dev (`pnpm dev`) или Docker (`docker compose -f docker-compose.prod.yml up`)

---

## 4. Что проверить

| Действие | Где | Результат |
|----------|-----|-----------|
| Swagger открывается | http://localhost:666/api/docs/ | Список эндпоинтов |
| Логин / регистрация | Frontend | Получение JWT, редирект в приложение |
| Dashboard | Frontend | Данные портфеля, метрики |
| Market data | Frontend | Котировки, графики |
| Agents | Frontend | Статусы агентов, решения |
| Meta-model backtest | Swagger `POST /api/meta-model/backtest/` | JSON с результатами бэктеста |

---

## 5. Частые проблемы

- **CORS** — добавить `http://localhost:3000` (и 3002) в `CORS_ALLOWED_ORIGINS` или оставить `CORS_ALLOW_ALL=true`
- **Frontend не видит API** — в `.env.local` указать `NEXT_PUBLIC_API_URL=http://localhost:666/api`
- **Frontend в Docker не видит backend** — на Mac/Windows `host.docker.internal` обычно работает; на Linux может потребоваться `network_mode: host` или другой хост
- **yfinance блокирует** — задержки в запросах, можно попробовать VPN или другой источник (Bybit/Binance)

---

## 6. Остановка

```bash
# Backend
cd back
docker compose down

# Frontend (если в Docker)
cd front/photon_frontend
docker compose -f docker-compose.prod.yml down
```
