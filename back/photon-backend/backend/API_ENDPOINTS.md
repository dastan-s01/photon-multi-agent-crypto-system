# API Эндпоинты для Мета-Модели

## 📋 Обзор

Система предоставляет эндпоинты для работы с мета-моделью торговли, которая использует динамический выбор моделей на основе режима рынка и фильтр активов.

---

## 🔐 Аутентификация

Все эндпоинты требуют аутентификации через JWT токен:
```
Authorization: Bearer <your_token>
```

---

## 📍 Базовый URL

```
http://localhost:8000/api/trading/
```

---

## 🎯 Эндпоинты

### 1. **Мета-Модель: Полный Pipeline**

**POST** `/api/trading/meta-model/trade/`

Запускает полный pipeline из 3 агентов:
1. Market Monitoring Agent - сбор и анализ данных рынка
2. Decision Making Agent - принятие решения через мета-модель
3. Execution Agent - выполнение сделки (опционально)

**Request Body:**
```json
{
    "symbol": "BTCUSDT",  // Обязательно: код криптовалюты
    "execute": false      // Опционально: выполнять ли сделку (по умолчанию false)
}
```

**Response (200 OK):**
```json
{
    "success": true,
    "symbol": "BTCUSDT",
    "decision": {
        "action": "BUY",           // BUY, SELL, или HOLD
        "confidence": 0.75,         // Уверенность модели (0-1)
        "regime": "trend",          // Режим рынка: trend, flat, volatile
        "price": 91523.76,          // Текущая цена
        "decision_id": 123          // ID решения в БД
    },
    "market_data": {
        "timestamp": "2025-12-12T10:00:00Z",
        "close": 91523.76,
        "volume": 18278.16
    },
    "execution": {                  // Только если execute=true и action != HOLD
        "status": "executed",
        "action": "BUY",
        "quantity": 0.098,
        "price": 91523.76,
        "trade_id": 456,
        "position_id": 789
    }
}
```

**Ошибки:**
- `400 Bad Request`: Символ не указан или актив не одобрен
- `404 Not Found`: Данные для символа не найдены
- `500 Internal Server Error`: Ошибка сервера

**Пример использования:**
```bash
curl -X POST http://localhost:8000/api/trading/meta-model/trade/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTCUSDT", "execute": false}'
```

---

### 2. **Данные для Графика Торговли**

**GET** `/api/trading/meta-model/chart-data/`

Возвращает данные для построения графика с отображением свечей, покупок и продаж.

**Query Parameters:**
- `symbol` (обязательно): код криптовалюты (например, "BTCUSDT")
- `days` (опционально): количество дней истории (по умолчанию 30)

**Response (200 OK):**
```json
{
    "symbol": "BTCUSDT",
    "candles": [
        {
            "timestamp": "2025-12-12T10:00:00Z",
            "open": 91000.0,
            "high": 92000.0,
            "low": 90500.0,
            "close": 91523.76,
            "volume": 18278.16
        },
        // ... больше свечей
    ],
    "trades": [
        {
            "timestamp": "2025-12-12T10:15:00Z",
            "side": "BUY",
            "price": 91523.76,
            "quantity": 0.098,
            "trade_id": 456,
            "decision_id": 123,
            "confidence": 75.5
        },
        // ... больше сделок
    ],
    "decisions": [
        {
            "timestamp": "2025-12-12T10:00:00Z",
            "action": "BUY",
            "confidence": 75.5,
            "decision_id": 123,
            "regime": "trend"
        },
        // ... больше решений (включая HOLD)
    ],
    "summary": {
        "total_trades": 10,
        "buy_trades": 5,
        "sell_trades": 5,
        "total_decisions": 50
    }
}
```

**Пример использования:**
```bash
curl -X GET "http://localhost:8000/api/trading/meta-model/chart-data/?symbol=BTCUSDT&days=30" \
  -H "Authorization: Bearer <token>"
```

---

### 3. **Список Одобренных Активов**

**GET** `/api/trading/meta-model/approved-assets/`

Возвращает список активов, одобренных для торговли с мета-моделью, и заблокированных активов.

