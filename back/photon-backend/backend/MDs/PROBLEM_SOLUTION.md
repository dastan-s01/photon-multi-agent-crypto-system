# Резюме проблем и решений

## 🔴 Проблемы, которые были:

### 1. yfinance блокируется/дает таймауты
**Проблема:**
- yfinance API блокируется на сервере (91.147.104.165)
- Таймауты при запросах
- Невозможно получить данные для акций (AAPL и т.д.)

**Симптомы:**
```
Timeout errors
Connection errors
Rate limiting
```

### 2. Bybit дает только 200 свечек
**Проблема:**
- Bybit API ограничивает исторические данные до 200 свечек
- Недостаточно для обучения модели (требовалось минимум 100 samples)
- Модель не обучалась или работала плохо

**Симптомы:**
- Модель не принимала решения (только HOLD)
- Только 1-2 покупки в backtest
- "Not enough historical data" в логах

### 3. Модель не работает с малым количеством данных
**Проблема:**
- Модель требовала минимум 100 samples для обучения
- С 200 свечками Bybit получалось ~150-180 samples (после обработки)
- Модель использовала синтетические данные вместо реальных

**Симптомы:**
- Модель не обучалась на реальных данных
- Плохие решения (только HOLD или случайные)
- Низкая точность

---

## ✅ Решения:

### 1. Поддержка CSV файлов для backtest
**Что сделано:**
- Система автоматически ищет CSV файлы в `./data/` или `./backend/data/`
- Формат: `{SYMBOL}.csv` или `{SYMBOL}_{INTERVAL}.csv`
- Приоритет: CSV → Кеш → yfinance/Bybit

**Файлы изменены:**
- `backend/trading/agents/market_monitor.py`:
  - Добавлен метод `_load_from_csv_file()`
  - CSV загружается ПЕРЕД запросом к yfinance

### 2. Улучшенная обработка ошибок yfinance
**Что сделано:**
- Увеличены задержки между попытками (10+ секунд вместо 5)
- Автоматический fallback на кеш (даже устаревший)
- Fallback на CSV файлы
- Детальное логирование ошибок

**Файлы изменены:**
- `backend/trading/agents/market_monitor.py`:
  - Улучшена логика retry
  - Добавлены fallback механизмы

### 3. Улучшенное обучение модели
**Что сделано:**
- Минимум samples снижен с 100 до 30
- Адаптивные параметры модели в зависимости от размера данных:
  - < 50 samples: n_estimators=20, max_depth=3
  - < 100 samples: n_estimators=50, max_depth=5
  - >= 100 samples: n_estimators=100, max_depth=10
- Меньший test_size для малых датасетов (0.1 вместо 0.2)

**Файлы изменены:**
- `backend/trading/agents/decision_maker.py`:
  - Изменен `_train_initial_model()`
  - Адаптивные параметры модели

### 4. Команда для скачивания данных
**Что сделано:**
- Новая команда `download_historical_data` для скачивания данных в CSV
- Работает даже если yfinance блокируется (использует кеш)

**Новый файл:**
- `backend/trading/management/commands/download_historical_data.py`

---

## 🧪 Как проверить, что проблемы решены:

### Тест 1: Проверка загрузки из CSV

```bash
# 1. Создайте тестовый CSV файл
mkdir -p ./data
cat > ./data/AAPL_1h.csv << 'EOF'
,Open,High,Low,Close,Volume
2024-11-01 00:00:00,150.0,151.0,149.0,150.5,1000000
2024-11-01 01:00:00,150.5,152.0,150.0,151.5,1200000
2024-11-01 02:00:00,151.5,153.0,151.0,152.0,1100000
EOF

# 2. Запустите backtest (должен использовать CSV)
docker compose exec backend python manage.py backtest_simulation \
  --email madibaizhuman@gmail.com \
  --symbol AAPL \
  --start-date 2024-11-01 \
  --end-date 2024-11-02 \
  --interval 1h \
  --speed 0.1

# Ожидаемый результат:
# ✓ "Loaded data from CSV file for AAPL" в логах
# ✓ Backtest работает без ошибок
```

### Тест 2: Проверка скачивания данных

```bash
# Скачайте данные (даже если yfinance блокируется, использует кеш)
docker compose exec backend python manage.py download_historical_data \
  --symbol AAPL \
  --period 1mo \
  --interval 1h \
  --output-dir ./data

# Ожидаемый результат:
# ✓ Файл создан: ./data/AAPL_1h.csv
# ✓ Данные загружены (даже если yfinance блокируется)
```

### Тест 3: Проверка работы модели с малым количеством данных

```bash
# Используйте Bybit (200 свечек) или короткий период
docker compose exec backend python manage.py backtest_simulation \
  --email madibaizhuman@gmail.com \
  --symbol BTCUSDT \
  --start-date 2024-11-01 \
  --end-date 2024-12-01 \
  --interval 1h \
  --speed 0.1

# Ожидаемый результат в логах:
# ✓ "Using {N} historical samples for training" (где N >= 30)
# ✓ "Small dataset ({N} samples), using reduced model complexity" (если N < 100)
# ✓ Модель обучается и принимает решения (не только HOLD)
# ✓ Больше чем 1-2 покупки в backtest
```

