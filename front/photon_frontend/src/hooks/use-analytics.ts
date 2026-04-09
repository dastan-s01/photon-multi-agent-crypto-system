import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { PerformanceMetrics } from '@/types/trading';

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
        winLossRatio: metrics.averageWin / Math.abs(metrics.averageLoss || 1),
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

export function usePnLCurve() {
  const [data, setData] = useState<Array<{ date: string; pnl: number }>>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getPnLCurve();
      setData(result.data || []);
      setInitialBalance(result.initialBalance ?? 0);
      setCurrentBalance(result.currentBalance ?? 0);
      setTotalPnL(result.totalPnL ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load P&L curve');
      console.error('P&L curve fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, totalPnL, initialBalance, currentBalance, loading, error, refetch: fetchData };
}

export function useMonthlyBreakdown() {
  const [data, setData] = useState<{
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    monthly: Array<{ month: string; pnl: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiClient.getMonthlyBreakdown();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load monthly breakdown');
      console.error('Monthly breakdown fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

