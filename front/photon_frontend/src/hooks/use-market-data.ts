import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

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

export function useMarketData(limit: number = 100) {
  const [data, setData] = useState<MarketDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const marketData = await apiClient.getMarketData(limit);

      const formattedData: MarketDataItem[] = (marketData || []).map((item) => ({
        id: item.id,
        symbol: item.symbol,
        price: item.price,
        volume: item.volume,
        timestamp: new Date(item.timestamp),
        source: item.source,
        additionalData: (item as any).additional_data,
      }));

      setData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [limit]);

  const refreshData = async () => {
    try {
      await apiClient.refreshMarketData();
      await fetchData();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to refresh market data');
    }
  };

  return { data, loading, error, refetch: fetchData, refreshData };
}

export function useLatestMarketData() {
  const [data, setData] = useState<LatestMarketDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getLatestMarketData();

      // API returns object with data field or array directly
      const latestData = Array.isArray(response) ? response : (response as any)?.data || [];

      const formattedData: LatestMarketDataItem[] = (latestData || []).map((item: any) => ({
        symbol: item.symbol,
        price: item.price,
        change: item.change || 0,
        changePercent: item.change_percent || item.changePercent || 0,
        volume: item.volume || 0,
        timestamp: new Date(item.timestamp),
      }));

      setData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load latest market data');
      console.error('Latest market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useMarketDataById(id: number) {
  const [data, setData] = useState<MarketDataItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const item = await apiClient.getMarketDataById(id);

      const formattedData: MarketDataItem = {
        id: item.id,
        symbol: item.symbol,
        price: item.price,
        volume: item.volume,
        timestamp: new Date(item.timestamp),
        source: item.source,
        additionalData: item.additional_data,
      };

      setData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data item');
      console.error('Market data by ID fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  return { data, loading, error, refetch: fetchData };
}





