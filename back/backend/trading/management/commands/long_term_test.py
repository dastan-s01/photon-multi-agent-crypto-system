"""
Team for long-term testing of agents

Runs continuous testing for a specified time or number of iterations.
"""
import time
import signal
import sys
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from trading.models import Symbol, Account, Position, Trade, TradingDecision
from trading.management.commands.test_agents import Command as TestAgentsCommand

User = get_user_model()


class Command(BaseCommand):
help = "Long-term testing of agents (continuous operation)"

    def __init__(self):
        super().__init__()
        self.running = True
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)

    def signal_handler(self, signum, frame):
self.stdout.write(self.style.WARNING("\n\nStop signal received. Completing testing..."))
        self.running = False

    def add_arguments(self, parser):
        parser.add_argument(
            "--user-id",
            type=int,
help="User ID for testing",
        )
        parser.add_argument(
            "--email",
            type=str,
help="User email for testing",
        )
        parser.add_argument(
            "--symbol",
            type=str,
            default="AAPL",
help="Symbol for testing",
        )
        parser.add_argument(
            "--duration",
            type=int,
help="Duration of testing in minutes",
        )
        parser.add_argument(
            "--iterations",
            type=int,
help="Maximum number of iterations",
        )
        parser.add_argument(
            "--interval",
            type=int,
            default=60,
help="Interval between iterations in seconds (default: 60)",
        )
        parser.add_argument(
            "--execute",
            action="store_true",
help="Execute real trades",
        )

    def handle(self, *args, **options):
        user_id = options.get("user_id")
        email = options.get("email")
        symbol_code = options.get("symbol", "AAPL")
        duration_minutes = options.get("duration")
        max_iterations = options.get("iterations")
        interval = options.get("interval", 60)
        execute_trades = options.get("execute", False)

        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
self.stdout.write(self.style.ERROR(f"User with ID {user_id} not found"))
                return
        elif email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
self.stdout.write(self.style.ERROR(f"User with email {email} not found"))
                return
        else:
            user = User.objects.first()
            if not user:
self.stdout.write(self.style.ERROR("No users in the system"))
                return

        self.stdout.write(self.style.SUCCESS("="*70))
self.stdout.write(self.style.SUCCESS("LONG-TERM AGENT TESTING"))
        self.stdout.write(self.style.SUCCESS("="*70))
self.stdout.write(f"User: {user.email}")
self.stdout.write(f"Symbol: {symbol_code}")
self.stdout.write(f"Interval: {interval} seconds")
self.stdout.write(f"Execute trades: {'Yes' if execute_trades else 'No'}")
        
        if duration_minutes:
            end_time = timezone.now() + timedelta(minutes=duration_minutes)
self.stdout.write(f"Duration: {duration_minutes} minutes (up to {end_time.strftime('%H:%M:%S')})")
        if max_iterations:
self.stdout.write(f"Maximum number of iterations: {max_iterations}")
        
self.stdout.write("\nPress Ctrl+C to stop\n")

        account, _ = Account.objects.get_or_create(
            user=user,
            defaults={"balance": 10000.00, "free_cash": 10000.00}
        )
        initial_balance = account.balance
        initial_trades = Trade.objects.filter(user=user).count()
        initial_decisions = TradingDecision.objects.filter(user=user).count()
        initial_positions = Position.objects.filter(user=user, is_open=True).count()

self.stdout.write(f"Initial balance: ${initial_balance}")
self.stdout.write(f"Initial number of trades: {initial_trades}")
self.stdout.write(f"Initial number of decisions: {initial_decisions}")
self.stdout.write(f"Initial number of positions: {initial_positions}")
        self.stdout.write("")

        test_command = TestAgentsCommand()
        test_command.stdout = self.stdout
        test_command.style = self.style

        iteration = 0
        start_time = timezone.now()

        try:
            while self.running:
                iteration += 1
                current_time = timezone.now()

                if duration_minutes and current_time >= end_time:
self.stdout.write(self.style.WARNING(f"\nTest end time reached"))
                    break

                if max_iterations and iteration > max_iterations:
self.stdout.write(self.style.WARNING(f"\nMaximum number of iterations reached"))
                    break

                elapsed = (current_time - start_time).total_seconds() / 60
                self.stdout.write(self.style.SUCCESS(f"\n{'='*70}"))
