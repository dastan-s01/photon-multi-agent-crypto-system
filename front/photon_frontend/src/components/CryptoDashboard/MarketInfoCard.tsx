'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePriceWS } from '@/hooks/use-price-ws';
import { cn } from '@/lib/utils';

interface MarketInfoCardProps {
  symbol?: string;
}

export function MarketInfoCard({ symbol = 'btcusdt' }: MarketInfoCardProps) {
  const { data, isConnected } = usePriceWS(symbol);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);

  useEffect(() => {
    if (data && prevPrice !== null) {
      if (data.price > prevPrice) {
        setPriceDirection('up');
      } else if (data.price < prevPrice) {
        setPriceDirection('down');
      }
      setTimeout(() => setPriceDirection(null), 1000);
    }
    if (data) {
      setPrevPrice(data.price);
    }
  }, [data, prevPrice]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return `$${volume.toFixed(2)}`;
  };

  if (!data) {
    return (
      <Card className="dashboard-card flex flex-col h-full max-h-[400px]">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-white">Market Info</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-white/50">Loading market data...</p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.priceChangePercent24h >= 0;

  const formatSymbol = (sym: string) => {
    return sym.toUpperCase().replace('USDT', ' - USDT');
  };

  return (
    <Card className="dashboard-card flex flex-col h-full max-h-[400px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-white">Market: {formatSymbol(symbol)}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div>
          <p className="text-sm text-white/50 mb-1">Last Price</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-2xl font-bold transition-colors duration-300',
                priceDirection === 'up' && 'text-green-400',
                priceDirection === 'down' && 'text-red-400',
                !priceDirection && 'text-white'
              )}
            >
              {formatPrice(data.price)}
            </p>
            {!isConnected && (
              <span className="text-xs text-yellow-400">Disconnected</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/50 mb-1">24h High</p>
            <p className="text-sm font-semibold text-white">{formatPrice(data.high24h)}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-1">24h Low</p>
            <p className="text-sm font-semibold text-white">{formatPrice(data.low24h)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-white/50 mb-1">24h Change</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                'text-lg font-semibold',
                isPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              {isPositive ? '+' : ''}
              {data.priceChangePercent24h.toFixed(2)}%
            </p>
            <p className="text-sm text-white/70">
              ({isPositive ? '+' : ''}
              {formatPrice(data.priceChange24h)})
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-white/50 mb-1">24h Volume (USDT)</p>
          <p className="text-sm font-semibold text-white">{formatVolume(data.volume24h)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
