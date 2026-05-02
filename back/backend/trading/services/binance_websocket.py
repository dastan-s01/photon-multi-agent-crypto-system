"""
Binance WebSocket streams (ticker and kline).
"""
import asyncio
import json
import logging
import websockets
from datetime import datetime
from typing import Optional, Dict, List, Callable
from decimal import Decimal
import pandas as pd

logger = logging.getLogger(__name__)


class BinanceWebSocketService:
    """Subscribe to Binance public WS streams."""

    def __init__(self):
        self.base_url = "wss://stream.binance.com:9443"
        self.is_connected = False
        self.websocket = None
        self.callbacks: Dict[str, List[Callable]] = {}

    async def connect_ticker(self, symbol: str, callback: Callable):
        """
        Stream 24h mini-ticker style updates for `symbol` (e.g. btcusdt).
        `callback` receives the decoded JSON dict.
        """
        symbol = symbol.lower()
        url = f"{self.base_url}/ws/{symbol}@ticker"

        try:
            async with websockets.connect(url) as websocket:
                self.is_connected = True
                logger.info(f"Connected to Binance WebSocket ticker stream for {symbol.upper()}")

                async for message in websocket:
                    try:
                        data = json.loads(message)
                        await callback(data)
                    except json.JSONDecodeError as e:
                        logger.error(f"Error decoding JSON: {e}")
                    except Exception as e:
                        logger.error(f"Error processing message: {e}")

        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            self.is_connected = False
            raise

    async def connect_kline(self, symbol: str, interval: str, callback: Callable):
        """
        Stream kline events. `interval` as Binance expects (1m, 1h, 1d, ...).
        `callback` receives the inner `k` object.
        """
        symbol = symbol.lower()
        url = f"{self.base_url}/ws/{symbol}@kline_{interval}"

        try:
            async with websockets.connect(url) as websocket:
                self.is_connected = True
                logger.info(f"Connected to Binance WebSocket kline stream for {symbol.upper()} @ {interval}")

                async for message in websocket:
                    try:
                        data = json.loads(message)
                        if 'k' in data:
                            await callback(data['k'])
                    except json.JSONDecodeError as e:
                        logger.error(f"Error decoding JSON: {e}")
                    except Exception as e:
                        logger.error(f"Error processing message: {e}")

        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
            self.is_connected = False
            raise

    @staticmethod
    def parse_ticker_data(data: Dict) -> Dict:
        """Normalize raw ticker JSON to price, volume, OHLC, change, timestamp."""
        try:
            price = Decimal(str(data.get('c', '0')))
            volume_24h = Decimal(str(data.get('v', '0')))
            high_24h = Decimal(str(data.get('h', '0')))
            low_24h = Decimal(str(data.get('l', '0')))
            open_24h = Decimal(str(data.get('o', '0')))
            change = Decimal(str(data.get('p', '0')))
            change_percent = Decimal(str(data.get('P', '0')))

            event_time = data.get('E', 0)
            timestamp = datetime.fromtimestamp(event_time / 1000) if event_time else datetime.now()

            return {
                "price": price,
                "volume": int(volume_24h),
                "high": high_24h,
                "low": low_24h,
                "open_price": open_24h,
                "change": change,
                "change_percent": change_percent,
                "timestamp": timestamp,
            }
        except Exception as e:
            logger.error(f"Error parsing ticker data: {e}")
            return None

    @staticmethod
    def parse_kline_data(kline_data: Dict) -> Dict:
        """Normalize kline `k` payload to OHLCV + is_closed."""
        try:
            open_time = int(kline_data.get('t', 0))
            timestamp = datetime.fromtimestamp(open_time / 1000) if open_time else datetime.now()

            return {
                "timestamp": timestamp,
                "open": Decimal(str(kline_data.get('o', '0'))),
                "high": Decimal(str(kline_data.get('h', '0'))),
                "low": Decimal(str(kline_data.get('l', '0'))),
                "close": Decimal(str(kline_data.get('c', '0'))),
                "volume": int(Decimal(str(kline_data.get('v', '0')))),
                "is_closed": kline_data.get('x', False),
            }
        except Exception as e:
            logger.error(f"Error parsing kline data: {e}")
            return None


async def collect_historical_data_from_websocket(
    symbol: str,
    interval: str = "1h",
    max_candles: int = 200
) -> List[Dict]:
    """
    Collect up to `max_candles` closed klines from the live stream (slow / best-effort).
    """
    service = BinanceWebSocketService()
    collected_data = []

    async def kline_callback(kline_data: Dict):
        parsed = BinanceWebSocketService.parse_kline_data(kline_data)
        if parsed and parsed.get('is_closed'):
            collected_data.append(parsed)
            logger.info(f"Collected candle {len(collected_data)}/{max_candles}: {parsed['timestamp']} @ ${parsed['close']}")

    try:
        task = asyncio.create_task(service.connect_kline(symbol, interval, kline_callback))

        while len(collected_data) < max_candles:
            await asyncio.sleep(1)
            if len(collected_data) >= max_candles:
                task.cancel()
                break

        return collected_data[:max_candles]

    except asyncio.CancelledError:
        logger.info(f"Collected {len(collected_data)} candles")
        return collected_data
    except Exception as e:
        logger.error(f"Error collecting data: {e}")
        return collected_data


def get_historical_data_sync(symbol: str, interval: str = "1h", max_candles: int = 200) -> List[Dict]:
    """Blocking helper around `collect_historical_data_from_websocket`."""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(
        collect_historical_data_from_websocket(symbol, interval, max_candles)
    )
