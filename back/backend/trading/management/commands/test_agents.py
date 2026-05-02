"""
Management command to exercise the full AI agent pipeline.

Runs:
1. MarketMonitoringAgent — fetch market data
2. DecisionMakingAgent — produce a decision
3. ExecutionAgent — execute a (simulated) trade
"""
import time
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from trading.models import Symbol, TradingDecision, Trade, Position, Account, AgentStatus, Message, AgentLog
from trading.agents import MarketMonitoringAgent, DecisionMakingAgent, ExecutionAgent
from trading.agents.integration import (
    MarketAgentIntegration,
    DecisionAgentIntegration,
    ExecutionAgentIntegration
)

User = get_user_model()


class Command(BaseCommand):
    help = "Run the AI agents end-to-end (Market → Decision → Execution)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--user-id",
            type=int,
            help="User ID to run as",
        )
        parser.add_argument(
            "--email",
            type=str,
            help="User email to run as",
        )
        parser.add_argument(
            "--symbol",
            type=str,
            default="AAPL",
            help="Symbol to test (default: AAPL)",
        )
        parser.add_argument(
            "--iterations",
            type=int,
            default=1,
            help="How many iterations to run (default: 1)",
        )
        parser.add_argument(
            "--delay",
            type=int,
            default=5,
            help="Seconds to wait between iterations (default: 5)",
        )
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Execute demo trades (default: decisions only)",
        )

    def handle(self, *args, **options):
        user_id = options.get("user_id")
        email = options.get("email")
        symbol_code = options.get("symbol", "AAPL")
        iterations = options.get("iterations", 1)
        delay = options.get("delay", 5)
        execute_trades = options.get("execute", False)

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
                self.stdout.write(self.style.ERROR("No users in the database. Create a user first."))
                return

        self.stdout.write(self.style.SUCCESS(f"Running for user: {user.email}"))
        self.stdout.write(f"Symbol: {symbol_code}")
        self.stdout.write(f"Iterations: {iterations}")
        self.stdout.write(f"Execute trades: {'Yes' if execute_trades else 'No (decisions only)'}")
        self.stdout.write("")

        symbol, created = Symbol.objects.get_or_create(
            user=user,
            symbol=symbol_code,
            defaults={
                "name": f"Test {symbol_code}",
                "is_active": True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created symbol: {symbol_code}"))

        account, _ = Account.objects.get_or_create(
            user=user,
            defaults={"balance": Decimal("10000.00"), "free_cash": Decimal("10000.00")}
        )
        initial_balance = account.balance
        self.stdout.write(f"Starting balance: ${initial_balance}")

        stats = {
            "decisions": 0,
            "trades": 0,
            "errors": 0,
            "buy_decisions": 0,
            "sell_decisions": 0,
            "hold_decisions": 0,
        }

        for iteration in range(1, iterations + 1):
            self.stdout.write(self.style.WARNING(f"\n{'='*60}"))
            self.stdout.write(self.style.WARNING(f"Iteration {iteration}/{iterations}"))
            self.stdout.write(self.style.WARNING(f"{'='*60}"))

            try:
                self.stdout.write("\n[1/3] MarketMonitoringAgent: fetching market data...")
                market_integration = MarketAgentIntegration(user)
                market_agent = MarketMonitoringAgent(
                    ticker=symbol_code,
                    interval="1h",
                    period="1mo",
                    enable_cache=True,
                    request_delay=5.0,
                    max_retries=5,
                    backoff_factor=3.0
                )

                market_message = market_integration.process_and_save(
                    symbol=symbol,
                    market_agent=market_agent,
                    save_to_db=True
                )

                from trading.models import MarketData
                latest_data = MarketData.objects.filter(symbol=symbol).order_by("-timestamp").first()

                self.stdout.write(self.style.SUCCESS(f"✓ Data received: {market_message.get('ohlcv', {}).get('close', 'N/A')}"))

                self.stdout.write("\n[2/3] DecisionMakingAgent: making decision...")
                decision_integration = DecisionAgentIntegration(user)

                decision_agent = DecisionMakingAgent(
                    model_type="random_forest",
                    risk_tolerance="medium",
                    min_confidence=0.35,
                    enable_ai=True,
                    use_historical_training=True,
                    training_ticker=symbol_code,
                    training_period="1mo"
                )

                decision = decision_integration.make_decision(
                    symbol=symbol,
                    market_data_obj=latest_data,
                    market_message=market_message,
                    decision_agent=decision_agent
                )

                stats["decisions"] += 1
                decision_action = decision.decision
                if decision_action == "BUY":
                    stats["buy_decisions"] += 1
                elif decision_action == "SELL":
                    stats["sell_decisions"] += 1
                else:
                    stats["hold_decisions"] += 1

                self.stdout.write(self.style.SUCCESS(
                    f"✓ Decision: {decision_action} "
                    f"(confidence: {decision.confidence}%, "
                    f"reasoning: {decision.reasoning[:50]}...)"
                ))

                if decision_action != "HOLD" and execute_trades:
                    self.stdout.write(f"\n[3/3] ExecutionAgent: executing {decision_action}...")
                    execution_integration = ExecutionAgentIntegration(user)

                    execution_agent = ExecutionAgent(
                        execution_mode="simulated",
                        enable_slippage=True,
                        slippage_factor=0.001,
                        commission_rate=0.001,
                    )

                    decision_dict = {
                        "action": decision_action,
                        "ticker": symbol_code,
                        "quantity": decision.metadata.get("quantity", 1),
                        "price": decision.metadata.get("price", float(latest_data.price) if latest_data else 0.0),
                        "confidence": float(decision.confidence / 100) if decision.confidence else 0.5,
                        "timestamp": decision.created_at.isoformat(),
                        "reasoning": decision.reasoning,
                    }

                    execution_result = execution_agent.receive_decision(decision_dict)

                    if execution_result.get("status") == "executed":
                        trade = execution_integration.execute_trade(
                            symbol=symbol,
                            decision_obj=decision,
                            execution_agent=execution_agent,
                            execution_result=execution_result
                        )

                        if trade:
                            stats["trades"] += 1
                            self.stdout.write(self.style.SUCCESS(
                                f"✓ Trade executed: {trade.action} {trade.quantity} @ ${trade.price}"
                            ))
                        else:
                            self.stdout.write(self.style.WARNING("⚠ Trade not executed (insufficient funds / position)"))
                    else:
                        self.stdout.write(self.style.WARNING(
                            f"⚠ Trade rejected: {execution_result.get('message', 'Unknown reason')}"
                        ))
                elif decision_action == "HOLD":
                    self.stdout.write(self.style.SUCCESS("\n[3/3] ExecutionAgent: skipped (HOLD)"))
                else:
                    self.stdout.write(self.style.SUCCESS("\n[3/3] ExecutionAgent: skipped (--execute not set)"))

                account.refresh_from_db()
                current_balance = account.balance
                balance_change = current_balance - initial_balance

                self.stdout.write(f"\nCurrent balance: ${current_balance} (delta: ${balance_change:+.2f})")

                open_positions = Position.objects.filter(user=user, is_open=True)
                if open_positions.exists():
                    self.stdout.write(f"\nOpen positions: {open_positions.count()}")
                    for pos in open_positions[:3]:
                        pnl = pos.pnl
                        pnl_str = f"${pnl:+.2f}" if pnl else "N/A"
                        self.stdout.write(
                            f"  - {pos.symbol.symbol}: {pos.quantity} @ ${pos.entry_price} "
                            f"(mark: ${pos.current_price or 0}, P&L: {pnl_str})"
                        )

            except Exception as e:
                stats["errors"] += 1
                self.stdout.write(self.style.ERROR(f"\n✗ Error in iteration {iteration}: {str(e)}"))
                import traceback
                self.stdout.write(traceback.format_exc())

            if iteration < iterations:
                self.stdout.write(f"\nWaiting {delay}s before next iteration...")
                time.sleep(delay)

        self.stdout.write(self.style.SUCCESS(f"\n{'='*60}"))
        self.stdout.write(self.style.SUCCESS("FINAL SUMMARY"))
        self.stdout.write(self.style.SUCCESS(f"{'='*60}"))
        self.stdout.write(f"Total decisions: {stats['decisions']}")
        self.stdout.write(f"  - BUY: {stats['buy_decisions']}")
        self.stdout.write(f"  - SELL: {stats['sell_decisions']}")
        self.stdout.write(f"  - HOLD: {stats['hold_decisions']}")
        self.stdout.write(f"Trades executed: {stats['trades']}")
        self.stdout.write(f"Errors: {stats['errors']}")

        account.refresh_from_db()
        final_balance = account.balance
        total_change = final_balance - initial_balance
        return_percent = (total_change / initial_balance * 100) if initial_balance > 0 else 0

        self.stdout.write(f"\nBalance:")
        self.stdout.write(f"  Initial: ${initial_balance}")
        self.stdout.write(f"  Final: ${final_balance}")
        self.stdout.write(f"  Change: ${total_change:+.2f} ({return_percent:+.2f}%)")

        messages = Message.objects.filter(user=user).order_by("-timestamp")[:5]
        if messages.exists():
            self.stdout.write(f"\nLatest inter-agent messages: {messages.count()}")
            for msg in messages:
                self.stdout.write(
                    f"  - {msg.from_agent} → {msg.to_agent}: {msg.message_type} "
                    f"({msg.timestamp.strftime('%H:%M:%S')})"
                )

        logs = AgentLog.objects.filter(agent_status__user=user).order_by("-timestamp")[:5]
        if logs.exists():
            self.stdout.write(f"\nLatest agent logs: {logs.count()}")
            for log in logs:
                self.stdout.write(
                    f"  - [{log.level}] {log.agent_status.agent_type}: {log.message[:50]}"
                )

        self.stdout.write(self.style.SUCCESS("\n✓ Test run finished!"))
