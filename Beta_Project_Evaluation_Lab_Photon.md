Beta Project Evaluation Lab – Information Systems  
Project: Photon  
Student: Dastan [Your Surname]

## Phase 1: System Audit

### System Description
Our project is called Photon.  
Photon is a multi-agent trading platform for crypto and stock markets. It helps users monitor market data, get AI-assisted BUY/SELL/HOLD decisions, and execute demo trades in a controlled environment.

The system has three main agents:
- Market Monitoring Agent (collects live market data)
- Decision-Making Agent (analyzes data and gives a trading decision)
- Execution Agent (simulates order execution)

Photon is designed for learning, strategy testing, and portfolio analysis without placing real exchange orders.

### User and Problem
Target Audience:
- Beginner and intermediate traders
- Students learning algorithmic trading
- Users who want to test AI-based decision support

Problem Solved:
- Traders often react emotionally and miss structured decision flow.
- Beginners struggle to combine market data, risk settings, and trade execution.
- Manual tracking of positions, PnL, and strategy performance is inconsistent.

Photon solves this by providing a single pipeline: data -> decision -> execution -> analytics.

### Core Workflow
1. User registers and logs in.
2. User adds a symbol (example: BTCUSDT).
3. Market agent pulls and updates market data.
4. Decision agent generates BUY/SELL/HOLD with confidence.
5. Execution agent performs a simulated trade (no real order).
6. Portfolio, positions, and trade history are updated.
7. User reviews analytics (PnL curve, equity curve, win rate, drawdown).
8. User adjusts settings (risk level, model type, threshold) and repeats.

### Technical Audit
Frontend:
- Next.js 16 + TypeScript
- Dashboard pages for portfolio, analytics, agents, and settings
- Authenticated UI with chart components and status widgets

Backend:
- Django 5 + Django REST Framework
- Celery tasks for monitoring flows
- JWT authentication endpoints
- Agent endpoints for monitor/decision/execution

Database:
- PostgreSQL for users, symbols, market data, decisions, positions, trades, settings
- Redis for queue/cache support with Celery

Deployment:
- Docker Compose environment
- Backend API + Swagger docs
- Frontend served separately

API Endpoints (key examples):
- Auth: `/api/auth/register/`, `/api/auth/login/`, `/api/auth/me/`
- Trading core: `/api/trading/agents/market-monitor/`, `/api/trading/agents/decision-maker/`, `/api/trading/agents/execution/`
- Demo orders: `/api/trading/demo/orders/`
- Portfolio: `/api/trading/portfolio/`, `/api/trading/positions/`, `/api/trading/trades/`
- Analytics: `/api/trading/analytics/performance-metrics/`, `/api/trading/analytics/pnl-curve/`

## Phase 2: Failure Testing

| Test Scenario | What Failed | Why (Assumption) | Severity |
|---|---|---|---|
| Multiple tabs | Portfolio and positions can show stale/inconsistent values after parallel actions | No cross-tab state sync; race between refresh calls and local UI state | Medium |
| Invalid inputs | Some request fields still rely on backend-only checks, late error feedback in UI | Incomplete client-side pre-validation; server validation exists but UX is delayed | High |
| Rapid refresh | Repeated refresh can trigger duplicate load and inconsistent agent status display | API calls fire repeatedly with no debounce/throttle strategy | Medium |
| Large inputs | Oversized text/invalid payloads in optional fields may pass too far before rejection | Limits are not consistently enforced across all serializers/forms | Low |
| Network interruption | Agent or trade action may appear "stuck" from user perspective | Retry and error recovery are partial; limited offline/network-failure handling in frontend | High |

## Phase 3: Fix & Improve

### Fix 1: Input Validation Hardening
Before:
- Some forms let users submit invalid or incomplete values and only showed backend errors after request.

After:
- Added strict frontend checks for required fields and numeric constraints before API call.
- Kept backend validation as final protection.
- Returned clearer field-specific error messages.

Result:
- Fewer invalid requests, better user guidance, cleaner request logs.

### Fix 2: Better Failure Feedback and Recovery
Before:
- On unstable network, users could not always tell whether trade/agent action failed or was delayed.

After:
- Added explicit error states, timeout handling, and retry options for critical actions.
- Standardized response handling for failed API calls.

Result:
- Users can distinguish "in progress", "failed", and "completed" states quickly.

### UX Improvement: Clearer Trading Action Flow
Before:
- Users saw data updates but not always a clear action lifecycle.

After:
- Improved action feedback sequence: request sent -> processing -> result.
- Added visible status cues around trade execution and agent actions.

Result:
- Better trust in system behavior and fewer repeated clicks.

| Feature | Before | After |
|---|---|---|
| Input Validation | Partial/late feedback | Early + strict checks |
| Error Handling | Generic and inconsistent | Clear and actionable |
| Action Feedback | Ambiguous status | Explicit step-by-step state |
| Reliability | Moderate | Improved under unstable network |

## Phase 4: System Thinking

1) What breaks when scaling?  
The main risk is high-frequency market data ingestion and repeated decision requests across many users/symbols. This can overload workers, database writes, and API response time.

2) Biggest bottleneck?  
Market data + agent pipeline orchestration is the bottleneck, especially when many users request analysis simultaneously. Worker capacity and external data source latency become limiting factors.

3) Weakest design part?  
State consistency between async backend updates and real-time frontend display is currently the weakest point. Users can see temporary mismatches if refresh timing is unlucky.

4) What would you rebuild?  
I would rebuild event flow around a stronger event-driven architecture:
- dedicated queue strategy per workload type,
- websocket/live update channel for state sync,
- stricter idempotency keys for trading actions,
- centralized observability (structured logs, metrics, tracing).

## Phase 5: Peer Review (Condensed)

3 issues identified:
1. Cross-tab synchronization is not robust enough for active usage.  
2. Error handling is improved but still not fully resilient for long network instability.  
3. Current architecture is suitable for beta volume, but not yet for large concurrent workloads.

Suggested improvement:
Implement real-time push updates (WebSocket/SSE) for agent status, portfolio state, and execution results to remove stale polling behavior.

## Conclusion

Photon solves a practical problem: structured, AI-assisted demo trading with integrated analytics and risk controls. The beta version already demonstrates a useful end-to-end workflow.  
The priority for the next iteration should be scalability and consistency under concurrent load, with stronger real-time synchronization and fault-tolerant execution flow.
