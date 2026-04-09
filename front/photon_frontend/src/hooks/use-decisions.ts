import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Decision } from '@/types/trading';

export function useDecisions(limit: number = 50) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      setError(null);
      const decisionsData = await apiClient.getDecisions(limit);

      const formattedDecisions: Decision[] = (decisionsData || []).map((decision) => ({
        id: String(decision.id || ''),
        symbol: decision.symbol || '',
        action: decision.action || 'HOLD',
        confidence: decision.confidence || 0,
        reasoning: decision.reasoning || '',
        createdAt: new Date(decision.created_at || new Date()),
        executedAt: decision.executed_at ? new Date(decision.executed_at) : undefined,
        status: (decision.status as 'pending' | 'executed' | 'cancelled' | 'failed') || 'pending',
      }));

      setDecisions(formattedDecisions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decisions');
      console.error('Decisions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecisions();
    const interval = setInterval(fetchDecisions, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const createDecision = async (decisionData: {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence?: number;
    reasoning?: string;
  }) => {
    try {
      const newDecision = await apiClient.createDecision(decisionData);
      await fetchDecisions();
      return newDecision;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create decision');
    }
  };

  const updateDecision = async (id: number, updates: Partial<{
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string;
    status: string;
  }>) => {
    try {
      await apiClient.updateDecision(id, updates);
      await fetchDecisions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update decision');
    }
  };

  const deleteDecision = async (id: number) => {
    try {
      await apiClient.deleteDecision(id);
      await fetchDecisions();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete decision');
    }
  };

  return {
    decisions,
    loading,
    error,
    refetch: fetchDecisions,
    createDecision,
    updateDecision,
    deleteDecision,
  };
}

export function useDecisionsStatistics() {
  const [data, setData] = useState<{
    totalDecisions: number;
    successfulDecisions: number;
    failedDecisions: number;
    pendingDecisions: number;
    averageConfidence: number;
    winRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await apiClient.getDecisionsStatistics();

      setData({
        totalDecisions: stats.total_decisions,
        successfulDecisions: stats.successful_decisions,
        failedDecisions: stats.failed_decisions,
        pendingDecisions: stats.pending_decisions,
        averageConfidence: stats.average_confidence,
        winRate: stats.win_rate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decisions statistics');
      console.error('Decisions statistics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
}





