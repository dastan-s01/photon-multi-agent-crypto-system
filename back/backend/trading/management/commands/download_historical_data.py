"""
Command to download historical data into CSV files for backtest.

Usage:
    python manage.py download_historical_data --symbol AAPL --period 1y --interval 1h
    python manage.py download_historical_data --symbol BTCUSDT --period 1mo --interval 1h
"""
import os
import pandas as pd
from django.core.management.base import BaseCommand
from trading.agents.market_monitor import MarketMonitoringAgent


class Command(BaseCommand):
help = "Downloads historical data to a CSV file for backtest"

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbol",
            type=str,
            required=True,
help="Download symbol (eg AAPL, BTCUSDT)",
        )
        parser.add_argument(
            "--period",
            type=str,
            default="1y",
help="Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, max)",
        )
        parser.add_argument(
            "--interval",
            type=str,
            default="1h",
help="Data interval (1m, 5m, 15m, 30m, 1h, 4h, 1d)",
        )
        parser.add_argument(
            "--output-dir",
            type=str,
            default="./data",
help="Directory for saving CSV files (default: ./data)",
        )

    def handle(self, *args, **options):
        symbol = options["symbol"].upper()
        period = options["period"]
        interval = options["interval"]
        output_dir = options["output_dir"]

        self.stdout.write(self.style.SUCCESS("=" * 70))
self.stdout.write(self.style.SUCCESS("DOWNLOADING HISTORICAL DATA"))
        self.stdout.write(self.style.SUCCESS("=" * 70))
self.stdout.write(f"Symbol: {symbol}")
self.stdout.write(f"Period: {period}")
self.stdout.write(f"Interval: {interval}")
self.stdout.write(f"Output directory: {output_dir}\n")

        os.makedirs(output_dir, exist_ok=True)

        try:
self.stdout.write("[1/3] Agent initialization...")
            market_agent = MarketMonitoringAgent(
                ticker=symbol,
                interval=interval,
                period=period,
                enable_cache=True,
                request_delay=5.0,
                max_retries=5,
                backoff_factor=3.0,
            )
self.stdout.write(self.style.SUCCESS("✓ Agent initialized"))

self.stdout.write("\n[2/3] Loading data...")
self.stdout.write("This may take a while, especially if yfinance is blocked...")
            
            try:
                data, analysis = market_agent.get_processed_data(analyze=True)
            except Exception as e:
self.stdout.write(self.style.WARNING(f"Error while receiving data: {e}"))
self.stdout.write("We are trying to get data without analysis...")
                data = market_agent.get_processed_data(analyze=False)
                analysis = None

            if data is None or data.empty:
self.stdout.write(self.style.ERROR("Failed to load data"))
                return

self.stdout.write(self.style.SUCCESS(f"✓ {len(data)} records loaded"))
            if len(data) > 0:
self.stdout.write(f" First date: {data.index[0]}")
self.stdout.write(f" Last date: {data.index[-1]}")

self.stdout.write("\n[3/3] Saving to CSV...")
            filename = f"{symbol}_{interval}.csv"
            filepath = os.path.join(output_dir, filename)

            if isinstance(data.index, pd.DatetimeIndex):
                data_to_save = data.copy()
            elif 'timestamp' in data.columns:
                data_to_save = data.copy()
                if not isinstance(data_to_save.index, pd.DatetimeIndex):
                    data_to_save['timestamp'] = pd.to_datetime(data_to_save['timestamp'], errors='coerce')
                    data_to_save = data_to_save.set_index('timestamp')
            else:
                data_to_save = data.reset_index()
                if 'timestamp' not in data_to_save.columns:
                    if isinstance(data.index, pd.DatetimeIndex):
                        data_to_save['timestamp'] = data.index
                    else:
                        data_to_save['timestamp'] = pd.to_datetime(data_to_save.index, errors='coerce')
                else:
                    data_to_save['timestamp'] = pd.to_datetime(data_to_save['timestamp'], errors='coerce')
                data_to_save = data_to_save.set_index('timestamp')
            
            if not isinstance(data_to_save.index, pd.DatetimeIndex):
                data_to_save.index = pd.to_datetime(data_to_save.index, errors='coerce')
            
            data_to_save = data_to_save[data_to_save.index.notna()]
            
            data_to_save.to_csv(filepath, index=True, date_format='%Y-%m-%d %H:%M:%S')
self.stdout.write(self.style.SUCCESS(f"✓ Data saved in: {filepath}"))

            self.stdout.write("\n" + "=" * 70)
self.stdout.write(self.style.SUCCESS("STATISTICS"))
            self.stdout.write("=" * 70)
self.stdout.write(f"Total records: {len(data)}")
self.stdout.write(f"Columns: {', '.join(data.columns)}")
            
            if analysis:
self.stdout.write(f"\nMarket analysis:")
self.stdout.write(f" Trend: {analysis.get('trend', 'unknown')}")
self.stdout.write(f" Strength: {analysis.get('strength', 0.0):.2f}")
            
self.stdout.write(f"\nThe file is ready for use in backtest:")
            self.stdout.write(self.style.SUCCESS(f"  {filepath}"))
self.stdout.write("\nUsage:")
            self.stdout.write(f"  docker compose exec backend python manage.py backtest_simulation \\")
            self.stdout.write(f"    --email your@email.com \\")
            self.stdout.write(f"    --symbol {symbol} \\")
            self.stdout.write(f"    --start-date 2024-11-01 \\")
            self.stdout.write(f"    --end-date 2024-12-01 \\")
            self.stdout.write(f"    --interval {interval}")
            self.stdout.write("=" * 70)

        except Exception as e:
self.stdout.write(self.style.ERROR(f"Error: {e}"))
            import traceback
            self.stdout.write(traceback.format_exc())

