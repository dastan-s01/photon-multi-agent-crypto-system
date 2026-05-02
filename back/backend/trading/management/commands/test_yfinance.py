"""
Management command: verify yfinance can reach Yahoo Finance.
"""
import sys
import requests
from django.core.management.base import BaseCommand

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False

_DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

def _setup_yfinance_headers():
    """Patch requests so yfinance uses browser-like headers."""
    original_get = requests.get
    original_post = requests.post
    
    def patched_get(url, **kwargs):
        if "headers" not in kwargs:
            kwargs["headers"] = {}
        kwargs["headers"].setdefault("User-Agent", _DEFAULT_USER_AGENT)
        kwargs["headers"].setdefault("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        kwargs["headers"].setdefault("Accept-Language", "en-US,en;q=0.5")
        return original_get(url, **kwargs)
    
    def patched_post(url, **kwargs):
        if "headers" not in kwargs:
            kwargs["headers"] = {}
        kwargs["headers"].setdefault("User-Agent", _DEFAULT_USER_AGENT)
        kwargs["headers"].setdefault("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        kwargs["headers"].setdefault("Accept-Language", "en-US,en;q=0.5")
        return original_post(url, **kwargs)
    
    if not hasattr(requests, '_yfinance_patched'):
        requests.get = patched_get
        requests.post = patched_post
        requests._yfinance_patched = True


class Command(BaseCommand):
    help = "Smoke-test yfinance market data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--symbol",
            type=str,
            default="AAPL",
            help="Symbol to test (default: AAPL)",
        )

    def handle(self, *args, **options):
        symbol = options.get("symbol", "AAPL")
        
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(self.style.SUCCESS("YFINANCE CHECK"))
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(f"Symbol: {symbol}\n")
        
        if not YFINANCE_AVAILABLE:
            self.stdout.write(self.style.ERROR("✗ yfinance is not installed!"))
            self.stdout.write("Install: pip install yfinance")
            return
        
        self.stdout.write("✓ yfinance import OK")
        
        _setup_yfinance_headers()
        self.stdout.write("✓ User-Agent headers patched\n")
        
        self.stdout.write("[1/4] Creating ticker...")
        try:
            ticker = yf.Ticker(symbol)
            self.stdout.write(self.style.SUCCESS("✓ Ticker created"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ Failed to create ticker: {str(e)}"))
            return
        
        self.stdout.write("\n[2/4] Fetching info...")
        try:
            info = ticker.info
            if info and len(info) > 0:
                self.stdout.write(self.style.SUCCESS(f"✓ Info received ({len(info)} fields)"))
                if "longName" in info:
                    self.stdout.write(f"  Name: {info.get('longName', 'N/A')}")
                if "currentPrice" in info:
                    self.stdout.write(f"  Last price: ${info.get('currentPrice', 'N/A')}")
            else:
                self.stdout.write(self.style.WARNING("⚠ Info empty"))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"⚠ Could not read info: {str(e)}"))
        
        self.stdout.write("\n[3/4] History (1 day, 1h)...")
        try:
            hist = ticker.history(period="1d", interval="1h")
            if not hist.empty:
                self.stdout.write(self.style.SUCCESS(f"✓ Rows: {len(hist)}"))
                latest = hist.iloc[-1]
                self.stdout.write(f"  Last close: ${latest['Close']:.2f}")
                self.stdout.write(f"  Volume: {int(latest['Volume'])}")
            else:
                self.stdout.write(self.style.WARNING("⚠ Empty history"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ History error: {str(e)}"))
            self.stdout.write("\nPossible causes:")
            self.stdout.write("  - No network")
            self.stdout.write("  - Yahoo Finance unreachable")
            self.stdout.write("  - Proxy / firewall")
            self.stdout.write("  - Invalid symbol")
            return
        
        self.stdout.write("\n[4/4] History (1 month, 1h)...")
        try:
            hist = ticker.history(period="1mo", interval="1h")
            if not hist.empty:
                self.stdout.write(self.style.SUCCESS(f"✓ Rows: {len(hist)}"))
                self.stdout.write(f"  Range: {hist.index[0]} - {hist.index[-1]}")
                self.stdout.write(f"  Last close: ${hist.iloc[-1]['Close']:.2f}")
            else:
                self.stdout.write(self.style.WARNING("⚠ Empty history"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"✗ History error: {str(e)}"))
            return
        
        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        
        tests_passed = 0
        if YFINANCE_AVAILABLE:
            tests_passed += 1
        try:
            if ticker and not hist.empty:
                tests_passed += 1
        except Exception:
            pass
        
        if tests_passed >= 2:
            self.stdout.write(self.style.SUCCESS("✓ YFINANCE LOOKS OK"))
            self.stdout.write(self.style.SUCCESS("="*70))
            self.stdout.write("\nMarketMonitoringAgent should be able to pull Yahoo data.")
        else:
            self.stdout.write(self.style.ERROR("✗ YFINANCE CHECK FAILED"))
            self.stdout.write(self.style.ERROR("="*70))
            self.stdout.write("\nISSUES:")
            self.stdout.write("  - Yahoo may rate-limit (429)")
            self.stdout.write("  - Network / DNS / proxy problems")
            self.stdout.write("\nMITIGATIONS:")
            self.stdout.write("  1. Add delays between calls")
            self.stdout.write("  2. Use a proxy")
            self.stdout.write("  3. Prefer crypto APIs (Bybit) for digital assets")
            self.stdout.write("  4. Cache responses longer")
            self.stdout.write("  5. Keep custom User-Agent headers")
