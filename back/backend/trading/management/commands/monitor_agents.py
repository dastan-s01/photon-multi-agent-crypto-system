"""
Live dashboard in the terminal for agent activity (decisions, trades, stats).
"""
import time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum, Q
from trading.models import (
    UserSettings, Symbol, TradingDecision, Trade, AgentStatus, Account, Position
)
from decimal import Decimal

User = get_user_model()


class Command(BaseCommand):
    help = "Watch AI agent activity in near real time"

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
            "--watch",
            action="store_true",
            help="Refresh loop (default interval 5s)",
        )
        parser.add_argument(
            "--interval",
            type=int,
            default=5,
            help="Refresh interval seconds (default: 5)",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        user_id = options.get("user_id")
        watch_mode = options.get("watch", False)
        interval = options.get("interval", 5)

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

        try:
            user_settings = UserSettings.objects.get(user=user)
        except UserSettings.DoesNotExist:
            self.stdout.write(self.style.ERROR("UserSettings missing. Run start_auto_trading first."))
            return

        if watch_mode:
            self.stdout.write(self.style.SUCCESS(f"\n{'='*70}"))
            self.stdout.write(self.style.SUCCESS("AGENT WATCH MODE"))
            self.stdout.write(self.style.SUCCESS(f"{'='*70}"))
            self.stdout.write(f"User: {user.email}")
            self.stdout.write(f"Refresh every {interval}s")
            self.stdout.write("Press Ctrl+C to exit\n")

            try:
                while True:
                    self._display_status(user, user_settings)
                    time.sleep(interval)
                    self.stdout.write("\033[2J\033[H")
            except KeyboardInterrupt:
                self.stdout.write(self.style.SUCCESS("\n\nStopped"))
        else:
            self._display_status(user, user_settings)

    def _display_status(self, user, user_settings):
        """Print current agent snapshot."""
        now = timezone.now()

        self.stdout.write(self.style.SUCCESS(f"\n{'='*70}"))
        self.stdout.write(self.style.SUCCESS("AUTO-TRADING STATUS"))
        self.stdout.write(self.style.SUCCESS(f"{'='*70}"))
        self.stdout.write(f"User: {user.email}")
        self.stdout.write(f"Status: {user_settings.get_status_display()}")
        self.stdout.write(f"Symbol: {user_settings.symbol}")
        self.stdout.write(f"Time: {now.strftime('%Y-%m-%d %H:%M:%S')}")

        self.stdout.write(self.style.SUCCESS(f"\n{'─'*70}"))
        self.stdout.write(self.style.SUCCESS("AGENTS"))
        self.stdout.write(self.style.SUCCESS(f"{'─'*70}"))

        agent_types = ["MARKET_MONITOR", "DECISION_MAKER", "EXECUTION"]
        for agent_type in agent_types:
            try:
                status_obj = AgentStatus.objects.get(user=user, agent_type=agent_type)
                last_activity = status_obj.last_activity.strftime('%H:%M:%S') if status_obj.last_activity else "N/A"
                self.stdout.write(
                    f"  {agent_type:20} | {status_obj.get_status_display():10} | "
                    f"Last activity: {last_activity}"
                )
            except AgentStatus.DoesNotExist:
                self.stdout.write(f"  {agent_type:20} | Not found")

        self.stdout.write(self.style.SUCCESS(f"\n{'─'*70}"))
        self.stdout.write(self.style.SUCCESS("DECISIONS (last 24h)"))
        self.stdout.write(self.style.SUCCESS(f"{'─'*70}"))

        from datetime import timedelta
        last_24h = now - timedelta(hours=24)

        decisions_24h = TradingDecision.objects.filter(
            user=user,
            created_at__gte=last_24h
        )

        total_decisions = decisions_24h.count()
        buy_decisions = decisions_24h.filter(decision="BUY").count()
        sell_decisions = decisions_24h.filter(decision="SELL").count()
        hold_decisions = decisions_24h.filter(decision="HOLD").count()

        self.stdout.write(f"  Total: {total_decisions}")
        self.stdout.write(f"    - BUY:  {buy_decisions}")
        self.stdout.write(f"    - SELL: {sell_decisions}")
        self.stdout.write(f"    - HOLD: {hold_decisions}")

        last_decisions = decisions_24h.order_by("-created_at")[:5]
        if last_decisions.exists():
            self.stdout.write(self.style.SUCCESS(f"\n  Latest:"))
            for decision in last_decisions:
                time_str = decision.created_at.strftime('%H:%M:%S')
                self.stdout.write(
                    f"    {time_str} | {decision.decision:4} | "
                    f"Confidence: {decision.confidence}% | {decision.symbol.symbol}"
                )

        self.stdout.write(self.style.SUCCESS(f"\n{'─'*70}"))
        self.stdout.write(self.style.SUCCESS("TRADES"))
        self.stdout.write(self.style.SUCCESS(f"{'─'*70}"))

        trades_24h = Trade.objects.filter(
            user=user,
            executed_at__gte=last_24h
        )

        total_trades = trades_24h.count()
        buy_trades = trades_24h.filter(action="BUY").count()
        sell_trades = trades_24h.filter(action="SELL").count()

        completed_trades = trades_24h.filter(action="SELL", pnl__isnull=False)
        total_pnl = completed_trades.aggregate(total=Sum("pnl"))["total"] or Decimal("0.00")
        winning_trades = completed_trades.filter(pnl__gt=0).count()
        losing_trades = completed_trades.filter(pnl__lt=0).count()

        self.stdout.write(f"  Total (24h): {total_trades}")
        self.stdout.write(f"    - BUY:  {buy_trades}")
        self.stdout.write(f"    - SELL: {sell_trades}")
        self.stdout.write(f"\n  Closed (SELL w/ PnL): {completed_trades.count()}")
        self.stdout.write(f"    - Winners: {winning_trades}")
        self.stdout.write(f"    - Losers: {losing_trades}")
        self.stdout.write(f"    - Total PnL: ${total_pnl:+.2f}")

        last_trades = trades_24h.order_by("-executed_at")[:5]
        if last_trades.exists():
            self.stdout.write(self.style.SUCCESS(f"\n  Latest:"))
            for trade in last_trades:
                time_str = trade.executed_at.strftime('%H:%M:%S')
                pnl_str = f"PnL: ${trade.pnl:+.2f}" if trade.pnl is not None else "PnL: N/A"
                self.stdout.write(
                    f"    {time_str} | {trade.action:4} | "
                    f"{trade.quantity} {trade.symbol.symbol} @ ${trade.price} | {pnl_str}"
                )

        self.stdout.write(self.style.SUCCESS(f"\n{'─'*70}"))
        self.stdout.write(self.style.SUCCESS("PORTFOLIO"))
        self.stdout.write(self.style.SUCCESS(f"{'─'*70}"))

        try:
            account = Account.objects.get(user=user)
            self.stdout.write(f"  Balance: ${account.balance}")
            self.stdout.write(f"  Free cash: ${account.free_cash}")
            self.stdout.write(f"  Margin used: ${account.used_margin}")
        except Account.DoesNotExist:
            self.stdout.write("  Account not found")

        open_positions = Position.objects.filter(user=user, is_open=True)
        if open_positions.exists():
            self.stdout.write(f"\n  Open positions: {open_positions.count()}")
            for pos in open_positions[:3]:
                pnl = pos.pnl
                pnl_str = f"PnL: ${pnl:+.2f}" if pnl else "PnL: N/A"
                self.stdout.write(
                    f"    {pos.symbol.symbol:10} | {pos.quantity:8} @ ${pos.entry_price:8.2f} | "
                    f"Mark: ${pos.current_price or 0:8.2f} | {pnl_str}"
                )
        else:
            self.stdout.write("\n  No open positions")

        completed_trades_count = Trade.objects.filter(
            user=user,
            action="SELL",
            pnl__isnull=False
        ).count()

        if completed_trades_count < 10:
            self.stdout.write(self.style.WARNING(f"\n{'─'*70}"))
            self.stdout.write(self.style.WARNING("EXPLORATION MODE"))
            self.stdout.write(self.style.WARNING(f"{'─'*70}"))
            self.stdout.write(
                f"  Closed trades: {completed_trades_count}/10\n"
                f"  Confidence threshold lowered to 35% for data collection\n"
                f"  After 10+ closed trades the system switches to normal thresholds"
            )

        self.stdout.write(self.style.SUCCESS(f"\n{'='*70}\n"))
