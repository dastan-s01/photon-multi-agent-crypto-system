'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Bar, BarChart, ReferenceLine } from 'recharts';
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, CandlestickChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChartDataPoint } from '@/types/trading';

interface MarketChartProps {
  data: ChartDataPoint[];
  symbol: string;
  currentPrice: number;
  onTimeframeChange?: (timeframe: string) => void;
}

export function MarketChart({ data, symbol, currentPrice, onTimeframeChange }: MarketChartProps) {
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '4h' | '1d'>('1h');
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  const handleTimeframeChange = (newTimeframe: typeof timeframe) => {
    setTimeframe(newTimeframe);
    if (onTimeframeChange) {
      onTimeframeChange(newTimeframe);
    }
  };

  const chartData = data.map((point, idx) => {
    const prevPoint = idx > 0 ? data[idx - 1] : null;
    return {
      time: new Date(point.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
      }),
      price: point.price,
      open: prevPoint ? prevPoint.price : point.price,
      high: point.price * 1.002, // Approximate high
      low: point.price * 0.998,  // Approximate low
      close: point.price,
      volume: point.volume || 0,
      timestamp: point.timestamp.getTime(),
      color: 'rgba(255, 255, 255, 0.7)',
    };
  });

  // Calculate price change
  const firstPrice = chartData[0]?.price || currentPrice;
  const lastPrice = chartData[chartData.length - 1]?.price || currentPrice;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  const chartConfig = {
    price: {
      label: 'Price',
      color: 'var(--dashboard-accent-primary)',
    },
    volume: {
      label: 'Volume',
      color: 'var(--dashboard-accent-secondary)',
    },
  };

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white dark:text-white text-black">
                {symbol} Price Chart
                <div className={cn(
                  "flex items-center gap-1 text-sm font-normal",
                  isPositive ? "text-[var(--dashboard-profit)]" : "text-[var(--dashboard-loss)]"
                )}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {isPositive ? '+' : ''}{priceChangePercent}%
                </div>
              </CardTitle>
              <p className="text-2xl font-bold mt-1 text-white dark:text-white text-black">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                }).format(currentPrice)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={chartType === 'line' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className={cn(
                  "border-border/50",
                  chartType === 'line' 
                    ? "text-white dark:text-white text-black dark:bg-[var(--dashboard-accent-primary)] bg-[var(--dashboard-accent-primary)] hover:opacity-90"
                    : "text-white dark:text-white text-black border-white/20 dark:border-white/20 border-black/20"
                )}
              >
                Line
              </Button>
              <Button
                variant={chartType === 'candlestick' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setChartType('candlestick')}
                className={cn(
                  "border-border/50",
                  chartType === 'candlestick'
                    ? "text-white dark:text-white text-black dark:bg-[var(--dashboard-accent-primary)] bg-[var(--dashboard-accent-primary)] hover:opacity-90"
                    : "text-white dark:text-white text-black border-white/20 dark:border-white/20 border-black/20"
                )}
              >
                <CandlestickChart className="h-4 w-4 mr-1" />
                Candles
              </Button>
            </div>
          </div>

          <Tabs value={timeframe} onValueChange={(v) => handleTimeframeChange(v as typeof timeframe)}>
            <TabsList className="bg-background/50 border border-border/50">
              <TabsTrigger value="15m" className="data-[state=active]:bg-primary/10">15m</TabsTrigger>
              <TabsTrigger value="1h" className="data-[state=active]:bg-primary/10">1h</TabsTrigger>
              <TabsTrigger value="4h" className="data-[state=active]:bg-primary/10">4h</TabsTrigger>
              <TabsTrigger value="1d" className="data-[state=active]:bg-primary/10">1d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickLine={{ stroke: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor', strokeWidth: 0.5 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickLine={{ stroke: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor', strokeWidth: 0.5 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="var(--dashboard-accent-primary)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--dashboard-accent-primary)' }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickLine={{ stroke: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor', strokeWidth: 0.5 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickLine={{ stroke: 'currentColor' }}
                  axisLine={{ stroke: 'currentColor', strokeWidth: 0.5 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <ChartTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                {data.time}
                              </span>
                              <div className="grid grid-cols-2 gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">O: ${data.open.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">H: ${data.high.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">L: ${data.low.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">C: ${data.close.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="price"
                  fill="var(--dashboard-accent-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
