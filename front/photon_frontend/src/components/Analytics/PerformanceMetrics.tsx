'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import type { PerformanceMetrics as PerformanceMetricsType } from '@/types/trading';

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
}

export function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <Card className="card-glass hover-lift">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Return</p>
            <p className="text-xl font-bold tracking-tight text-green-400">
              +{formatCurrency(metrics.totalReturn)}
            </p>
            {metrics.returnPercent !== undefined && (
              <p className="text-xs text-green-400">
                +{metrics.returnPercent.toFixed(2)}%
              </p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Sharpe Ratio</p>
            <p className="text-xl font-bold tracking-tight">{metrics.sharpeRatio.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</p>
            <p className="text-xl font-bold tracking-tight">{metrics.winRate.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Profit Factor</p>
            <p className="text-xl font-bold tracking-tight">{metrics.profitFactor.toFixed(2)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Max Drawdown</p>
            <p className="text-xl font-bold tracking-tight text-red-400">
              {formatCurrency(metrics.maxDrawdown)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Trades</p>
            <p className="text-xl font-bold tracking-tight">{metrics.totalTrades}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