**Response (200 OK):**
```json
{
    "approved": [
        {
            "symbol": "LINKUSDT",
            "category": "top_performer",
            "historical_score": 21.58,
            "win_rate": 37.5,
            "trades": 16,
            "config": {
                "enabled": true,
                "max_position_size": 0.9,
                "min_confidence": 0.5,
                "use_meta_model": true,
                "risk_level": "medium"
            }
        },
        {
            "symbol": "BTCUSDT",
            "category": "stable",
            "historical_score": 6.98,
            "win_rate": 40.0,
            "trades": 10,
            "config": {
                "enabled": true,
                "max_position_size": 0.8,
                "min_confidence": 0.55,
                "use_meta_model": true,
                "risk_level": "low"
            }
        }
        // ... больше одобренных активов
    ],
    "blacklisted": [
        {
            "symbol": "XRPUSDT",
            "reason": "Very low win rate (5.56%)",
            "score": -13.96
        },
        {
            "symbol": "DOGEUSDT",
            "reason": "Low win rate (20.00%)",
            "score": -9.71
        }
        // ... больше заблокированных активов
    ],
    "total_approved": 6,
    "total_blacklisted": 4
}
```

**Пример использования:**
```bash
curl -X GET http://localhost:8000/api/trading/meta-model/approved-assets/ \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Интеграция с Существующими Эндпоинтами

### Существующие эндпоинты для отдельных агентов:

1. **Market Monitor Agent**
   - `POST /api/trading/agents/market-monitor/`
   - Запускает только Market Monitoring Agent

2. **Decision Maker Agent**
   - `POST /api/trading/agents/decision-maker/`
   - Запускает только Decision Making Agent

3. **Execution Agent**
   - `POST /api/trading/agents/execution/`
   - Запускает только Execution Agent

### Новый эндпоинт мета-модели объединяет все три агента в один pipeline.

---

## 📊 Структура Данных

### Режимы Рынка (Regime)

- `trend` - Тренд (GradientBoosting получает 70% веса)
- `flat` - Флэт (RandomForest получает 70% веса)
- `volatile` - Волатильность (RandomForest получает 70% веса)

### Действия (Action)

- `BUY` - Покупка
- `SELL` - Продажа
- `HOLD` - Удержание позиции

---

## 🎨 Пример Использования на Фронтенде

### 1. Получить список одобренных активов

```javascript
const response = await fetch('/api/trading/meta-model/approved-assets/', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
const { approved, blacklisted } = await response.json();
```

### 2. Запустить торговлю с мета-моделью

```javascript
const response = await fetch('/api/trading/meta-model/trade/', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        symbol: 'BTCUSDT',
        execute: false  // Сначала только предсказание
    })
});
const result = await response.json();
console.log(`Decision: ${result.decision.action}, Confidence: ${result.decision.confidence}`);
```

### 3. Получить данные для графика

```javascript
const response = await fetch(`/api/trading/meta-model/chart-data/?symbol=BTCUSDT&days=30`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
});
const chartData = await response.json();

// Использовать chartData.candles для свечей
// chartData.trades для маркеров покупок/продаж
// chartData.decisions для всех решений (включая HOLD)
```

---

## ⚠️ Важные Замечания

1. **Фильтр Активов**: Система автоматически проверяет, одобрен ли актив для торговли. Если актив не одобрен, запрос будет отклонен с кодом 400.

2. **Режим Рынка**: Мета-модель автоматически определяет режим рынка и выбирает оптимальную модель для этого режима.

3. **Выполнение Сделок**: По умолчанию `execute=false`, что означает только предсказание без выполнения сделки. Установите `execute=true` для реального выполнения.

4. **Обучение Модели**: Модель обучается автоматически на исторических данных при каждом запросе.

---

## 🔗 Связанные Документы

- `DYNAMIC_MODEL_SELECTION.md` - Описание динамического выбора модели
- `META_MODEL_ARCHITECTURE.md` - Архитектура мета-модели
- `EXPLANATION_LABELS.md` - Объяснение генерации меток

