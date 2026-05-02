from django.conf import settings
from django.db import models


class Symbol(models.Model):
    """Tradable symbol tracked per user (equities, crypto, etc.)."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="symbols",
    )
    symbol = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["user", "symbol"]]
        ordering = ["symbol"]

    def __str__(self):
        return f"{self.symbol} ({self.user.email})"


class MarketData(models.Model):
    """Time-series market snapshot for a symbol."""
    symbol = models.ForeignKey(
        Symbol,
        on_delete=models.CASCADE,
        related_name="market_data",
    )
    price = models.DecimalField(max_digits=20, decimal_places=8)
    volume = models.BigIntegerField(null=True, blank=True)
    high = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    low = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    open_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    change = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    change_percent = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    timestamp = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["symbol", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.symbol.symbol} @ {self.price} ({self.timestamp})"


class TradingDecision(models.Model):
    """Decision produced by the decision-making agent."""
    DECISION_CHOICES = [
        ("BUY", "Buy"),
        ("SELL", "Sell"),
        ("HOLD", "Hold"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trading_decisions",
    )
    symbol = models.ForeignKey(
        Symbol,
        on_delete=models.CASCADE,
        related_name="decisions",
    )
    decision = models.CharField(max_length=10, choices=DECISION_CHOICES)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # 0-100%
    market_data = models.ForeignKey(
        MarketData,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="decisions",
    )
    reasoning = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["symbol", "-created_at"]),
        ]

    def __str__(self):
        return f"{self.symbol.symbol} - {self.decision} ({self.created_at})"


class AgentStatus(models.Model):
    """Runtime status row per user and agent type."""
    AGENT_TYPES = [
        ("MARKET_MONITOR", "Market Monitoring Agent"),
        ("DECISION_MAKER", "Decision-Making Agent"),
        ("EXECUTION", "Execution Agent"),
    ]

    STATUS_CHOICES = [
        ("RUNNING", "Running"),
        ("STOPPED", "Stopped"),
        ("ERROR", "Error"),
        ("IDLE", "Idle"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agent_statuses",
    )
    agent_type = models.CharField(max_length=20, choices=AGENT_TYPES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IDLE")
    last_activity = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [["user", "agent_type"]]
        ordering = ["agent_type"]

    def __str__(self):
        return f"{self.get_agent_type_display()} - {self.get_status_display()} ({self.user.email})"


class Account(models.Model):
    """Simulated cash / margin account for a user."""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="account",
    )
    balance = models.DecimalField(max_digits=20, decimal_places=2, default=10000.00)
    free_cash = models.DecimalField(max_digits=20, decimal_places=2, default=10000.00)
    used_margin = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)
    initial_balance = models.DecimalField(max_digits=20, decimal_places=2, default=10000.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Account for {self.user.email} - Balance: {self.balance}"

    def save(self, *args, **kwargs):
        if not self.pk:
            self.free_cash = self.balance
            self.initial_balance = self.balance
        super().save(*args, **kwargs)


class Position(models.Model):
    """Open position in the paper portfolio."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="positions",
    )
    symbol = models.ForeignKey(
        Symbol,
        on_delete=models.CASCADE,
        related_name="positions",
    )
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    entry_price = models.DecimalField(max_digits=20, decimal_places=8)
    current_price = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    opened_at = models.DateTimeField(auto_now_add=True, db_index=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    is_open = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["-opened_at"]
        indexes = [
            models.Index(fields=["user", "-opened_at"]),
            models.Index(fields=["user", "is_open"]),
        ]

    def __str__(self):
        return f"{self.symbol.symbol} - {self.quantity} @ {self.entry_price}"

    @property
    def pnl(self):
        """Unrealized P&L when open and priced."""
        if not self.current_price or not self.is_open:
            return None
        return (self.current_price - self.entry_price) * self.quantity

    @property
    def pnl_percent(self):
        """Unrealized return % when open and priced."""
        if not self.entry_price or not self.current_price or not self.is_open:
            return None
        return ((self.current_price - self.entry_price) / self.entry_price) * 100


class Trade(models.Model):
    """Executed (demo) trade record."""
    ACTION_CHOICES = [
        ("BUY", "Buy"),
        ("SELL", "Sell"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trades",
    )
    symbol = models.ForeignKey(
        Symbol,
        on_delete=models.CASCADE,
        related_name="trades",
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    price = models.DecimalField(max_digits=20, decimal_places=8)
    quantity = models.DecimalField(max_digits=20, decimal_places=8)
    agent_type = models.CharField(
        max_length=20,
        choices=AgentStatus.AGENT_TYPES,
        default="EXECUTION",
    )
    position = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="trades",
    )
    pnl = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    executed_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-executed_at"]
        indexes = [
            models.Index(fields=["user", "-executed_at"]),
            models.Index(fields=["symbol", "-executed_at"]),
        ]

    def __str__(self):
        return f"{self.action} {self.quantity} {self.symbol.symbol} @ {self.price} ({self.executed_at})"


class AgentLog(models.Model):
    """Structured log line for an agent."""
    LEVEL_CHOICES = [
        ("info", "Information"),
        ("warning", "Warning"),
        ("error", "Error"),
    ]

    agent_status = models.ForeignKey(
        AgentStatus,
        on_delete=models.CASCADE,
        related_name="logs",
    )
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="info")
    message = models.TextField()

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["agent_status", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.agent_status.get_agent_type_display()} - {self.level} - {self.message[:50]}"


class Message(models.Model):
    """Inter-agent message envelope."""
    MESSAGE_TYPES = [
        ("MARKET_SNAPSHOT", "Market Snapshot"),
        ("TRADE_DECISION", "Trade Decision"),
        ("EXECUTION_REPORT", "Execution Report"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="agent_messages",
    )
    from_agent = models.CharField(
        max_length=20,
        choices=AgentStatus.AGENT_TYPES,
        db_index=True,
    )
    to_agent = models.CharField(
        max_length=20,
        choices=AgentStatus.AGENT_TYPES,
        db_index=True,
    )
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, db_index=True)
    payload = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "-timestamp"]),
            models.Index(fields=["from_agent", "-timestamp"]),
            models.Index(fields=["to_agent", "-timestamp"]),
            models.Index(fields=["message_type", "-timestamp"]),
        ]

    def __str__(self):
        return f"{self.get_from_agent_display()} → {self.get_to_agent_display()} - {self.get_message_type_display()} ({self.timestamp})"


