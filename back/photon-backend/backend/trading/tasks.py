"""
Celery tasks for trading system
"""
import logging
from datetime import datetime

from celery import shared_task
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings

from trading.models import Symbol, MarketData, AgentStatus
from trading.services import get_market_data_service

User = get_user_model()
logger = logging.getLogger(__name__)

# Active monitoring tasks storage
_active_monitoring_tasks = {}


@shared_task
def start_market_monitoring(user_id: int):
    """Start periodic market monitoring for user"""
    try:
        user = User.objects.get(id=user_id)
        symbols = Symbol.objects.filter(user=user, is_active=True)

        if not symbols.exists():
            logger.warning(f"No active symbols for user {user_id}")
            return

        # Update data for all symbols
        market_service = get_market_data_service()
        updated_count = 0
        for symbol in symbols:
            data = market_service.get_latest_data(symbol.symbol)
            if data:
                MarketData.objects.create(symbol=symbol, **data)
                updated_count += 1

        # Обновляем статус агента
        status_obj, _ = AgentStatus.objects.get_or_create(
            user=user,
            agent_type="MARKET_MONITOR",
            defaults={"status": "RUNNING"},
        )
        status_obj.status = "RUNNING"
        status_obj.last_activity = timezone.now()
        status_obj.save()

        logger.info(f"Market monitoring updated {updated_count} symbols for user {user_id}")
        return {"updated": updated_count, "symbols": list(symbols.values_list("symbol", flat=True))}

    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
    except Exception as e:
        logger.error(f"Error in market monitoring: {str(e)}", exc_info=True)
        # Update status to error
        try:
            user = User.objects.get(id=user_id)
            status_obj, _ = AgentStatus.objects.get_or_create(
                user=user,
                agent_type="MARKET_MONITOR",
                defaults={"status": "ERROR"},
            )
            status_obj.status = "ERROR"
            status_obj.error_message = str(e)
            status_obj.save()
        except Exception:
            pass


@shared_task
def periodic_market_update():
    """
    Periodic task for market data update (runs on schedule).
    Updates ALL active symbols regardless of agent status.
    """
    from trading.models import Symbol

    # Get users with active symbols
    user_ids = Symbol.objects.filter(is_active=True).values_list("user_id", flat=True).distinct()

    total_updated = 0
    for user_id in user_ids:
        try:
            user = User.objects.get(id=user_id)
            # Update data for all user active symbols
            # Do NOT check agent status - data should always update
            market_service = get_market_data_service()
            user_symbols = Symbol.objects.filter(user=user, is_active=True)
            user_updated = 0
            
            for sym in user_symbols:
                try:
                    data = market_service.get_latest_data(sym.symbol)
                    if data:
                        MarketData.objects.create(symbol=sym, **data)
                        user_updated += 1
                        total_updated += 1
                except Exception as e:
                    logger.error(f"Error updating data for symbol {sym.symbol}: {str(e)}", exc_info=True)

            # Update agent status (if exists) for activity tracking
            try:
                status_obj = AgentStatus.objects.get(user=user, agent_type="MARKET_MONITOR")
                # If status was RUNNING, update last_activity
                if status_obj.status == "RUNNING":
                    status_obj.last_activity = timezone.now()
                    status_obj.save()
            except AgentStatus.DoesNotExist:
                # If agent doesn't exist, create with IDLE status
                # Data updates automatically but agent wasn't explicitly started
                AgentStatus.objects.create(
                    user=user,
                    agent_type="MARKET_MONITOR",
                    status="IDLE",
                    last_activity=timezone.now(),
                )
            
            if user_updated > 0:
                logger.info(f"Updated {user_updated} symbols for user {user_id}")
                
        except User.DoesNotExist:
            logger.warning(f"User {user_id} not found, skipping")
            continue
    
    logger.info(f"Periodic market update completed: {total_updated} total updates")
    return {"updated": total_updated}


def stop_market_monitoring(user_id: int):
    """Stop monitoring for user"""
    try:
        user = User.objects.get(id=user_id)
        status_obj = AgentStatus.objects.get(user=user, agent_type="MARKET_MONITOR")
        status_obj.status = "STOPPED"
        status_obj.save()
        logger.info(f"Market monitoring stopped for user {user_id}")
    except Exception as e:
        logger.error(f"Error stopping market monitoring: {str(e)}")


