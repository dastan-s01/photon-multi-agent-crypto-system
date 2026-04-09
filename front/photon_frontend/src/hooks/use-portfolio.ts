import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Position, Trade, PerformanceMetrics } from '@/types/trading';

interface PortfolioData {
  balance: number;
  freeCash: number;
  usedMargin: number;
  totalTrades: number;
  todayPnL: number;
  totalPnL: number;
  positions: Position[];
  trades: Trade[];
  equityCurve: Array<{
    date: string;
    balance: number;
  }>;
  initialBalance: number;
}

export function usePortfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [portfolio, positions, trades, equityCurve] = await Promise.all([
        apiClient.getPortfolio(),
        apiClient.getPositions(),
        apiClient.getTrades(50),
        apiClient.getEquityCurve(),
      ]);

      const formattedPositions: Position[] = (positions || []).map((pos) => ({
        id: String(pos.id || ''),
        symbol: pos.symbol || (pos as any).symbol_name || '',
        quantity: typeof pos.quantity === 'number' ? pos.quantity : parseFloat(String(pos.quantity)) || 0,
        entryPrice:
          typeof (pos as any).entryPrice === 'number'
            ? (pos as any).entryPrice
            : typeof (pos as any).entry_price === 'number'
              ? (pos as any).entry_price
              : parseFloat(String((pos as any).entryPrice || (pos as any).entry_price)) || 0,
        currentPrice:
          typeof (pos as any).currentPrice === 'number'
            ? (pos as any).currentPrice
            : typeof (pos as any).current_price === 'number'
              ? (pos as any).current_price
              : parseFloat(String((pos as any).currentPrice || (pos as any).current_price)) || 0,
        pnl:
          typeof pos.pnl === 'number'
            ? pos.pnl
            : typeof (pos as any).pnl === 'string'
              ? parseFloat((pos as any).pnl)
              : 0,
        pnlPercent:
          typeof (pos as any).pnlPercent === 'number'
            ? (pos as any).pnlPercent
            : typeof (pos as any).pnl_percent === 'number'
              ? (pos as any).pnl_percent
              : parseFloat(String((pos as any).pnlPercent || (pos as any).pnl_percent)) || 0,
      }));

      const formattedTrades: Trade[] = trades.map((trade) => {
        const agentMapping: Record<string, 'market' | 'decision' | 'execution'> = {
          'MARKET_MONITOR': 'market',
          'DECISION_MAKER': 'decision',
          'EXECUTION': 'execution',
        };
        const agentType = trade.agent 
          ? (agentMapping[trade.agent.toUpperCase()] || 'decision')
          : 'decision';
        
        const symbolName = trade.symbol_name || 
          (typeof trade.symbol === 'string' ? trade.symbol : '') ||
          '';
        
        return {
          id: String(trade.id),
          timestamp: new Date(trade.timestamp),
          action: trade.action,
          symbol: symbolName,
          price: trade.price || 0,
          quantity: trade.quantity || 0,
          agent: agentType,
          pnl: trade.pnl ?? undefined,
        };
      });

      setData({
        balance: portfolio.balance,
        freeCash: portfolio.freeCash,
        usedMargin: portfolio.usedMargin,
        totalTrades: portfolio.totalTrades,
        todayPnL: portfolio.todayPnL,
        totalPnL: portfolio.totalPnL,
        positions: formattedPositions,
        trades: formattedTrades,
        equityCurve: equityCurve.data,
        initialBalance: equityCurve.initialBalance,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function usePerformanceMetrics() {
  const [data, setData] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await apiClient.getPerformanceMetrics();
      
      setData({
        totalReturn: metrics.totalReturn,
        sharpeRatio: metrics.sharpeRatio,
        winRate: metrics.winRate,
        profitFactor: metrics.profitFactor,
        maxDrawdown: metrics.maxDrawdown,
        totalTrades: metrics.totalTrades,
        winningTrades: metrics.winningTrades,
        losingTrades: metrics.losingTrades,
        avgWin: metrics.averageWin,
        avgLoss: metrics.averageLoss,
        winLossRatio: metrics.averageWin / Math.abs(metrics.averageLoss),
        returnPercent: metrics.totalReturnPercent,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance metrics');
      console.error('Performance metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

