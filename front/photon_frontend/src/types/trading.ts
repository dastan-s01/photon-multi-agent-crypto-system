export type AgentType = 'market' | 'decision' | 'execution';

export type AgentStatus = 'active' | 'idle' | 'error';

export type TradeAction = 'BUY' | 'SELL' | 'HOLD';

export type MessageType = 'MARKET_SNAPSHOT' | 'TRADE_DECISION' | 'EXECUTION_REPORT';

export interface Agent {
  id: string;
  type: AgentType;
  name: string;
  status: AgentStatus;
  lastAction: string;
  lastUpdated: Date;
  messagesProcessed: number;
  logs: AgentLog[];
}

export interface AgentLog {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
}

export interface Message {
  id: string;
  timestamp: Date;
  from: AgentType;
  to: AgentType;
  type: MessageType;
  payload: MessagePayload;
}

export interface MessagePayload {
  ticker?: string;
  price?: number;
  volume?: number;
  sma?: number;
  rsi?: number;
  macd?: number;
  action?: TradeAction;
  quantity?: number;
  confidence?: number;
  rationale?: string;
  executed?: boolean;
  pnl?: number;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Trade {
  id: string;
  timestamp: Date;
  action: TradeAction;
  symbol: string;
  price: number;
  quantity: number;
  agent: AgentType;
  pnl?: number;
}

export interface Portfolio {
  balance: number;
  freeCash: number;
  usedMargin: number;
  totalTrades: number;
  todayPnL: number;
  totalPnL: number;
  positions: Position[];
  trades: Trade[];
}

export interface MarketData {
  timestamp: Date;
  symbol?: string;
  price: number;
  previousPrice?: number;
  volume: number;
  sma20: number;
  sma50: number;
  rsi: number;
  macd: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  sharpeRatio: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgWin: number;
  avgLoss: number;
  winLossRatio: number;
  returnPercent: number;
}

export interface SimulationSettings {
  status: 'running' | 'paused' | 'stopped';
  speed: 0.5 | 1 | 2 | 4;
  symbol: string;
  timeframe: '5m' | '15m' | '1h' | '4h' | '1d';
  dataProvider: string;
  historyLength: string;
  modelType: string;
  predictionHorizon: string;
  confidenceThreshold: number;
  initialBalance: number;
  maxPositionSize: number;
  riskLevel: 'low' | 'medium' | 'high';
  stopLoss: number;
  takeProfit: number;
  maxLeverage: number;
}

export interface ChartDataPoint {
  timestamp: Date;
  price: number;
  volume?: number;
}

export interface Decision {
  id: string;
  symbol: string;
  action: TradeAction;
  confidence: number;
  reasoning: string;
  createdAt: Date;
  executedAt?: Date;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
}

export interface DecisionStatistics {
  totalDecisions: number;
  successfulDecisions: number;
  failedDecisions: number;
  pendingDecisions: number;
  averageConfidence: number;
  winRate: number;
}

export interface MarketDataItem {
  id: number;
  symbol: string;
  price: number;
  volume: number;
  timestamp: Date;
  source: string;
  additionalData?: Record<string, any>;
}

export interface LatestMarketDataItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: Date;
}

