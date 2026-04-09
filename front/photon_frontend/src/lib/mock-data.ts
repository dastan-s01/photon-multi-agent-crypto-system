import type {
  Agent,
  Message,
  Portfolio,
  Position,
  Trade,
  MarketData,
  PerformanceMetrics,
  SimulationSettings,
  ChartDataPoint,
} from '@/types/trading';

function getMockData() {
  const now = typeof window !== 'undefined' ? new Date() : new Date('2024-01-01T00:00:00Z');
  
  const mockAgents: Agent[] = [
    {
      id: '1',
      type: 'market',
      name: 'Market Monitoring',
      status: 'active',
      lastAction: 'Fetched price data for AAPL',
      lastUpdated: new Date(now.getTime() - 5000),
      messagesProcessed: 24,
      logs: [
        {
          timestamp: new Date(now.getTime() - 5000),
          level: 'info',
          message: 'Fetched AAPL: $150.32',
        },
        {
          timestamp: new Date(now.getTime() - 5000),
          level: 'info',
          message: 'SMA20=149.15, RSI=65.2',
        },
      ],
    },
    {
      id: '2',
      type: 'decision',
      name: 'Decision Making',
      status: 'active',
      lastAction: 'Generated BUY signal',
      lastUpdated: new Date(now.getTime() - 4000),
      messagesProcessed: 18,
      logs: [
        {
          timestamp: new Date(now.getTime() - 4000),
          level: 'info',
          message: 'Model prediction: 72.1% confidence for BUY',
        },
      ],
    },
    {
      id: '3',
      type: 'execution',
      name: 'Execution',
      status: 'active',
      lastAction: 'Executed trade: BUY 100 @ $150.32',
      lastUpdated: new Date(now.getTime() - 3000),
      messagesProcessed: 12,
      logs: [
        {
          timestamp: new Date(now.getTime() - 3000),
          level: 'info',
          message: 'Trade executed: BUY 100 @ $150.32',
        },
      ],
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 10000),
      from: 'market',
      to: 'decision',
      type: 'MARKET_SNAPSHOT',
      payload: {
        ticker: 'AAPL',
        price: 150.32,
        volume: 1000000,
        sma: 149.15,
        rsi: 65.2,
        macd: 0.45,
      },
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 8000),
      from: 'decision',
      to: 'execution',
      type: 'TRADE_DECISION',
      payload: {
        action: 'BUY',
        quantity: 100,
        confidence: 0.721,
        rationale: 'Price above SMA, model gives 72.1% confidence for growth',
        price: 150.32,
      },
    },
    {
      id: '3',
      timestamp: new Date(now.getTime() - 6000),
      from: 'execution',
      to: 'market',
      type: 'EXECUTION_REPORT',
      payload: {
        executed: true,
        action: 'BUY',
        quantity: 100,
        price: 150.32,
        pnl: 5,
      },
    },
  ];

  const mockPositions: Position[] = [
    {
      id: '1',
      symbol: 'AAPL',
      quantity: 100,
      entryPrice: 148.0,
      currentPrice: 150.32,
      pnl: 232,
      pnlPercent: 1.57,
    },
    {
      id: '2',
      symbol: 'MSFT',
      quantity: 50,
      entryPrice: 320.0,
      currentPrice: 318.0,
      pnl: -100,
      pnlPercent: -0.63,
    },
  ];

  const mockTrades: Trade[] = [
    {
      id: '1',
      timestamp: new Date(now.getTime() - 6000),
      action: 'BUY',
      symbol: 'AAPL',
      price: 150.32,
      quantity: 100,
      agent: 'execution',
    },
    {
      id: '2',
      timestamp: new Date(now.getTime() - 3600000),
      action: 'SELL',
      symbol: 'AAPL',
      price: 149.5,
      quantity: 50,
      agent: 'execution',
      pnl: 45.0,
    },
  ];

  const mockPortfolio: Portfolio = {
    balance: 10245.5,
    freeCash: 5245.5,
    usedMargin: 5000,
    totalTrades: 45,
    todayPnL: 245.5,
    totalPnL: 2450.0,
    positions: mockPositions,
    trades: mockTrades,
  };

  // Market data for time series (used in charts)
  const mockMarketData: MarketData[] = Array.from({ length: 100 }, (_, i) => {
    const timestamp = new Date(now.getTime() - (100 - i) * 60000);
    const basePrice = 150.0;
    const variation = Math.sin(i / 10) * 2 + Math.random() * 0.5;
    const price = basePrice + variation;
    const previousPrice = i > 0 ? basePrice + Math.sin((i - 1) / 10) * 2 + Math.random() * 0.5 : price;
    return {
      timestamp,
      symbol: 'AAPL',
      price,
      previousPrice,
      volume: 1000000 + Math.random() * 500000,
      sma20: basePrice - 0.5 + Math.sin(i / 15) * 1,
      sma50: basePrice - 1 + Math.sin(i / 20) * 1.5,
      rsi: 50 + Math.sin(i / 8) * 20,
      macd: Math.sin(i / 12) * 0.5,
    };
  });

  const mockChartData: ChartDataPoint[] = mockMarketData.map((data) => ({
    timestamp: data.timestamp,
    price: data.price,
    volume: data.volume,
  }));

  // Market data for heatmap (different symbols)
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
  const mockMarketHeatmapData: MarketData[] = symbols.map((symbol, index) => {
    const basePrice = 100 + index * 50 + Math.random() * 20;
    const price = basePrice + (Math.random() - 0.5) * 10;
    const previousPrice = basePrice + (Math.random() - 0.5) * 10;
    return {
      timestamp: now,
      symbol,
      price,
      previousPrice,
      volume: 1000000 + Math.random() * 2000000,
      sma20: basePrice - 2,
      sma50: basePrice - 5,
      rsi: 40 + Math.random() * 40,
      macd: (Math.random() - 0.5) * 2,
    };
  });

  const mockPerformanceMetrics: PerformanceMetrics = {
    totalReturn: 2450.0,
    sharpeRatio: 1.24,
    winRate: 68.5,
    profitFactor: 2.45,
    maxDrawdown: -1250.0,
    totalTrades: 45,
    winningTrades: 31,
    losingTrades: 14,
    avgWin: 245.5,
    avgLoss: -125.3,
    winLossRatio: 1.96,
    returnPercent: 24.5,
  };

  const mockSimulationSettings: SimulationSettings = {
    status: 'paused',
    speed: 1,
    symbol: 'AAPL',
    timeframe: '1h',
    dataProvider: 'Yahoo Finance',
    historyLength: 'Last 1 year',
    modelType: 'Random Forest',
    predictionHorizon: '1 hour',
    confidenceThreshold: 0.55,
    initialBalance: 10000,
    maxPositionSize: 50,
    riskLevel: 'medium',
    stopLoss: -2,
    takeProfit: 5,
    maxLeverage: 1.0,
  };

  return {
    mockAgents,
    mockMessages,
    mockPositions,
    mockTrades,
    mockPortfolio,
    mockMarketData,
    mockChartData,
    mockMarketHeatmapData,
    mockPerformanceMetrics,
    mockSimulationSettings,
  };
}

const mockData = getMockData();

export const mockAgents = mockData.mockAgents;
export const mockMessages = mockData.mockMessages;
export const mockPositions = mockData.mockPositions;
export const mockTrades = mockData.mockTrades;
export const mockPortfolio = mockData.mockPortfolio;
export const mockMarketData = mockData.mockMarketData;
export const mockChartData = mockData.mockChartData;
export const mockMarketHeatmapData = mockData.mockMarketHeatmapData;
export const mockPerformanceMetrics = mockData.mockPerformanceMetrics;
export const mockSimulationSettings = mockData.mockSimulationSettings;
