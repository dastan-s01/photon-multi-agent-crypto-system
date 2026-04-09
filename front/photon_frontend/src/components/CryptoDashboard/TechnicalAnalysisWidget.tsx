'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useKlinesWS } from '@/hooks/use-klines-ws';
import { cn } from '@/lib/utils';

interface TechnicalAnalysisWidgetProps {
  symbol?: string;
}

interface SignalCounts {
  buy: number;
  sell: number;
  neutral: number;
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      sma.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  const changes: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsi.push(NaN);
    } else {
      const periodChanges = changes.slice(i - period, i);
      const gains = periodChanges.filter((c) => c > 0).reduce((a, b) => a + b, 0) / period;
      const losses = Math.abs(
        periodChanges.filter((c) => c < 0).reduce((a, b) => a + b, 0) / period
      );

      if (losses === 0) {
        rsi.push(100);
      } else {
        const rs = gains / losses;
        rsi.push(100 - 100 / (1 + rs));
      }
    }
  }

  return rsi;
}

function getSignal(
  sma9: number,
  sma20: number,
  sma50: number,
  rsi: number,
  currentPrice: number
): 'buy' | 'sell' | 'neutral' {
  let buySignals = 0;
  let sellSignals = 0;

  if (!isNaN(sma9) && !isNaN(sma20)) {
    if (sma9 > sma20) buySignals++;
    else sellSignals++;
  }

  if (!isNaN(sma20) && !isNaN(sma50)) {
    if (sma20 > sma50) buySignals++;
    else sellSignals++;
  }

  if (!isNaN(sma9) && !isNaN(sma50)) {
    if (sma9 > sma50) buySignals++;
    else sellSignals++;
  }

  if (!isNaN(rsi)) {
    if (rsi < 30) buySignals++;
    else if (rsi > 70) sellSignals++;
    else if (rsi >= 30 && rsi <= 70) {
      if (rsi < 50) buySignals++;
      else sellSignals++;
    }
  }

  if (buySignals > sellSignals) return 'buy';
  if (sellSignals > buySignals) return 'sell';
  return 'neutral';
}

export function TechnicalAnalysisWidget({ symbol = 'BTCUSDT' }: TechnicalAnalysisWidgetProps) {
  const { data: klinesData } = useKlinesWS(symbol, '1m');

  const analysis = useMemo(() => {
    if (!klinesData || klinesData.length < 50) {
      return {
        signal: 'neutral' as const,
        counts: { buy: 0, sell: 0, neutral: 0 },
        sma9: NaN,
        sma20: NaN,
        sma50: NaN,
        rsi: NaN,
      };
    }

    const closes = klinesData.map((k) => k.close);
    const sma9 = calculateSMA(closes, 9);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);
    const rsi = calculateRSI(closes, 14);

    const signals: ('buy' | 'sell' | 'neutral')[] = [];
    for (let i = 0; i < closes.length; i++) {
      if (
        !isNaN(sma9[i]) &&
        !isNaN(sma20[i]) &&
        !isNaN(sma50[i]) &&
        !isNaN(rsi[i])
      ) {
        signals.push(getSignal(sma9[i], sma20[i], sma50[i], rsi[i], closes[i]));
      }
    }

    const counts: SignalCounts = {
      buy: signals.filter((s) => s === 'buy').length,
      sell: signals.filter((s) => s === 'sell').length,
      neutral: signals.filter((s) => s === 'neutral').length,
    };

    const lastIndex = closes.length - 1;
    const currentSignal = getSignal(
      sma9[lastIndex],
      sma20[lastIndex],
      sma50[lastIndex],
      rsi[lastIndex],
      closes[lastIndex]
    );

    return {
      signal: currentSignal,
      counts,
      sma9: sma9[lastIndex],
      sma20: sma20[lastIndex],
      sma50: sma50[lastIndex],
      rsi: rsi[lastIndex],
    };
  }, [klinesData]);

  const getGaugeAngle = () => {
    const total = analysis.counts.buy + analysis.counts.sell + analysis.counts.neutral;
    if (total === 0) return 0;

    const buyRatio = analysis.counts.buy / total;
    const sellRatio = analysis.counts.sell / total;

    if (buyRatio > sellRatio) {
      return 90 - (buyRatio * 90);
    } else if (sellRatio > buyRatio) {
      return 90 + (sellRatio * 90);
    }
    return 90;
  };

  const gaugeAngle = getGaugeAngle();

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-white">Technical Analysis for {symbol}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-24">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              <path
                d="M 20 80 A 80 80 0 0 1 180 80"
                fill="none"
                stroke={
                  analysis.signal === 'buy'
                    ? '#22c55e'
                    : analysis.signal === 'sell'
                    ? '#ef4444'
                    : 'rgba(255, 255, 255, 0.5)'
                }
                strokeWidth="8"
                strokeDasharray={`${(analysis.counts.buy / (analysis.counts.buy + analysis.counts.sell + analysis.counts.neutral)) * 251.2} 251.2`}
              />
              <line
                x1="100"
                y1="80"
                x2="100"
                y2="20"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="2"
              />
              <text
                x="20"
                y="95"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
                textAnchor="start"
              >
                Strong Sell
              </text>
              <text
                x="50"
                y="95"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
                textAnchor="middle"
              >
                Sell
              </text>
              <text
                x="100"
                y="95"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
                textAnchor="middle"
              >
                Neutral
              </text>
              <text
                x="150"
                y="95"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
                textAnchor="middle"
              >
                Buy
              </text>
              <text
                x="180"
                y="95"
                fill="rgba(255, 255, 255, 0.5)"
                fontSize="10"
                textAnchor="end"
              >
                Strong Buy
              </text>
              <line
                x1="100"
                y1="80"
                x2={
                  100 +
                  Math.cos(((gaugeAngle - 90) * Math.PI) / 180) * 60
                }
                y2={
                  80 -
                  Math.sin(((gaugeAngle - 90) * Math.PI) / 180) * 60
                }
                stroke={
                  analysis.signal === 'buy'
                    ? '#22c55e'
                    : analysis.signal === 'sell'
                    ? '#ef4444'
                    : 'rgba(255, 255, 255, 0.5)'
                }
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 items-center justify-items-center">
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-red-400 tabular-nums">{analysis.counts.sell}</p>
            <p className="text-xs text-white/50 mt-1">Sell</p>
          </div>
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-white/70 tabular-nums">{analysis.counts.neutral}</p>
            <p className="text-xs text-white/50 mt-1">Neutral</p>
          </div>
          <div className="text-center w-full">
            <p className="text-2xl font-bold text-green-400 tabular-nums">{analysis.counts.buy}</p>
            <p className="text-xs text-white/50 mt-1">Buy</p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/50">SMA 9:</span>
            <span className="text-white">
              {isNaN(analysis.sma9) ? 'N/A' : analysis.sma9.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">SMA 20:</span>
            <span className="text-white">
              {isNaN(analysis.sma20) ? 'N/A' : analysis.sma20.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">SMA 50:</span>
            <span className="text-white">
              {isNaN(analysis.sma50) ? 'N/A' : analysis.sma50.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/50">RSI (14):</span>
            <span className="text-white">
              {isNaN(analysis.rsi) ? 'N/A' : analysis.rsi.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
