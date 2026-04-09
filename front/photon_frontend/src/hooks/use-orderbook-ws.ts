'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdateId: number;
}

export function useOrderbookWS(symbol: string = 'btcusdt', depth: number = 20) {
  const [data, setData] = useState<OrderBookData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const orderBookRef = useRef<OrderBookData | null>(null);
  const symbolRef = useRef(symbol);
  const isMountedRef = useRef(true);
  const snapshotRef = useRef<number | null>(null);

  useEffect(() => {
    symbolRef.current = symbol;
    return () => {
      isMountedRef.current = false;
    };
  }, [symbol]);

  const fetchSnapshot = useCallback(async (currentSymbol: string) => {
    try {
      setIsLoading(true);
      const symbolUpper = currentSymbol.toUpperCase();
      const response = await fetch(
        `https://api.binance.com/api/v3/depth?symbol=${symbolUpper}&limit=${depth}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch order book snapshot');
      }

      const snapshot = await response.json();
      
      if (symbolRef.current !== currentSymbol || !isMountedRef.current) {
        return;
      }

      const bids: OrderBookEntry[] = (snapshot.bids || []).map((bid: [string, string]) => ({
        price: parseFloat(bid[0]),
        quantity: parseFloat(bid[1]),
        total: 0,
      })).sort((a: OrderBookEntry, b: OrderBookEntry) => b.price - a.price);

      const asks: OrderBookEntry[] = (snapshot.asks || []).map((ask: [string, string]) => ({
        price: parseFloat(ask[0]),
        quantity: parseFloat(ask[1]),
        total: 0,
      })).sort((a: OrderBookEntry, b: OrderBookEntry) => a.price - b.price);

      let bidTotal = 0;
      const bidsWithTotal = bids.slice(0, depth).map((bid) => {
        bidTotal += bid.quantity;
        return { ...bid, total: bidTotal };
      });

      let askTotal = 0;
      const asksWithTotal = asks.slice(0, depth).map((ask) => {
        askTotal += ask.quantity;
        return { ...ask, total: askTotal };
      });

      const initial = {
        bids: bidsWithTotal,
        asks: asksWithTotal,
        lastUpdateId: snapshot.lastUpdateId,
      };

      orderBookRef.current = initial;
      snapshotRef.current = snapshot.lastUpdateId;
      setData(initial);
      setIsLoading(false);
    } catch (err) {
      if (symbolRef.current === currentSymbol && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch snapshot');
        setIsLoading(false);
      }
    }
  }, [depth]);

  const processOrderBookUpdate = useCallback((update: any) => {
    if (!orderBookRef.current || !snapshotRef.current) return;

    // Ignore updates older than snapshot
    if (update.u <= snapshotRef.current) {
      return;
    }

    // Apply update if it's newer than snapshot
    // update.U is first update ID, update.u is last update ID
    if (update.u > snapshotRef.current) {
      const newBids = [...orderBookRef.current.bids];
      const newAsks = [...orderBookRef.current.asks];

      if (update.b && Array.isArray(update.b)) {
        update.b.forEach((bid: [string, string]) => {
          const price = parseFloat(bid[0]);
          const quantity = parseFloat(bid[1]);
          const index = newBids.findIndex((b) => Math.abs(b.price - price) < 0.00001);
          
          if (quantity === 0) {
            if (index !== -1) {
              newBids.splice(index, 1);
            }
          } else {
            if (index !== -1) {
              newBids[index] = { price, quantity, total: 0 };
            } else {
              newBids.push({ price, quantity, total: 0 });
            }
          }
        });
      }

      if (update.a && Array.isArray(update.a)) {
        update.a.forEach((ask: [string, string]) => {
          const price = parseFloat(ask[0]);
          const quantity = parseFloat(ask[1]);
          const index = newAsks.findIndex((a) => Math.abs(a.price - price) < 0.00001);
          
          if (quantity === 0) {
            if (index !== -1) {
              newAsks.splice(index, 1);
            }
          } else {
            if (index !== -1) {
              newAsks[index] = { price, quantity, total: 0 };
            } else {
              newAsks.push({ price, quantity, total: 0 });
            }
          }
        });
      }

      newBids.sort((a, b) => b.price - a.price);
      newAsks.sort((a, b) => a.price - b.price);

      let bidTotal = 0;
      const bidsWithTotal = newBids.slice(0, depth).map((bid) => {
        bidTotal += bid.quantity;
        return { ...bid, total: bidTotal };
      });

      let askTotal = 0;
      const asksWithTotal = newAsks.slice(0, depth).map((ask) => {
        askTotal += ask.quantity;
        return { ...ask, total: askTotal };
      });

      const updated = {
        bids: bidsWithTotal,
        asks: asksWithTotal,
        lastUpdateId: update.u || orderBookRef.current.lastUpdateId,
      };

      orderBookRef.current = updated;
      setData(updated);
    }
  }, [depth]);

  const connect = useCallback(() => {
    const currentSymbol = symbolRef.current;
    
    if (!isMountedRef.current || currentSymbol !== symbolRef.current) {
      return;
    }
    
    try {
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${currentSymbol}@depth20@100ms`);
      
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
          
          if (message.e === 'depthUpdate' && symbolRef.current === currentSymbol) {
            processOrderBookUpdate(message);
          }
        } catch (err) {
          console.error('Error parsing orderbook message:', err);
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
  }, [processOrderBookUpdate]);

  useEffect(() => {
    setData(null);
    setIsConnected(false);
    setError(null);
    setIsLoading(true);
    orderBookRef.current = null;
    snapshotRef.current = null;
    reconnectAttempts.current = 0;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // First fetch snapshot, then connect WebSocket
    (async () => {
      try {
        await fetchSnapshot(symbol);
        if (symbolRef.current === symbol && isMountedRef.current && orderBookRef.current) {
          connect();
        }
      } catch (err) {
        console.error('Failed to initialize order book:', err);
      }
    })();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      orderBookRef.current = null;
      snapshotRef.current = null;
    };
  }, [symbol, fetchSnapshot, connect]);

  return { data, isConnected, error, isLoading };
}

