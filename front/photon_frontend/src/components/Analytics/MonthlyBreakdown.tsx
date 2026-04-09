'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MonthlyBreakdownProps {
  data?: {
    today: number;
    yesterday: number;
    thisWeek: number;
    thisMonth: number;
    lastMonth: number;
    monthly: Array<{ month: string; pnl: number }>;
  } | null;
}

export function MonthlyBreakdown({ data }: MonthlyBreakdownProps) {
  const breakdown = data
    ? [
        { period: 'Today', pnl: data.today || 0 },
        { period: 'Yesterday', pnl: data.yesterday || 0 },
        { period: 'This Week', pnl: data.thisWeek || 0 },
        { period: 'This Month', pnl: data.thisMonth || 0 },
        { period: 'Last Month', pnl: data.lastMonth || 0 },
        ...(data.monthly && Array.isArray(data.monthly) 
          ? data.monthly.slice(0, 1).map((m) => ({ period: m.month || '', pnl: m.pnl || 0 }))
          : []),
      ]
    : [
        { period: 'Today', pnl: 0 },
        { period: 'Yesterday', pnl: 0 },
        { period: 'This Week', pnl: 0 },
        { period: 'This Month', pnl: 0 },
        { period: 'Last Month', pnl: 0 },
      ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {breakdown.map((item) => (
            <div key={item.period} className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">{item.period}</p>
              <p
                className={`text-lg font-semibold ${
                  item.pnl >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {item.pnl >= 0 ? '+' : ''}
                {formatCurrency(item.pnl)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

