'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { PerformanceMetrics } from '@/types/trading';

interface StatisticsTableProps {
  metrics: PerformanceMetrics;
}

export function StatisticsTable({ metrics }: StatisticsTableProps) {
  const stats = [
    { label: 'Total Trades', value: (metrics.totalTrades || 0).toString() },
    { label: 'Winning Trades', value: (metrics.winningTrades || 0).toString() },
    { label: 'Losing Trades', value: (metrics.losingTrades || 0).toString() },
    { label: 'Win Rate', value: `${(metrics.winRate || 0).toFixed(1)}%` },
    { label: 'Avg Win', value: formatCurrency(metrics.avgWin || 0) },
    { label: 'Avg Loss', value: formatCurrency(metrics.avgLoss || 0) },
    { label: 'Win/Loss Ratio', value: `${(metrics.winLossRatio || 0).toFixed(2)}:1` },
    { label: 'Profit Factor', value: (metrics.profitFactor || 0).toFixed(2) },
    { label: 'Sharpe Ratio', value: (metrics.sharpeRatio || 0).toFixed(2) },
    { label: 'Max Drawdown', value: formatCurrency(metrics.maxDrawdown || 0) },
    { label: 'Total Return', value: formatCurrency(metrics.totalReturn || 0) },
    { label: 'Return %', value: `${(metrics.returnPercent || 0) >= 0 ? '+' : ''}${(metrics.returnPercent || 0).toFixed(1)}%` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistics Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map((stat) => (
              <TableRow key={stat.label}>
                <TableCell className="font-medium">{stat.label}</TableCell>
                <TableCell className="text-right">{stat.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