class UserSettings(models.Model):
    """User-facing simulation and model preferences."""
    STATUS_CHOICES = [
        ("running", "Running"),
        ("paused", "Paused"),
        ("stopped", "Stopped"),
    ]

    SPEED_CHOICES = [
        (0.5, "0.5x (Slower)"),
        (1.0, "1x (Normal)"),
        (2.0, "2x (Fast)"),
        (4.0, "4x (Very Fast)"),
    ]

    TIMEFRAME_CHOICES = [
        ("5m", "5 minutes"),
        ("15m", "15 minutes"),
        ("1h", "1 hour"),
        ("4h", "4 hours"),
        ("1d", "1 day"),
    ]

    RISK_LEVEL_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trading_settings",
    )

    # Simulation Controls
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="stopped")
    speed = models.FloatField(choices=SPEED_CHOICES, default=1.0)

    # Data Source Settings
    symbol = models.CharField(max_length=20, default="AAPL")
    timeframe = models.CharField(max_length=10, choices=TIMEFRAME_CHOICES, default="1h")
    data_provider = models.CharField(max_length=50, default="Yahoo Finance")
    history_length = models.CharField(max_length=50, default="Last 1 year")

    # Model Settings
    model_type = models.CharField(max_length=50, default="Random Forest")
    prediction_horizon = models.CharField(max_length=20, default="1 hour")
    confidence_threshold = models.DecimalField(max_digits=5, decimal_places=2, default=0.55)

    # Trading Preferences
    initial_balance = models.DecimalField(max_digits=20, decimal_places=2, default=10000.00)
    max_position_size = models.IntegerField(default=50)
    risk_level = models.CharField(max_length=10, choices=RISK_LEVEL_CHOICES, default="medium")
    stop_loss = models.DecimalField(max_digits=5, decimal_places=2, default=-2.0)
    take_profit = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    max_leverage = models.DecimalField(max_digits=5, decimal_places=2, default=1.0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"Settings for {self.user.email}"

