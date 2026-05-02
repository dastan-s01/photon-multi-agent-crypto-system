"""
Binance REST API client (klines and 24h ticker).
"""
import logging
import requests
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from decimal import Decimal
import pandas as pd

logger = logging.getLogger(__name__)


class BinanceAPIService:
    """Thin wrapper around Binance `/api/v3` public endpoints."""
    
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"
        
    def get_klines(
        self,
        symbol: str,
        interval: str = "1h",
        limit: int = 500,
        start_time: Optional[int] = None,
        end_time: Optional[int] = None
    ) -> Optional[List[Dict]]:
        """
        Fetch klines. `symbol` like BTCUSDT; `interval` per Binance docs; max `limit` 1000.
        Optional `start_time` / `end_time` in milliseconds.
        """
        symbol = symbol.upper()
        url = f"{self.base_url}/klines"
        
        params = {
            "symbol": symbol,
            "interval": interval,
            "limit": min(limit, 1000)
        }
        
        if start_time:
            params["startTime"] = start_time
        if end_time:
            params["endTime"] = end_time
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if not data:
                logger.warning(f"No data returned for {symbol}")
                return None
            
            result = []
            for kline in data:
                timestamp_ms = kline[0]
                timestamp = datetime.fromtimestamp(timestamp_ms / 1000)
                
                result.append({
                    "timestamp": timestamp,
                    "open": Decimal(str(kline[1])),
                    "high": Decimal(str(kline[2])),
                    "low": Decimal(str(kline[3])),
                    "close": Decimal(str(kline[4])),
                    "volume": int(Decimal(str(kline[5]))),
                    "quote_volume": Decimal(str(kline[7])),
                    "trades": int(kline[8]),
                })
            
            logger.info(f"Retrieved {len(result)} klines for {symbol} @ {interval}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Binance klines: {e}")
            return None
        except Exception as e:
            logger.error(f"Error processing Binance data: {e}")
            return None
    
    def get_historical_data(
        self,
        symbol: str,
        interval: str = "1h",
        days: int = 30
    ) -> Optional[List[Dict]]:
        """Walk backwards with repeated `get_klines` calls until `days` of coverage."""
        end_time = datetime.now()
        start_time = end_time - timedelta(days=days)
        
        max_candles_per_request = 1000
        
        interval_minutes = {
            "1m": 1, "3m": 3, "5m": 5, "15m": 15, "30m": 30,
            "1h": 60, "2h": 120, "4h": 240, "6h": 360, "8h": 480, "12h": 720,
            "1d": 1440, "3d": 4320, "1w": 10080, "1M": 43200
        }
        minutes_per_candle = interval_minutes.get(interval, 60)
        total_candles = (days * 24 * 60) // minutes_per_candle
        
        all_data = []
        current_end = int(end_time.timestamp() * 1000)
        
        while len(all_data) < total_candles:
            limit = min(max_candles_per_request, total_candles - len(all_data))
            
            data = self.get_klines(
                symbol=symbol,
                interval=interval,
                limit=limit,
                end_time=current_end
            )
            
            if not data:
                break
            
            all_data = data + all_data
            
            if len(data) > 0:
                current_end = int((data[0]["timestamp"] - timedelta(seconds=1)).timestamp() * 1000)
            
            if len(data) < limit:
                break
        
        logger.info(f"Total retrieved: {len(all_data)} candles for {symbol} over {days} days")
        return all_data if all_data else None
    
    def get_ticker(self, symbol: str) -> Optional[Dict]:
        """24h ticker stats for `symbol`."""
        symbol = symbol.upper()
        url = f"{self.base_url}/ticker/24hr"
        
        params = {"symbol": symbol}
        
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                "symbol": data.get("symbol"),
                "price": Decimal(str(data.get("lastPrice", "0"))),
                "volume": Decimal(str(data.get("volume", "0"))),
                "high": Decimal(str(data.get("highPrice", "0"))),
                "low": Decimal(str(data.get("lowPrice", "0"))),
                "open": Decimal(str(data.get("openPrice", "0"))),
                "change": Decimal(str(data.get("priceChange", "0"))),
                "change_percent": Decimal(str(data.get("priceChangePercent", "0"))),
                "timestamp": datetime.now(),
            }
        except Exception as e:
            logger.error(f"Error fetching ticker: {e}")
            return None

