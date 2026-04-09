'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface TickerData {
  symbol: string;
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  lastUpdate: number;
}

export function useMultiTickerWS(symbols: string[]) {
  const [data, setData] = useState<Map<string, TickerData>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const dataRef = useRef<Map<string, TickerData>>(new Map());

  const connect = useCallback(() => {
    if (symbols.length === 0) return;

    try {
      const streams = symbols.map(s => `${s.toLowerCase()}@ticker`).join('/');
      const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.data && message.stream) {
            const symbol = message.data.s;
            const tickerData: TickerData = {
              symbol: symbol,
              price: parseFloat(message.data.c),
              priceChange24h: parseFloat(message.data.p),
              priceChangePercent24h: parseFloat(message.data.P),
              high24h: parseFloat(message.data.h),
              low24h: parseFloat(message.data.l),
              volume24h: parseFloat(message.data.v),
              lastUpdate: message.data.E,
            };

            dataRef.current.set(symbol, tickerData);
            setData(new Map(dataRef.current));
          }
        } catch (err) {
          console.error('Error parsing ticker message:', err);
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
      setIsConnected(false);
    }
  }, [symbols]);

  useEffect(() => {
    if (symbols.length === 0) return;

    dataRef.current.clear();
    setData(new Map());
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      dataRef.current.clear();
    };
  }, [connect]);

  return { data, isConnected, error };
}
