import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import type { SimulationSettings } from '@/types/trading';

export function useSettings() {
  const [settings, setSettings] = useState<SimulationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSettings();

      setSettings({
        status: data.status as 'running' | 'paused' | 'stopped',
        speed: parseFloat(data.speed) as 0.5 | 1 | 2 | 4,
        symbol: data.symbol,
        timeframe: data.timeframe as '5m' | '15m' | '1h' | '4h' | '1d',
        dataProvider: data.dataProvider,
        historyLength: data.historyLength,
        modelType: data.modelType,
        predictionHorizon: data.predictionHorizon,
        confidenceThreshold: parseFloat(data.confidenceThreshold),
        initialBalance: parseFloat(data.initialBalance),
        maxPositionSize: parseFloat(data.maxPositionSize),
        riskLevel: data.riskLevel as 'low' | 'medium' | 'high',
        stopLoss: parseFloat(data.stopLoss),
        takeProfit: parseFloat(data.takeProfit),
        maxLeverage: parseFloat(data.maxLeverage),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
      console.error('Settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<SimulationSettings>) => {
    try {
      setError(null);
      const updateData: Record<string, string> = {};
      
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.speed !== undefined) updateData.speed = String(updates.speed);
      if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
      if (updates.timeframe !== undefined) updateData.timeframe = updates.timeframe;
      if (updates.dataProvider !== undefined) updateData.dataProvider = updates.dataProvider;
      if (updates.historyLength !== undefined) updateData.historyLength = updates.historyLength;
      if (updates.modelType !== undefined) updateData.modelType = updates.modelType;
      if (updates.predictionHorizon !== undefined) updateData.predictionHorizon = updates.predictionHorizon;
      if (updates.confidenceThreshold !== undefined) updateData.confidenceThreshold = String(updates.confidenceThreshold);
      if (updates.initialBalance !== undefined) updateData.initialBalance = String(updates.initialBalance);
      if (updates.maxPositionSize !== undefined) updateData.maxPositionSize = String(updates.maxPositionSize);
      if (updates.riskLevel !== undefined) updateData.riskLevel = updates.riskLevel;
      if (updates.stopLoss !== undefined) updateData.stopLoss = String(updates.stopLoss);
      if (updates.takeProfit !== undefined) updateData.takeProfit = String(updates.takeProfit);
      if (updates.maxLeverage !== undefined) updateData.maxLeverage = String(updates.maxLeverage);

      await apiClient.updateSettings(updateData);
      await fetchSettings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}