self.stdout.write(f"Iteration
                self.stdout.write(f"{'='*70}")

                try:
                    from trading.agents import MarketMonitoringAgent, DecisionMakingAgent, ExecutionAgent
                    from trading.agents.integration import (
                        MarketAgentIntegration,
                        DecisionAgentIntegration,
                        ExecutionAgentIntegration
                    )
                    from trading.models import Symbol as SymbolModel

                    symbol = SymbolModel.objects.get(user=user, symbol=symbol_code)

                    # Market Agent
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

                    # Decision Agent
                    decision_integration = DecisionAgentIntegration(user)
                    decision_agent = DecisionMakingAgent(
                        model_type="random_forest",
                        risk_tolerance="medium",
                        min_confidence=0.55,
                        enable_ai=True
                    )
                    from trading.models import MarketData
                    latest_data = MarketData.objects.filter(symbol=symbol).order_by("-timestamp").first()

                    decision = decision_integration.make_decision(
                        symbol=symbol,
                        market_data_obj=latest_data,
                        market_message=market_message,
                        decision_agent=decision_agent
                    )

self.stdout.write(f"Decision: {decision.decision} (confidence: {decision.confidence}%)")

                    # Execution Agent
                    if decision.decision != "HOLD" and execute_trades:
                        execution_integration = ExecutionAgentIntegration(user)
                        execution_agent = ExecutionAgent(
                            execution_mode="simulated",
                            enable_slippage=True,
                        )

                        decision_dict = {
                            "action": decision.decision,
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
self.stdout.write(f"✓ Trade completed: {trade.action} {trade.quantity} @ ${trade.price}")

                    account.refresh_from_db()
                    current_balance = account.balance
                    current_trades = Trade.objects.filter(user=user).count()
                    current_positions = Position.objects.filter(user=user, is_open=True).count()

                    balance_change = current_balance - initial_balance
self.stdout.write(f"\nStatistics:")
self.stdout.write(f" Balance: ${current_balance} (change: ${balance_change:+.2f})")
self.stdout.write(f" Trades: {current_trades} (+{current_trades - initial_trades})")
self.stdout.write(f" Positions: {current_positions}")

                except Exception as e:
self.stdout.write(self.style.ERROR(f"Error in iteration {iteration}: {str(e)}"))
                    import traceback
                    self.stdout.write(traceback.format_exc())

                if self.running and (not max_iterations or iteration < max_iterations):
                    if duration_minutes and timezone.now() < end_time:
self.stdout.write(f"\nWaiting {interval} seconds...")
                        for _ in range(interval):
                            if not self.running:
                                break
                            time.sleep(1)

        except KeyboardInterrupt:
self.stdout.write(self.style.WARNING("\n\nInterrupt signal received"))

        self.stdout.write(self.style.SUCCESS(f"\n{'='*70}"))
self.stdout.write(self.style.SUCCESS("FINAL STATISTICS"))
        self.stdout.write(self.style.SUCCESS(f"{'='*70}"))

        account.refresh_from_db()
        final_balance = account.balance
        final_trades = Trade.objects.filter(user=user).count()
        final_decisions = TradingDecision.objects.filter(user=user).count()
        final_positions = Position.objects.filter(user=user, is_open=True).count()

        total_time = (timezone.now() - start_time).total_seconds() / 60

self.stdout.write(f"Working time: {total_time:.1f} minutes")
self.stdout.write(f"Iterations completed: {iteration}")
self.stdout.write(f"\nBalance:")
self.stdout.write(f" Initial: ${initial_balance}")
self.stdout.write(f" Final: ${final_balance}")
self.stdout.write(f" Change: ${final_balance - initial_balance:+.2f}")

self.stdout.write(f"\nTransactions:")
self.stdout.write(f" Initial: {initial_trades}")
self.stdout.write(f" Final: {final_trades}")
self.stdout.write(f" Done: {final_trades - initial_trades}")

self.stdout.write(f"\nSolutions:")
self.stdout.write(f" Total: {final_decisions}")
self.stdout.write(f" New: {final_decisions - initial_decisions}")

self.stdout.write(f"\nPositions:")
self.stdout.write(f" Open: {final_positions}")

self.stdout.write(self.style.SUCCESS("\n✓ Long-term testing completed!"))

