'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PnLCurveProps {
  initialBalance: number;
  currentBalance: number;
  pnlData?: Array<{ date: string; pnl: number }>;
}

interface PnLDataPoint {
  day: number;
  balance: number;
  date: string;
}

export function PnLCurve({ initialBalance, currentBalance, pnlData }: PnLCurveProps) {
  const generatePnLData = (): PnLDataPoint[] => {
    if (pnlData && pnlData.length > 0) {
      return pnlData.map((point, index) => ({
        day: index,
        balance: initialBalance + point.pnl,
        date: new Date(point.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));
    }

    const data: PnLDataPoint[] = [];
    const days = 30;
    const startBalance = initialBalance;
    const endBalance = currentBalance;
    const totalReturn = endBalance - startBalance;

    for (let i = 0; i <= days; i++) {
      const progress = i / days;
      const balance = startBalance + totalReturn * progress + Math.sin(progress * Math.PI * 4) * 200;
      data.push({
        day: i,
        balance: Math.max(balance, startBalance - 1000),
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return data;
  };

  const chartData = generatePnLData();
  const chartConfig = {
    balance: {
      label: 'Balance',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PnL Curve (Equity Curve)</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
              />
              <YAxis
                tick={{ fill: 'currentColor' }}
                tickLine={{ stroke: 'currentColor' }}
                axisLine={{ stroke: 'currentColor' }}
                domain={['dataMin - 500', 'dataMax + 500']}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ReferenceLine
                y={initialBalance}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                label={{ value: `Initial Balance: ${formatCurrency(initialBalance)}`, position: 'right' }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--color-balance)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">{formatCurrency(initialBalance)}</span>
            <span className="text-muted-foreground ml-2">─ Initial Balance</span>
          </div>
          <div>
            <span className="text-muted-foreground">{formatCurrency(currentBalance)}</span>
            <span className="text-muted-foreground ml-2">─ Current Balance</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

