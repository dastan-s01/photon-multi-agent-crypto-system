"""
Команда для проверки статуса постоянного обучения модели

Показывает:
- Статус обучения модели
- Количество решений с последнего переобучения
- Время последнего переобучения
- Статистику по решениям и сделкам
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta

from trading.models import TradingDecision, Trade, AgentStatus

User = get_user_model()


class Command(BaseCommand):
    help = "Проверяет статус постоянного обучения модели"

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Email пользователя для проверки",
        )
        parser.add_argument(
            "--user-id",
            type=int,
            help="ID пользователя для проверки",
        )

    def handle(self, *args, **options):
        email = options.get("email")
        user_id = options.get("user_id")

        # Получаем пользователя
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Пользователь с ID {user_id} не найден"))
                return
        elif email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Пользователь с email {email} не найден"))
                return
        else:
            user = User.objects.first()
            if not user:
                self.stdout.write(self.style.ERROR("Нет пользователей в системе"))
                return

        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(self.style.SUCCESS("СТАТУС ПОСТОЯННОГО ОБУЧЕНИЯ МОДЕЛИ"))
        self.stdout.write(self.style.SUCCESS("="*70))
        self.stdout.write(f"Пользователь: {user.email}\n")

        # Статистика по решениям
        total_decisions = TradingDecision.objects.filter(user=user).count()
        buy_decisions = TradingDecision.objects.filter(user=user, decision="BUY").count()
        sell_decisions = TradingDecision.objects.filter(user=user, decision="SELL").count()
        hold_decisions = TradingDecision.objects.filter(user=user, decision="HOLD").count()

        self.stdout.write("📊 СТАТИСТИКА РЕШЕНИЙ:")
        self.stdout.write(f"  Всего решений: {total_decisions}")
        self.stdout.write(f"  - BUY: {buy_decisions}")
        self.stdout.write(f"  - SELL: {sell_decisions}")
        self.stdout.write(f"  - HOLD: {hold_decisions}\n")

        # Статистика по сделкам
        total_trades = Trade.objects.filter(user=user).count()
        profitable_trades = Trade.objects.filter(user=user, pnl__gt=0).count()
        losing_trades = Trade.objects.filter(user=user, pnl__lt=0).count()
        neutral_trades = Trade.objects.filter(user=user, pnl=0).count()

        self.stdout.write("💰 СТАТИСТИКА СДЕЛОК:")
        self.stdout.write(f"  Всего сделок: {total_trades}")
        if total_trades > 0:
            self.stdout.write(f"  - Прибыльных: {profitable_trades} ({profitable_trades/total_trades*100:.1f}%)")
            self.stdout.write(f"  - Убыточных: {losing_trades} ({losing_trades/total_trades*100:.1f}%)")
            self.stdout.write(f"  - Нейтральных: {neutral_trades}\n")
        else:
            self.stdout.write("  - Нет выполненных сделок\n")

        # Решения с выполненными сделками (для обучения)
        decisions_with_trades = TradingDecision.objects.filter(
            user=user,
            decision__in=["BUY", "SELL"]
        ).annotate(
            trades_count=Count("symbol__trades", filter=Q(symbol__trades__user=user))
        ).filter(trades_count__gt=0).count()

        self.stdout.write("🎓 ДАННЫЕ ДЛЯ ОБУЧЕНИЯ:")
        self.stdout.write(f"  Решений с выполненными сделками: {decisions_with_trades}")
        self.stdout.write(f"  Минимум для переобучения: 50 samples\n")

        # Последние решения
        recent_decisions = TradingDecision.objects.filter(user=user).order_by("-created_at")[:10]
        if recent_decisions.exists():
            self.stdout.write("📝 ПОСЛЕДНИЕ 10 РЕШЕНИЙ:")
            for decision in recent_decisions:
                # Проверяем, есть ли сделки для этого решения
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

        # Статус агента
        try:
            agent_status = AgentStatus.objects.get(user=user, agent_type="DECISION_MAKER")
            self.stdout.write("🤖 СТАТУС АГЕНТА:")
            self.stdout.write(f"  Статус: {agent_status.get_status_display()}")
            if agent_status.last_activity:
                self.stdout.write(f"  Последняя активность: {agent_status.last_activity.strftime('%Y-%m-%d %H:%M:%S')}")
            if agent_status.metadata:
                self.stdout.write(f"  Метаданные: {agent_status.metadata}")
            self.stdout.write("")

        except AgentStatus.DoesNotExist:
            self.stdout.write("⚠️  Статус агента не найден\n")

        # Информация о переобучении
        self.stdout.write("🔄 ИНФОРМАЦИЯ О ПЕРЕОБУЧЕНИИ:")
        self.stdout.write("  Модель переобучается автоматически каждые 10 решений")
        self.stdout.write("  (если накопилось ≥50 samples с выполненными сделками)")
        self.stdout.write("  Проверьте логи для деталей переобучения:\n")
        self.stdout.write("    docker compose logs backend | grep -i 'retrain\\|continuous learning\\|Model retrained'")

        self.stdout.write(self.style.SUCCESS("\n" + "="*70))
        self.stdout.write(self.style.SUCCESS("✓ Проверка завершена"))

