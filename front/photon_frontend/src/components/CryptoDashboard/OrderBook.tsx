'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrderbookWS } from '@/hooks/use-orderbook-ws';
import { cn } from '@/lib/utils';

interface OrderBookProps {
  symbol?: string;
  depth?: number;
}

export function OrderBook({ symbol = 'btcusdt', depth = 15 }: OrderBookProps) {
  const { data, isConnected } = useOrderbookWS(symbol, depth);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatQuantity = (qty: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 4,
      maximumFractionDigits: 8,
    }).format(qty);
  };

  const formatTotal = (total: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);
  };

  if (!data) {
    return (
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="text-white">Order Book</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-white/50">Loading order book...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxTotal = Math.max(
    ...data.bids.map((b) => b.total),
    ...data.asks.map((a) => a.total)
  );

  return (
    <Card className="dashboard-card flex flex-col h-full max-h-[400px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-white">Order Book</CardTitle>
        {!isConnected && (
          <p className="text-xs text-yellow-400 mt-1">Disconnected</p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex flex-col h-full space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs text-white/50 pb-2 border-b border-white/10 flex-shrink-0">
            <div>Price (USDT)</div>
            <div className="text-right">Amount (BTC)</div>
            <div className="text-right">Total (USDT)</div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-2">
            <div className="space-y-0.5 flex-1 overflow-y-auto min-h-0">
              {data.asks
                .slice()
                .reverse()
                .map((ask, index) => (
                  <div
                    key={`ask-${ask.price}-${index}`}
                    className="grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded hover:bg-white/5 transition-colors"
                    style={{
                      background: `linear-gradient(to right, rgba(239, 68, 68, ${ask.total / maxTotal * 0.3}), transparent)`,
                    }}
                  >
                    <div className="text-red-400 font-medium">{formatPrice(ask.price)}</div>
                    <div className="text-right text-white/70">{formatQuantity(ask.quantity)}</div>
                    <div className="text-right text-white/70">{formatTotal(ask.total)}</div>
                  </div>
                ))}
            </div>

            <div className="border-t border-b border-white/20 py-2 flex-shrink-0">
              <div className="text-center text-sm font-semibold text-white">
                {data.bids[0] && data.asks[0] && (
                  <>
                    Spread: {formatPrice(data.asks[0].price - data.bids[0].price)} (
                    {((data.asks[0].price - data.bids[0].price) / data.bids[0].price * 100).toFixed(4)}%)
                  </>
                )}
              </div>
            </div>

            <div className="space-y-0.5 flex-1 overflow-y-auto min-h-0">
              {data.bids.map((bid, index) => (
                <div
                  key={`bid-${bid.price}-${index}`}
                  className="grid grid-cols-3 gap-2 text-xs py-1 px-2 rounded hover:bg-white/5 transition-colors"
                  style={{
                    background: `linear-gradient(to right, rgba(34, 197, 94, ${bid.total / maxTotal * 0.3}), transparent)`,
                  }}
                >
                  <div className="text-green-400 font-medium">{formatPrice(bid.price)}</div>
                  <div className="text-right text-white/70">{formatQuantity(bid.quantity)}</div>
                  <div className="text-right text-white/70">{formatTotal(bid.total)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
