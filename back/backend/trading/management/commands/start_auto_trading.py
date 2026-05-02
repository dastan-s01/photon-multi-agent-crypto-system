"""
Set UserSettings.status=running so periodic Celery tasks can pick up the user.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from trading.models import UserSettings, Symbol, Account
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = "Mark user settings as running (background tasks use this flag)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="User email",
        )
        parser.add_argument(
            "--user-id",
            type=int,
            help="User id",
        )
        parser.add_argument(
            "--symbol",
            type=str,
            default="BTCUSDT",
            help="Primary symbol (default: BTCUSDT)",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        user_id = options.get("user_id")
        symbol_code = options.get("symbol", "BTCUSDT")

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"No user with id {user_id}"))
                return
        elif email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"No user with email {email}"))
                return
        else:
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR("No users in the database"))
                return

        self.stdout.write(self.style.SUCCESS(f"User: {user.email}"))

        user_settings, created = UserSettings.objects.get_or_create(
            user=user,
            defaults={
                "status": "running",
                "symbol": symbol_code,
                "timeframe": "1h",
                "risk_level": "medium",
                "confidence_threshold": Decimal("0.55"),
            }
        )

        if not created:
            user_settings.status = "running"
            user_settings.symbol = symbol_code
            user_settings.save()

        symbol, symbol_created = Symbol.objects.get_or_create(
            user=user,
            symbol=symbol_code,
            defaults={
                "name": f"{symbol_code}",
                "is_active": True,
            }
        )

        if symbol_created:
            self.stdout.write(self.style.SUCCESS(f"✓ Created symbol: {symbol_code}"))
        else:
            symbol.is_active = True
            symbol.save()
            self.stdout.write(self.style.SUCCESS(f"✓ Activated symbol: {symbol_code}"))

        account, account_created = Account.objects.get_or_create(
            user=user,
            defaults={
                "balance": Decimal("10000.00"),
                "free_cash": Decimal("10000.00"),
                "initial_balance": Decimal("10000.00"),
            }
        )

        if account_created:
            self.stdout.write(self.style.SUCCESS(f"✓ Created account, balance: ${account.balance}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"✓ Account exists: ${account.balance}"))

        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        self.stdout.write(self.style.SUCCESS("AUTO LOOP ENABLED"))
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(f"\nStatus: {user_settings.get_status_display()}")
        self.stdout.write(f"Symbol: {user_settings.symbol}")
        self.stdout.write(f"Timeframe: {user_settings.timeframe}")
        self.stdout.write(f"Risk: {user_settings.get_risk_level_display()}")
        self.stdout.write(f"Confidence threshold: {user_settings.confidence_threshold}%")

        self.stdout.write(self.style.SUCCESS("\n✓ Celery beat will pick this up if configured."))
        self.stdout.write("\nLogs:")
        self.stdout.write("  docker compose logs -f backend | grep -i 'ai agents workflow\\|decision\\|trade executed'")
        self.stdout.write("\nCLI monitor:")
        self.stdout.write(f"  python manage.py monitor_agents --email {user.email}")
