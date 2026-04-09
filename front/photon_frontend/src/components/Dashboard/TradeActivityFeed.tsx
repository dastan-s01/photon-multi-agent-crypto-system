'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Trade } from '@/types/trading';
import { cn } from '@/lib/utils';

interface TradeActivityFeedProps {
  trades: Trade[];
}

export function TradeActivityFeed({ trades }: TradeActivityFeedProps) {
  const recentTrades = trades.slice(0, 10);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <Card className="card-glass">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Real-Time Trade Activity</span>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {recentTrades.map((trade) => {
              const isBuy = trade.action === 'BUY';
              const isProfit = (trade.pnl ?? 0) > 0;
              const hasPnl = trade.pnl !== undefined && trade.pnl !== null;

              return (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      isBuy ? "bg-[var(--dashboard-profit)]/20" : "bg-[var(--dashboard-loss)]/20"
                    )}>
                      {isBuy ? (
                        <ArrowUpRight className="h-4 w-4 text-[var(--dashboard-profit)]" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-[var(--dashboard-loss)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{trade.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {trade.action}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span>{trade.quantity} @ {formatCurrency(trade.price)}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(trade.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {hasPnl && (
                    <div className="text-right">
                      <div className={cn(
                        "font-semibold text-sm",
                        isProfit ? "text-[var(--dashboard-profit)]" : "text-[var(--dashboard-loss)]"
                      )}>
                        {isProfit ? '+' : ''}{formatCurrency(trade.pnl!)}
                      </div>
                      <div className={cn(
                        "text-xs",
                        isProfit ? "text-[var(--dashboard-profit)]/70" : "text-[var(--dashboard-loss)]/70"
                      )}>
                        {((trade.pnl! / trade.price) * 100).toFixed(2)}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

