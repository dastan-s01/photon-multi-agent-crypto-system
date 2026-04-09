'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface EquityCurveProps {
  initialBalance: number;
  currentBalance: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

interface EquityDataPoint {
  day: number;
  balance: number;
  date: string;
}

export function EquityCurve({
  initialBalance,
  currentBalance,
  maxDrawdown,
  sharpeRatio,
}: EquityCurveProps) {
  const generateEquityData = (): EquityDataPoint[] => {
    const data: EquityDataPoint[] = [];
    const days = 30;
    const startBalance = initialBalance;
    const endBalance = currentBalance;
    const totalReturn = endBalance - startBalance;

    for (let i = 0; i <= days; i++) {
      const progress = i / days;
      const balance = startBalance + totalReturn * progress + Math.sin(progress * Math.PI * 4) * 200;
      data.push({
        day: i,
        balance: Math.max(balance, startBalance + maxDrawdown),
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return data;
  };

  const chartData = generateEquityData();
  const chartConfig = {
    balance: {
      label: 'Balance',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Equity Curve</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
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
                label={{ value: 'Initial Balance', position: 'right' }}
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
            <span className="text-muted-foreground">Max Drawdown: </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {formatCurrency(maxDrawdown)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Sharpe Ratio: </span>
            <span className="font-medium">{sharpeRatio.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

