'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface PortfolioSummaryProps {
  balance: number;
  freeCash: number;
  usedMargin: number;
  totalTrades: number;
  todayPnL: number;
  totalPnL: number;
}

export function PortfolioSummary({
  balance,
  freeCash,
  usedMargin,
  totalTrades,
  todayPnL,
  totalPnL,
}: PortfolioSummaryProps) {
  const initialBalance = 10000;
  const balanceChange = balance - initialBalance;
  const balanceChangePercent = (balanceChange / initialBalance) * 100;

  return (
    <Card className="card-glass hover-lift">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Balance</p>
            <p className="text-xl font-bold tracking-tight">{formatCurrency(balance)}</p>
            {balanceChange !== 0 && (
              <p className={`text-xs ${balanceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {balanceChange >= 0 ? '+' : ''}{formatCurrency(balanceChange)} ({balanceChangePercent >= 0 ? '+' : ''}{balanceChangePercent.toFixed(2)}%)
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Free Cash</p>
            <p className={`text-xl font-bold tracking-tight ${freeCash < 0 ? 'text-red-400' : ''}`}>
              {formatCurrency(freeCash)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Used Margin</p>
            <p className="text-xl font-bold tracking-tight">{formatCurrency(usedMargin)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Trades</p>
            <p className="text-xl font-bold tracking-tight">{totalTrades}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Today's P&L</p>
            <p className={`text-xl font-bold tracking-tight ${todayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {todayPnL >= 0 ? '+' : ''}
              {formatCurrency(todayPnL)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total P&L</p>
            <p className={`text-xl font-bold tracking-tight ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}
              {formatCurrency(totalPnL)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