@shared_task
def run_ai_agents_workflow():
    """
    Auto-run AI agents workflow every minute.

    Full cycle:
    1. MarketMonitoringAgent - get market data
    2. DecisionMakingAgent - make decision
    3. ExecutionAgent - execute trade (if not HOLD)

    Runs for all users with status "running" in UserSettings.
    """
    from trading.models import UserSettings, Symbol, Trade
    from trading.agents import MarketMonitoringAgent, DecisionMakingAgent, ExecutionAgent
    from trading.agents.integration import (
        MarketAgentIntegration,
        DecisionAgentIntegration,
        ExecutionAgentIntegration
    )
    from django.utils import timezone as tz
    
    # Get all users with active trading
    active_users = UserSettings.objects.filter(status="running").select_related("user")
    
    if not active_users.exists():
        logger.debug("No active users for AI agents workflow")
        return {"processed": 0}
    
    total_processed = 0
    total_decisions = 0
    total_trades = 0
    
    for user_settings in active_users:
        user = user_settings.user
        
        try:
            # Get user active symbol
            symbol_obj = Symbol.objects.filter(
                user=user,
                symbol=user_settings.symbol,
                is_active=True
            ).first()
            
            if not symbol_obj:
                logger.warning(f"No active symbol {user_settings.symbol} for user {user.id}")
                continue
            
            # Step 1: MarketMonitoringAgent
            try:
                market_integration = MarketAgentIntegration(user)
                market_agent = MarketMonitoringAgent(
                    ticker=user_settings.symbol,
                    interval=user_settings.timeframe,
                    period="1mo",
                    enable_cache=True,
                    request_delay=5.0,
                    max_retries=5,
                    backoff_factor=3.0
                )
                
                market_message = market_integration.process_and_save(
                    symbol=symbol_obj,
                    market_agent=market_agent,
                    save_to_db=True
                )
                
                # Get latest data from DB
                from trading.models import MarketData
                latest_data = MarketData.objects.filter(
                    symbol=symbol_obj
                ).order_by("-timestamp").first()
                
                if not latest_data:
                    logger.warning(f"No market data for {user_settings.symbol}")
                    continue
                
            except Exception as e:
                logger.error(f"Error in MarketMonitoringAgent for user {user.id}: {e}", exc_info=True)
                continue
            
            # Step 2: DecisionMakingAgent
            try:
                decision_integration = DecisionAgentIntegration(user)
                
                # Check completed trades count (for exploration mode)
                completed_trades_count = Trade.objects.filter(
                    user=user,
                    action="SELL",
                    pnl__isnull=False
                ).count()
                
                # Exploration mode: lower confidence threshold if few training data
                enable_exploration = completed_trades_count < 10  # Fewer than 10 completed trades
                exploration_confidence = 0.35 if enable_exploration else float(user_settings.confidence_threshold)
                
                decision_agent = DecisionMakingAgent(
                    model_type="random_forest" if user_settings.model_type == "Random Forest" else "gradient_boosting",
                    risk_tolerance=user_settings.risk_level,
                    min_confidence=exploration_confidence,  # Lower threshold in exploration mode
                    enable_ai=True,
                    use_historical_training=True,
                    training_ticker=user_settings.symbol,
                    training_period="1mo",
                    user_id=user.id  # For DB access during training
                )
                
                decision = decision_integration.make_decision(
                    symbol=symbol_obj,
                    market_data_obj=latest_data,
                    market_message=market_message,
                    decision_agent=decision_agent
                )
                
                total_decisions += 1
                decision_action = decision.decision
                
                if enable_exploration:
                    logger.info(f"Exploration mode: User {user.id}, Decision: {decision_action}, Confidence: {decision.confidence}%")
                
            except Exception as e:
                logger.error(f"Error in DecisionMakingAgent for user {user.id}: {e}", exc_info=True)
                continue
            
            # Step 3: ExecutionAgent (if not HOLD)
            if decision_action != "HOLD":
                try:
                    execution_integration = ExecutionAgentIntegration(user)
                    
                    execution_agent = ExecutionAgent(
                        execution_mode="simulated",
                        enable_slippage=True,
                        slippage_factor=0.001,
                        commission_rate=0.001,
                    )
                    
                    decision_dict = {
                        "action": decision_action,
                        "ticker": user_settings.symbol,
                        "quantity": decision.metadata.get("quantity", 1),
                        "price": decision.metadata.get("price", float(latest_data.price)),
                        "confidence": float(decision.confidence / 100) if decision.confidence else 0.5,
                        "timestamp": decision.created_at.isoformat(),
                        "reasoning": decision.reasoning,
                    }
                    
                    execution_result = execution_agent.receive_decision(decision_dict)
                    
                    if execution_result.get("status") == "executed":
                        trade = execution_integration.execute_trade(
                            symbol=symbol_obj,
                            decision_obj=decision,
                            execution_agent=execution_agent,
                            execution_result=execution_result
                        )
                        
                        if trade:
                            total_trades += 1
                            logger.info(f"Trade executed for user {user.id}: {trade.action} {trade.quantity} @ ${trade.price}")
                    
                except Exception as e:
                    logger.error(f"Error in ExecutionAgent for user {user.id}: {e}", exc_info=True)
                    continue
            
            total_processed += 1
            
        except Exception as e:
            logger.error(f"Error processing user {user.id} in AI agents workflow: {e}", exc_info=True)
            continue
    
    logger.info(f"AI agents workflow completed: {total_processed} users, {total_decisions} decisions, {total_trades} trades")
    return {
        "processed": total_processed,
        "decisions": total_decisions,
        "trades": total_trades
    }
