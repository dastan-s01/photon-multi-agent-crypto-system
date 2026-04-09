'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function useKlinesWS(symbol: string = 'BTCUSDT', interval: string = '1m') {
  const [initialData, setInitialData] = useState<KlineData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const klinesRef = useRef<KlineData[]>([]);
  const symbolRef = useRef(symbol);
  const intervalRef = useRef(interval);
  const isMountedRef = useRef(true);

  useEffect(() => {
    symbolRef.current = symbol;
    intervalRef.current = interval;
    return () => {
      isMountedRef.current = false;
    };
  }, [symbol, interval]);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch initial klines data');
      }

      const data = await response.json();
      const formatted: KlineData[] = data.map((kline: any[]) => ({
        time: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
      }));

      klinesRef.current = formatted;
      setInitialData(formatted);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch initial data');
      setIsLoading(false);
    }
  }, [symbol, interval]);

  const connect = useCallback(() => {
    const currentSymbol = symbolRef.current;
    const currentInterval = intervalRef.current;
    
    if (!isMountedRef.current || currentSymbol !== symbolRef.current || currentInterval !== intervalRef.current) {
      return;
    }
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      const streamSymbol = currentSymbol.toLowerCase();
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@kline_${currentInterval}`);
      
      ws.onopen = () => {
        if (symbolRef.current === currentSymbol && intervalRef.current === currentInterval && isMountedRef.current) {
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        } else {
          ws.close();
        }
      };

      ws.onmessage = (event) => {
        if (symbolRef.current !== currentSymbol || intervalRef.current !== currentInterval || !isMountedRef.current) {
          ws.close();
          return;
        }
        
        try {
          const message = JSON.parse(event.data);
          
          if (message.k && symbolRef.current === currentSymbol) {
            const kline = message.k;
            const newKline: KlineData = {
              time: kline.t,
              open: parseFloat(kline.o),
              high: parseFloat(kline.h),
              low: parseFloat(kline.l),
              close: parseFloat(kline.c),
              volume: parseFloat(kline.v),
            };

            const current = [...klinesRef.current];
            const existingIndex = current.findIndex((k) => k.time === newKline.time);

            if (existingIndex !== -1) {
              current[existingIndex] = newKline;
            } else {
              current.push(newKline);
              if (current.length > 500) {
                current.shift();
              }
            }

            klinesRef.current = current;
            if (symbolRef.current === currentSymbol && isMountedRef.current) {
              setInitialData([...current]);
            }
          }
        } catch (err) {
          console.error('Error parsing kline message:', err);
        }
      };

      ws.onerror = () => {
        if (symbolRef.current === currentSymbol && intervalRef.current === currentInterval && isMountedRef.current) {
          setError('WebSocket connection error');
          setIsConnected(false);
        }
      };

      ws.onclose = () => {
        if (symbolRef.current === currentSymbol && intervalRef.current === currentInterval && isMountedRef.current) {
          setIsConnected(false);
          
          if (reconnectAttempts.current < maxReconnectAttempts && symbolRef.current === currentSymbol) {
            reconnectAttempts.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (symbolRef.current === currentSymbol && intervalRef.current === currentInterval && isMountedRef.current) {
                connect();
              }
            }, delay);
          } else if (symbolRef.current !== currentSymbol || intervalRef.current !== currentInterval) {
            setError(null);
          } else {
            setError('Failed to reconnect after multiple attempts');
          }
        }
      };

      wsRef.current = ws;
    } catch (err) {
      if (symbolRef.current === currentSymbol && intervalRef.current === currentInterval && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
        setIsConnected(false);
      }
    }
  }, []);

  useEffect(() => {
    setInitialData([]);
    setIsLoading(true);
    setIsConnected(false);
    setError(null);
    klinesRef.current = [];
    reconnectAttempts.current = 0;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    fetchInitialData().then(() => {
      connect();
    });

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      klinesRef.current = [];
    };
  }, [symbol, interval, fetchInitialData, connect]);

  return { data: initialData, isLoading, isConnected, error };
}
