'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMultiTickerWS } from '@/hooks/use-multi-ticker-ws';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TopGainersLosersProps {
  symbols: string[];
  limit?: number;
}

export function TopGainersLosers({ symbols, limit = 10 }: TopGainersLosersProps) {
  const { data, isConnected } = useMultiTickerWS(symbols);

  const { gainers, losers } = useMemo(() => {
    const tickers = Array.from(data.values());
    
    const sorted = [...tickers].sort((a, b) => b.priceChangePercent24h - a.priceChangePercent24h);
    
    const gainers = sorted
      .filter(t => t.priceChangePercent24h > 0)
      .slice(0, limit);
    
    const losers = sorted
      .filter(t => t.priceChangePercent24h < 0)
      .sort((a, b) => a.priceChangePercent24h - b.priceChangePercent24h)
      .slice(0, limit);

    return { gainers, losers };
  }, [data, limit]);

  const formatSymbol = (symbol: string) => {
    return symbol.replace('USDT', '/USDT');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-white">Top Gainers / Losers</CardTitle>
        {!isConnected && (
          <p className="text-xs text-yellow-400 mt-1">Disconnected</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Top Gainers</h3>
          </div>
          {gainers.length > 0 ? (
            <div className="space-y-2">
              {gainers.map((ticker, idx) => (
                <div
                  key={ticker.symbol}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-6">#{idx + 1}</span>
                    <span className="text-sm font-medium text-white">{formatSymbol(ticker.symbol)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white/70">{formatPrice(ticker.price)}</span>
                    <span className="text-sm font-semibold text-green-400">
                      {formatPercent(ticker.priceChangePercent24h)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50 py-4">No gainers available</p>
          )}
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Top Losers</h3>
          </div>
          {losers.length > 0 ? (
            <div className="space-y-2">
              {losers.map((ticker, idx) => (
                <div
                  key={ticker.symbol}
                  className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50 w-6">#{idx + 1}</span>
                    <span className="text-sm font-medium text-white">{formatSymbol(ticker.symbol)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white/70">{formatPrice(ticker.price)}</span>
                    <span className="text-sm font-semibold text-red-400">
                      {formatPercent(ticker.priceChangePercent24h)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50 py-4">No losers available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
