'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface TickerData {
  price: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  lastUpdate: number;
}

export function usePriceWS(symbol: string = 'btcusdt') {
  const [data, setData] = useState<TickerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const symbolRef = useRef(symbol);
  const isMountedRef = useRef(true);

  useEffect(() => {
    symbolRef.current = symbol;
    return () => {
      isMountedRef.current = false;
    };
  }, [symbol]);

  const connect = useCallback(() => {
    const currentSymbol = symbolRef.current;
    
    if (!isMountedRef.current || currentSymbol !== symbolRef.current) {
      return;
    }
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${currentSymbol}@ticker`);
      
      ws.onopen = () => {
        if (symbolRef.current === currentSymbol && isMountedRef.current) {
          setIsConnected(true);
          setError(null);
          reconnectAttempts.current = 0;
        } else {
          ws.close();
        }
      };

      ws.onmessage = (event) => {
        if (symbolRef.current !== currentSymbol || !isMountedRef.current) {
          ws.close();
          return;
        }
        
        try {
          const message = JSON.parse(event.data);
          
          if (symbolRef.current === currentSymbol && isMountedRef.current) {
            setData({
              price: parseFloat(message.c),
              high24h: parseFloat(message.h),
              low24h: parseFloat(message.l),
              volume24h: parseFloat(message.v),
              priceChange24h: parseFloat(message.p),
              priceChangePercent24h: parseFloat(message.P),
              lastUpdate: message.E,
            });
          }
        } catch (err) {
          console.error('Error parsing ticker message:', err);
        }
      };

      ws.onerror = () => {
        if (symbolRef.current === currentSymbol && isMountedRef.current) {
          setError('WebSocket connection error');
          setIsConnected(false);
        }
      };

      ws.onclose = () => {
        if (symbolRef.current === currentSymbol && isMountedRef.current) {
          setIsConnected(false);
          
          if (reconnectAttempts.current < maxReconnectAttempts && symbolRef.current === currentSymbol) {
            reconnectAttempts.current += 1;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (symbolRef.current === currentSymbol && isMountedRef.current) {
                connect();
              }
            }, delay);
          } else if (symbolRef.current !== currentSymbol) {
            setError(null);
          } else {
            setError('Failed to reconnect after multiple attempts');
          }
        }
      };

      wsRef.current = ws;
    } catch (err) {
      if (symbolRef.current === currentSymbol && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to create WebSocket connection');
        setIsConnected(false);
      }
    }
  }, []);

  useEffect(() => {
    setData(null);
    setIsConnected(false);
    setError(null);
    reconnectAttempts.current = 0;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [symbol, connect]);

  return { data, isConnected, error };
}
