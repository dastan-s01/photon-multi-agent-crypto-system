import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Agent, Message, Trade, ChartDataPoint } from '@/types/trading';

interface DashboardData {
  balance: number;
  todayPnL: number;
  winRate: number;
  agentsStatus: string;
  agents: Agent[];
  messages: Message[];
  trades: Trade[];
  chartData: ChartDataPoint[];
  currentPrice: number;
  marketHeatmap: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
}

export function useDashboard(symbol?: string, timeframe?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        overview,
        agentsData,
        messagesData,
        tradesData,
        chartData,
        heatmapData,
      ] = await Promise.all([
        apiClient.getDashboardOverview(),
        apiClient.getAgentsDetail(),
        apiClient.getMessages(20),
        apiClient.getTrades(20),
        apiClient.getMarketChart(symbol, timeframe),
        apiClient.getMarketHeatmap(),
      ]);

      const agents: Agent[] = (agentsData || []).map((agent) => ({
        id: String(agent.id || ''),
        type: agent.type === 'market' ? 'market' : agent.type === 'decision' ? 'decision' : 'execution',
        name: agent.name || 'Unknown Agent',
        status: agent.status === 'active' ? 'active' : agent.status === 'error' ? 'error' : 'idle',
        lastAction: agent.lastAction || 'No action',
        lastUpdated: new Date(agent.lastUpdated || new Date()),
        messagesProcessed: agent.messagesProcessed || 0,
        logs: (agent.logs || []).map((log) => ({
          timestamp: new Date(log.timestamp || new Date()),
          level: (log.level || 'INFO').toLowerCase() as 'info' | 'warning' | 'error',
          message: log.message || '',
        })),
      }));

      const messages: Message[] = (messagesData || []).map((msg) => ({
        id: String(msg.id || ''),
        timestamp: new Date(msg.timestamp || new Date()),
        from: (msg.from || 'market') as 'market' | 'decision' | 'execution',
        to: (msg.to || 'market') as 'market' | 'decision' | 'execution',
        type: (msg.type || 'MARKET_SNAPSHOT') as 'MARKET_SNAPSHOT' | 'TRADE_DECISION' | 'EXECUTION_REPORT',
        payload: msg.payload || {},
      }));

      const trades: Trade[] = (tradesData || []).map((trade) => {
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
          id: String(trade.id || ''),
          timestamp: new Date(trade.timestamp || new Date()),
          action: trade.action || 'HOLD',
          symbol: symbolName,
          price: trade.price || 0,
          quantity: trade.quantity || 0,
          agent: agentType,
          pnl: trade.pnl ?? undefined,
        };
      });

      const chart: ChartDataPoint[] = chartData.data.map((point) => ({
        timestamp: new Date(point.timestamp),
        price: point.price,
        volume: point.volume,
      }));

      const heatmapArray = Array.isArray(heatmapData)
        ? heatmapData
        : (heatmapData as any)?.symbols || [];
      const normalizedHeatmap = heatmapArray.map((item: any) => ({
        symbol: item.symbol,
        price: item.price ?? 0,
        change:
          item.change ??
          (item.previousPrice !== undefined ? item.price - item.previousPrice : 0),
        changePercent: item.changePercent ?? 0,
        volume: item.volume ?? 0,
      }));

      setData({
        balance: overview.balance,
        todayPnL: overview.todayPnL,
        winRate: overview.winRate,
        agentsStatus: overview.agentsStatus,
        agents,
        messages,
        trades,
        chartData: chart,
        currentPrice: chartData.currentPrice,
        marketHeatmap: normalizedHeatmap,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  return { data, loading, error, refetch: fetchData };
}

