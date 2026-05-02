"""
Inspect decision/trade counts and agent metadata (retraining is logged separately).
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from datetime import timedelta

from trading.models import TradingDecision, Trade, AgentStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Print model / decision / trade stats for a user"

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

    def handle(self, *args, **options):
        email = options.get("email")
        user_id = options.get("user_id")

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

        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(self.style.SUCCESS("MODEL / ACTIVITY STATUS"))
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(f"User: {user.email}\n")

        total_decisions = TradingDecision.objects.filter(user=user).count()
        buy_decisions = TradingDecision.objects.filter(user=user, decision="BUY").count()
        sell_decisions = TradingDecision.objects.filter(user=user, decision="SELL").count()
        hold_decisions = TradingDecision.objects.filter(user=user, decision="HOLD").count()

        self.stdout.write("📊 DECISIONS:")
        self.stdout.write(f"  Total: {total_decisions}")
        self.stdout.write(f"  - BUY: {buy_decisions}")
        self.stdout.write(f"  - SELL: {sell_decisions}")
        self.stdout.write(f"  - HOLD: {hold_decisions}\n")

        total_trades = Trade.objects.filter(user=user).count()
        profitable_trades = Trade.objects.filter(user=user, pnl__gt=0).count()
        losing_trades = Trade.objects.filter(user=user, pnl__lt=0).count()
        neutral_trades = Trade.objects.filter(user=user, pnl=0).count()

        self.stdout.write("💰 TRADES:")
        self.stdout.write(f"  Total: {total_trades}")
        if total_trades > 0:
            self.stdout.write(f"  - Winners: {profitable_trades} ({profitable_trades/total_trades*100:.1f}%)")
            self.stdout.write(f"  - Losers: {losing_trades} ({losing_trades/total_trades*100:.1f}%)")
            self.stdout.write(f"  - Flat: {neutral_trades}\n")
        else:
            self.stdout.write("  - No trades yet\n")

        decisions_with_trades = TradingDecision.objects.filter(
            user=user,
            decision__in=["BUY", "SELL"]
        ).annotate(
            trades_count=Count("symbol__trades", filter=Q(symbol__trades__user=user))
        ).filter(trades_count__gt=0).count()

        self.stdout.write("🎓 TRAINING SIGNAL:")
        self.stdout.write(f"  Decisions with related trades: {decisions_with_trades}")
        self.stdout.write(f"  Heuristic retrain threshold: 50 labeled samples\n")

        recent_decisions = TradingDecision.objects.filter(user=user).order_by("-created_at")[:10]
        if recent_decisions.exists():
            self.stdout.write("📝 LAST 10 DECISIONS:")
            for decision in recent_decisions:
                trades_count = Trade.objects.filter(
                    user=user,
                    symbol=decision.symbol,
                    executed_at__gte=decision.created_at,
                    executed_at__lte=decision.created_at + timedelta(hours=24)
                ).count()

                trade_info = ""
                if trades_count > 0:
                    trade = Trade.objects.filter(
                        user=user,
                        symbol=decision.symbol,
                        executed_at__gte=decision.created_at,
                        executed_at__lte=decision.created_at + timedelta(hours=24)
                    ).first()
                    if trade and trade.pnl is not None:
                        pnl_sign = "✅" if trade.pnl > 0 else "❌"
                        trade_info = f" | {pnl_sign} PnL: ${trade.pnl}"

                self.stdout.write(
                    f"  - {decision.created_at.strftime('%Y-%m-%d %H:%M:%S')} | "
                    f"{decision.symbol.symbol} | {decision.decision} | "
                    f"Confidence: {decision.confidence}%{trade_info}"
                )
            self.stdout.write("")

        try:
            agent_status = AgentStatus.objects.get(user=user, agent_type="DECISION_MAKER")
            self.stdout.write("🤖 DECISION AGENT STATUS:")
            self.stdout.write(f"  State: {agent_status.get_status_display()}")
            if agent_status.last_activity:
                self.stdout.write(f"  Last activity: {agent_status.last_activity.strftime('%Y-%m-%d %H:%M:%S')}")
            if agent_status.metadata:
                self.stdout.write(f"  Metadata: {agent_status.metadata}")
            self.stdout.write("")

        except AgentStatus.DoesNotExist:
            self.stdout.write("⚠️  No decision agent status row\n")

        self.stdout.write("🔄 RETRAIN:")
        self.stdout.write("  Check backend logs for 'retrain' / 'Model retrained' if enabled.")
        self.stdout.write("    docker compose logs backend | grep -i 'retrain\\|continuous learning\\|Model retrained'")

        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        self.stdout.write(self.style.SUCCESS("✓ Done"))