### Тест 4: Проверка fallback механизмов

```bash
# 1. Убедитесь, что yfinance блокируется (или просто не работает)
# 2. Запустите backtest БЕЗ CSV файла
docker compose exec backend python manage.py backtest_simulation \
  --email madibaizhuman@gmail.com \
  --symbol AAPL \
  --start-date 2024-11-01 \
  --end-date 2024-12-01 \
  --interval 1h

# Ожидаемый результат:
# ✓ Система пробует yfinance (может упасть)
# ✓ Автоматически использует кеш (если есть)
# ✓ Или выдает понятную ошибку с инструкцией
```

### Тест 5: Полный цикл (рекомендуется)

```bash
# 1. Скачайте данные заранее
docker compose exec backend python manage.py download_historical_data \
  --symbol AAPL \
  --period 1y \
  --interval 1h \
  --output-dir ./data

# 2. Проверьте, что файл создан
ls -lh ./data/AAPL_1h.csv

# 3. Запустите backtest
docker compose exec backend python manage.py backtest_simulation \
  --email madibaizhuman@gmail.com \
  --symbol AAPL \
  --start-date 2024-11-01 \
  --end-date 2024-12-01 \
  --interval 1h \
  --speed 0.1 \
  --initial-balance 10000.00

# Ожидаемый результат:
# ✓ "Loaded data from CSV file for AAPL" в логах
# ✓ Модель обучается на реальных данных
# ✓ Принимает решения (BUY/SELL/HOLD)
# ✓ Выполняет сделки (больше чем 1-2)
# ✓ Показывает статистику в конце
```

---

## 📊 Ожидаемые результаты после исправлений:

### До исправлений:
- ❌ yfinance блокируется → ошибка
- ❌ 200 свечек Bybit → модель не обучается
- ❌ Только 1-2 покупки в backtest
- ❌ Модель использует синтетические данные

### После исправлений:
- ✅ CSV файлы работают → backtest работает
- ✅ 200 свечек → модель обучается (минимум 30 samples)
- ✅ Больше покупок/продаж в backtest
- ✅ Модель использует реальные данные

---

## 🔍 Как проверить в логах:

### Успешная загрузка из CSV:
```
[INFO] Loaded data from CSV file for AAPL
[INFO] Successfully loaded {N} records from CSV file
```

### Успешное обучение модели:
```
[INFO] Training initial AI model...
[INFO] Attempting to train on real historical data...
[INFO] Using {N} historical samples for training
[INFO] Small dataset ({N} samples), using reduced model complexity  # если N < 100
[INFO] Model trained. Train accuracy: {X}, Test accuracy: {Y}
```

### Модель принимает решения:
```
[INFO] Received market data for AAPL
[INFO] Decision: BUY (confidence: 0.65)
[INFO] Decision: SELL (confidence: 0.72)
```

### Проблемы (если есть):
```
[WARNING] yfinance appears to be blocked/timing out
[WARNING] Using stale data from cache for AAPL (yfinance failed)
[WARNING] Not enough historical data ({N} samples, need 30)
```

---

## 🚀 Быстрая проверка на сервере:

```bash
# На сервере 91.147.104.165

# 1. Скачайте данные (использует кеш если yfinance не работает)
docker compose exec backend python manage.py download_historical_data \
  --symbol AAPL \
  --period 1mo \
  --interval 1h

# 2. Проверьте файл
ls -lh ./data/AAPL_1h.csv

# 3. Запустите короткий backtest
docker compose exec backend python manage.py backtest_simulation \
  --email madibaizhuman@gmail.com \
  --symbol AAPL \
  --start-date 2024-11-01 \
  --end-date 2024-11-05 \
  --interval 1h \
  --speed 0.1

# 4. Проверьте логи
docker compose logs backend | grep -i "csv\|training\|decision"
```

---

## ❓ Если что-то не работает:

1. **CSV не загружается:**
   - Проверьте путь: `./data/` или `./backend/data/`
   - Проверьте формат: колонки Open, High, Low, Close, Volume
   - Проверьте имя файла: `{SYMBOL}.csv` или `{SYMBOL}_{INTERVAL}.csv`

2. **Модель не обучается:**
   - Проверьте логи: должно быть "Using {N} historical samples"
   - Если N < 30, данных недостаточно
   - Попробуйте скачать больше данных

3. **Все еще только HOLD:**
   - Проверьте `min_confidence` в backtest (должно быть 0.15)
   - Проверьте логи модели: accuracy должна быть > 0.5
   - Увеличьте период данных для обучения

4. **yfinance все еще блокируется:**
   - Используйте CSV файлы (скачайте заранее)
   - Или используйте кеш (если есть старые данные)

