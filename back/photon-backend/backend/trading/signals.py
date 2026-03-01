from decimal import Decimal
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from trading.models import AgentStatus, Account, UserSettings, Symbol


User = get_user_model()

# Default symbols for new users
DEFAULT_SYMBOLS = [
    # Crypto (Bybit format)
    {"symbol": "BTCUSDT", "name": "Bitcoin"},
    {"symbol": "ETHUSDT", "name": "Ethereum"},
    {"symbol": "BNBUSDT", "name": "Binance Coin"},
    {"symbol": "SOLUSDT", "name": "Solana"},
    {"symbol": "ADAUSDT", "name": "Cardano"},
    {"symbol": "XRPUSDT", "name": "Ripple"},
    {"symbol": "DOGEUSDT", "name": "Dogecoin"},
    {"symbol": "MATICUSDT", "name": "Polygon"},
    # Stocks (Yahoo Finance format)
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "TSLA", "name": "Tesla Inc."},
    {"symbol": "META", "name": "Meta Platforms Inc."},
    {"symbol": "NVDA", "name": "NVIDIA Corporation"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
]


@receiver(post_save, sender=User)
def create_default_agent_statuses(sender, instance, created, **kwargs):
    """Create agent statuses, account, settings and default symbols on user creation"""
    if created:
        # Create agent statuses
        for agent_type, _ in AgentStatus.AGENT_TYPES:
            AgentStatus.objects.get_or_create(
                user=instance,
                agent_type=agent_type,
                defaults={"status": "IDLE"},
            )
        # Create user account with initial balance
        Account.objects.get_or_create(
            user=instance,
            defaults={
                "balance": Decimal("10000.00"),
                "free_cash": Decimal("10000.00"),
                "initial_balance": Decimal("10000.00"),
            }
        )
        # Create user settings with defaults
        UserSettings.objects.get_or_create(
            user=instance,
            defaults={
                "status": "stopped",
                "speed": 1.0,
                "symbol": "AAPL",
                "timeframe": "1h",
                "data_provider": "Yahoo Finance",
                "history_length": "Last 1 year",
                "model_type": "Random Forest",
                "prediction_horizon": "1 hour",
                "confidence_threshold": Decimal("0.55"),
                "initial_balance": Decimal("10000.00"),
                "max_position_size": 50,
                "risk_level": "medium",
                "stop_loss": Decimal("-2.0"),
                "take_profit": Decimal("5.0"),
                "max_leverage": Decimal("1.0"),
            }
        )
        # Create default symbols for user
        for symbol_data in DEFAULT_SYMBOLS:
            Symbol.objects.get_or_create(
                user=instance,
                symbol=symbol_data["symbol"],
                defaults={
                    "name": symbol_data["name"],
                    "is_active": True,
                }
            )

