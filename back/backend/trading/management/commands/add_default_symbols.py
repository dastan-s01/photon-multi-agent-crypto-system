"""Seed a default watchlist per user (or one user)."""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from trading.models import Symbol

User = get_user_model()

DEFAULT_SYMBOLS = [
    {"symbol": "BTCUSDT", "name": "Bitcoin"},
    {"symbol": "ETHUSDT", "name": "Ethereum"},
    {"symbol": "BNBUSDT", "name": "Binance Coin"},
    {"symbol": "SOLUSDT", "name": "Solana"},
    {"symbol": "ADAUSDT", "name": "Cardano"},
    {"symbol": "XRPUSDT", "name": "Ripple"},
    {"symbol": "DOGEUSDT", "name": "Dogecoin"},
    {"symbol": "MATICUSDT", "name": "Polygon"},
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corporation"},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "TSLA", "name": "Tesla Inc."},
    {"symbol": "META", "name": "Meta Platforms Inc."},
    {"symbol": "NVDA", "name": "NVIDIA Corporation"},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
]


class Command(BaseCommand):
    help = "Add default symbols to all users or one user"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user-id",
            type=int,
            help="Limit to this user id (omit = all users)",
        )
        parser.add_argument(
            "--email",
            type=str,
            help="Limit to this email",
        )

    def handle(self, *args, **options):
        user_id = options.get("user_id")
        email = options.get("email")

        if user_id:
            try:
                users = [User.objects.get(id=user_id)]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"No user with id {user_id}"))
                return
        elif email:
            try:
                users = [User.objects.get(email=email)]
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"No user with email {email}"))
                return
        else:
            users = User.objects.all()

        total_added = 0
        for user in users:
            user_added = 0
            for symbol_data in DEFAULT_SYMBOLS:
                symbol, created = Symbol.objects.get_or_create(
                    user=user,
                    symbol=symbol_data["symbol"],
                    defaults={
                        "name": symbol_data["name"],
                        "is_active": True,
                    }
                )
                if created:
                    user_added += 1

            total_added += user_added
            self.stdout.write(
                self.style.SUCCESS(
                    f"{user.email}: added {user_added} symbols"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(f"\nTotal symbols added: {total_added}")
        )

