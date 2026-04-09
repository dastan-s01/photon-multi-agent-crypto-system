'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useKlinesWS } from '@/hooks/use-klines-ws';
import { cn } from '@/lib/utils';

interface AdvancedTechnicalAnalysisProps {
  symbol?: string;
}

type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '1d';

interface IndicatorResult {
  name: string;
  value: number;
  action: 'Buy' | 'Sell' | 'Neutral' | 'Overbought' | 'Oversold' | 'Good';
}

interface MovingAverageResult {
  period: string;
  simple: { value: number; action: 'Buy' | 'Sell' };
  exponential: { value: number; action: 'Buy' | 'Sell' };
}

function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return NaN;
  const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
  return sum / period;
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return NaN;
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  return ema;
}

function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return NaN;
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  const recentChanges = changes.slice(-period);
  const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
  const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
  
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

function calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
  if (prices.length < 26) return { macd: NaN, signal: NaN, histogram: NaN };
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macd = ema12 - ema26;
  
  const macdValues: number[] = [];
  for (let i = 26; i < prices.length; i++) {
    const ema12_val = calculateEMA(prices.slice(0, i + 1), 12);
    const ema26_val = calculateEMA(prices.slice(0, i + 1), 26);
    macdValues.push(ema12_val - ema26_val);
  }
  
  const signal = macdValues.length >= 9 ? calculateEMA(macdValues, 9) : NaN;
  const histogram = !isNaN(macd) && !isNaN(signal) ? macd - signal : NaN;
  
  return { macd, signal, histogram };
}

function calculateStochastic(highs: number[], lows: number[], closes: number[], period: number = 14): { k: number; d: number } {
  if (highs.length < period || lows.length < period || closes.length < period) {
    return { k: NaN, d: NaN };
  }
  
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const recentCloses = closes.slice(-period);
  
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  
  const currentClose = closes[closes.length - 1];
  const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
  
  const kValues: number[] = [];
  for (let i = period - 1; i < closes.length; i++) {
    const hh = Math.max(...highs.slice(i - period + 1, i + 1));
    const ll = Math.min(...lows.slice(i - period + 1, i + 1));
    const cc = closes[i];
    if (hh !== ll) {
      kValues.push(((cc - ll) / (hh - ll)) * 100);
    } else {
      kValues.push(50);
    }
  }
  
  const d = kValues.length >= 3 ? kValues.slice(-3).reduce((a, b) => a + b, 0) / 3 : NaN;
  
  return { k, d };
}

function calculateCCI(highs: number[], lows: number[], closes: number[], period: number = 20): number {
  if (closes.length < period) return NaN;
  
  const typicalPrices: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    typicalPrices.push((highs[i] + lows[i] + closes[i]) / 3);
  }
  
  const recentTP = typicalPrices.slice(-period);
  const sma = recentTP.reduce((a, b) => a + b, 0) / period;
  const meanDeviation = recentTP.reduce((sum, tp) => sum + Math.abs(tp - sma), 0) / period;
  
  const currentTP = typicalPrices[typicalPrices.length - 1];
  return meanDeviation === 0 ? 0 : (currentTP - sma) / (0.015 * meanDeviation);
}

function calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (highs.length < period + 1) return NaN;
  
  const trValues: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trValues.push(tr);
    
    const moveUp = highs[i] - highs[i - 1];
    const moveDown = lows[i - 1] - lows[i];
    
    plusDM.push(moveUp > moveDown && moveUp > 0 ? moveUp : 0);
    minusDM.push(moveDown > moveUp && moveDown > 0 ? moveDown : 0);
  }
  
  const atr = trValues.slice(-period).reduce((a, b) => a + b, 0) / period;
  const plusDI = plusDM.slice(-period).reduce((a, b) => a + b, 0) / period;
  const minusDI = minusDM.slice(-period).reduce((a, b) => a + b, 0) / period;
  
  if (atr === 0) return 0;
  
  const dx = Math.abs(plusDI - minusDI) / (plusDI + minusDI) * 100;
  return dx;
}

function calculateROC(prices: number[], period: number = 9): number {
  if (prices.length < period + 1) return NaN;
  const current = prices[prices.length - 1];
  const past = prices[prices.length - period - 1];
  return ((current - past) / past) * 100;
}

function calculateParabolicSAR(highs: number[], lows: number[], closes: number[]): number {
  if (highs.length < 2) return NaN;
  
  let af = 0.02;
  let ep = lows[0];
  let sar = lows[0];
  let trend = 1;
  
  for (let i = 1; i < highs.length; i++) {
    if (trend === 1) {
      sar = sar + af * (ep - sar);
      if (sar > lows[i]) {
        trend = -1;
        sar = ep;
        ep = lows[i];
        af = 0.02;
      } else {
        if (highs[i] > ep) {
          ep = highs[i];
          af = Math.min(af + 0.02, 0.2);
        }
      }
    } else {
      sar = sar + af * (ep - sar);
      if (sar < highs[i]) {
        trend = 1;
        sar = ep;
        ep = highs[i];
        af = 0.02;
      } else {
        if (lows[i] < ep) {
          ep = lows[i];
          af = Math.min(af + 0.02, 0.2);
        }
      }
    }
  }
  
  return sar;
}

function calculateWilliamsR(highs: number[], lows: number[], closes: number[], period: number = 14): number {
  if (closes.length < period) return NaN;
  const recentHighs = highs.slice(-period);
  const recentLows = lows.slice(-period);
  const highestHigh = Math.max(...recentHighs);
  const lowestLow = Math.min(...recentLows);
  const currentClose = closes[closes.length - 1];
  
  if (highestHigh === lowestLow) return 0;
  return ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;
}

function calculateStochasticRSI(closes: number[], period: number = 14): number {
  const rsiValues: number[] = [];
  
  for (let i = period; i < closes.length; i++) {
    const rsi = calculateRSI(closes.slice(0, i + 1), period);
    if (!isNaN(rsi)) rsiValues.push(rsi);
  }
  
  if (rsiValues.length < period) return NaN;
  
  const recentRSI = rsiValues.slice(-period);
  const highestRSI = Math.max(...recentRSI);
  const lowestRSI = Math.min(...recentRSI);
  const currentRSI = rsiValues[rsiValues.length - 1];
  
  if (highestRSI === lowestRSI) return 50;
  return ((currentRSI - lowestRSI) / (highestRSI - lowestRSI)) * 100;
}

function calculateUltimateOscillator(highs: number[], lows: number[], closes: number[]): number {
  if (closes.length < 28) return NaN;
  
  const bp: number[] = [];
  const tr: number[] = [];
  
  for (let i = 1; i < closes.length; i++) {
    bp.push(closes[i] - Math.min(lows[i], closes[i - 1]));
    tr.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ));
  }
  
  const avg7 = bp.slice(-7).reduce((a, b) => a + b, 0) / tr.slice(-7).reduce((a, b) => a + b, 0);
  const avg14 = bp.slice(-14).reduce((a, b) => a + b, 0) / tr.slice(-14).reduce((a, b) => a + b, 0);
  const avg28 = bp.slice(-28).reduce((a, b) => a + b, 0) / tr.slice(-28).reduce((a, b) => a + b, 0);
  
  return 100 * ((4 * avg7 + 2 * avg14 + avg28) / 7);
}

function getIndicatorAction(indicator: string, value: number): IndicatorResult['action'] {
  switch (indicator) {
    case 'RSI':
      if (value > 70) return 'Overbought';
      if (value < 30) return 'Oversold';
      if (value > 50) return 'Buy';
      return 'Sell';
    case 'STOCH':
    case 'STOCHRSI':
      if (value > 80) return 'Overbought';
      if (value < 20) return 'Oversold';
      if (value > 50) return 'Buy';
      return 'Sell';
    case 'MACD':
      return value > 0 ? 'Buy' : 'Sell';
    case 'ADX':
      if (value > 25) return 'Good';
      return 'Neutral';
    case 'CCI':
      if (value > 100) return 'Buy';
      if (value < -100) return 'Sell';
      return 'Neutral';
    case 'Williams %R':
      if (value > -20) return 'Overbought';
      if (value < -80) return 'Oversold';
      return 'Neutral';
    case 'Ultimate Oscillator':
      if (value > 70) return 'Overbought';
      if (value < 30) return 'Oversold';
      return 'Neutral';
    case 'ROC':
      return value > 0 ? 'Buy' : 'Sell';
    case 'Parabolic SAR':
      return 'Neutral';
    default:
      return 'Neutral';
  }
}

function getMAAction(currentPrice: number, maValue: number): 'Buy' | 'Sell' {
  return currentPrice > maValue ? 'Buy' : 'Sell';
}

function calculateFearAndGreed(indicators: IndicatorResult[], mas: MovingAverageResult[], currentPrice: number): number {
  let score = 50;
  
  indicators.forEach(ind => {
    if (ind.action === 'Buy' || ind.action === 'Oversold') score += 5;
    if (ind.action === 'Sell' || ind.action === 'Overbought') score -= 5;
    if (ind.action === 'Good') score += 3;
  });
  
  mas.forEach(ma => {
    if (ma.simple.action === 'Buy') score += 2;
    if (ma.simple.action === 'Sell') score -= 2;
  });
  
  return Math.max(0, Math.min(100, score));
}

export function AdvancedTechnicalAnalysis({ symbol = 'BTCUSDT' }: AdvancedTechnicalAnalysisProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('30m');
  const { data: klinesData } = useKlinesWS(symbol, timeframe);

  const analysis = useMemo(() => {
    if (!klinesData || klinesData.length < 50) {
      return {
        indicators: [] as IndicatorResult[],
        movingAverages: [] as MovingAverageResult[],
        buySignals: 0,
        sellSignals: 0,
        totalIndicators: 0,
        overallSignal: 'Neutral' as const,
        fearGreed: 50,
      };
    }

    const closes = klinesData.map((k) => k.close);
    const highs = klinesData.map((k) => k.high);
    const lows = klinesData.map((k) => k.low);
    const currentPrice = closes[closes.length - 1];

    const indicators: IndicatorResult[] = [];
    
    const rsi = calculateRSI(closes, 14);
    if (!isNaN(rsi)) {
      indicators.push({
        name: 'RSI(14)',
        value: rsi,
        action: getIndicatorAction('RSI', rsi),
      });
    }

    const macd = calculateMACD(closes);
    if (!isNaN(macd.macd)) {
      indicators.push({
        name: 'MACD(12,26,9)',
        value: macd.macd,
        action: getIndicatorAction('MACD', macd.macd),
      });
    }

    const stoch = calculateStochastic(highs, lows, closes, 14);
    if (!isNaN(stoch.k)) {
      indicators.push({
        name: 'STOCH(5,3,3)',
        value: stoch.k,
        action: getIndicatorAction('STOCH', stoch.k),
      });
    }

    const stochRSI = calculateStochasticRSI(closes, 14);
    if (!isNaN(stochRSI)) {
      indicators.push({
        name: 'STOCHRSI(14)',
        value: stochRSI,
        action: getIndicatorAction('STOCHRSI', stochRSI),
      });
    }

    const cci = calculateCCI(highs, lows, closes, 20);
    if (!isNaN(cci)) {
      indicators.push({
        name: 'CCI(20)',
        value: cci,
        action: getIndicatorAction('CCI', cci),
      });
    }

    const adx = calculateADX(highs, lows, closes, 14);
    if (!isNaN(adx)) {
      indicators.push({
        name: 'ADX(14)',
        value: adx,
        action: getIndicatorAction('ADX', adx),
      });
    }

    const roc = calculateROC(closes, 9);
    if (!isNaN(roc)) {
      indicators.push({
        name: 'ROC(9)',
        value: roc,
        action: getIndicatorAction('ROC', roc),
      });
    }

    const sar = calculateParabolicSAR(highs, lows, closes);
    if (!isNaN(sar)) {
      indicators.push({
        name: 'Parabolic SAR',
        value: sar,
        action: getIndicatorAction('Parabolic SAR', sar),
      });
    }

    const williamsR = calculateWilliamsR(highs, lows, closes, 14);
    if (!isNaN(williamsR)) {
      indicators.push({
        name: 'Williams %R(14)',
        value: williamsR,
        action: getIndicatorAction('Williams %R', williamsR),
      });
    }

    const uo = calculateUltimateOscillator(highs, lows, closes);
    if (!isNaN(uo)) {
      indicators.push({
        name: 'Ultimate Oscillator',
        value: uo,
        action: getIndicatorAction('Ultimate Oscillator', uo),
      });
    }

    const movingAverages: MovingAverageResult[] = [];
    const periods = [5, 10, 20, 50, 100, 200];
    
    periods.forEach(period => {
      if (closes.length >= period) {
        const sma = calculateSMA(closes, period);
        const ema = calculateEMA(closes, period);
        
        movingAverages.push({
          period: `MA${period}`,
          simple: {
            value: sma,
            action: getMAAction(currentPrice, sma),
          },
          exponential: {
            value: ema,
            action: getMAAction(currentPrice, ema),
          },
        });
      }
    });

    const buySignals = indicators.filter(i => i.action === 'Buy' || i.action === 'Oversold').length +
                      movingAverages.filter(ma => ma.simple.action === 'Buy').length;
    const sellSignals = indicators.filter(i => i.action === 'Sell' || i.action === 'Overbought').length +
                       movingAverages.filter(ma => ma.simple.action === 'Sell').length;
    
    const overallSignal = buySignals > sellSignals ? 'Buy' : sellSignals > buySignals ? 'Sell' : 'Neutral';
    const fearGreed = calculateFearAndGreed(indicators, movingAverages, currentPrice);

    return {
      indicators,
      movingAverages,
      buySignals,
      sellSignals,
      totalIndicators: indicators.length + movingAverages.length * 2,
      overallSignal,
      fearGreed,
    };
  }, [klinesData]);

  const timeframes: { label: string; value: Timeframe }[] = [
    { label: '1 minute', value: '1m' },
    { label: '5 minutes', value: '5m' },
    { label: '15 minutes', value: '15m' },
    { label: '30 minutes', value: '30m' },
    { label: '1 hour', value: '1h' },
    { label: '2 hours', value: '2h' },
    { label: '4 hours', value: '4h' },
    { label: '1 day', value: '1d' },
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Buy':
      case 'Oversold':
        return 'text-green-400';
      case 'Sell':
      case 'Overbought':
        return 'text-red-400';
      case 'Good':
        return 'text-blue-400';
      default:
        return 'text-white/70';
    }
  };

  const getFearGreedLabel = (score: number) => {
    if (score >= 75) return { text: 'Extreme Greed', color: 'text-green-400' };
    if (score >= 55) return { text: 'Greed', color: 'text-green-300' };
    if (score >= 45) return { text: 'Neutral', color: 'text-white/70' };
    if (score >= 25) return { text: 'Fear', color: 'text-red-300' };
    return { text: 'Extreme Fear', color: 'text-red-400' };
  };

  const fearGreedLabel = getFearGreedLabel(analysis.fearGreed);
  const gaugeAngle = (analysis.fearGreed / 100) * 180 - 90;

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <CardTitle className="text-white">Advanced Technical Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {timeframes.map((tf) => (
            <Button
              key={tf.value}
              variant={timeframe === tf.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(tf.value)}
              className={cn(
                'text-xs',
                timeframe === tf.value
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-transparent border-white/10 text-white/70 hover:bg-white/5'
              )}
            >
              {tf.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white">Technical Indicators</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-white/50 pb-2 border-b border-white/10">
                <div>Name</div>
                <div className="text-right">Value</div>
                <div className="text-right">Action</div>
              </div>
              {analysis.indicators.map((ind, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-xs py-1">
                  <div className="text-white/70">{ind.name}</div>
                  <div className="text-right text-white">{ind.value.toFixed(2)}</div>
                  <div className={cn('text-right font-medium', getActionColor(ind.action))}>
                    {ind.action}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-white">Moving Averages</h3>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-2 text-xs text-white/50 pb-2 border-b border-white/10">
                <div>Period</div>
                <div className="text-right">Simple</div>
                <div className="text-right">Exponential</div>
              </div>
              {analysis.movingAverages.map((ma, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 text-xs py-1">
                  <div className="text-white/70">{ma.period}</div>
                  <div className="text-right">
                    <span className="text-white">{ma.simple.value.toFixed(2)}</span>
                    <span className={cn('ml-2 font-medium', getActionColor(ma.simple.action))}>
                      {ma.simple.action}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white">{ma.exponential.value.toFixed(2)}</span>
                    <span className={cn('ml-2 font-medium', getActionColor(ma.exponential.action))}>
                      {ma.exponential.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Signal</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Buy Signals</span>
                  <span className="text-green-400 font-semibold">{analysis.buySignals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Sell Signals</span>
                  <span className="text-red-400 font-semibold">{analysis.sellSignals}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Total Indicators</span>
                  <span className="text-blue-400 font-semibold">{analysis.totalIndicators}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <div className="text-sm text-white/70 mb-2">Signal</div>
                  <div
                    className={cn(
                      'inline-block px-4 py-2 rounded text-sm font-semibold',
                      analysis.overallSignal === 'Buy'
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : analysis.overallSignal === 'Sell'
                        ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                        : 'bg-white/10 text-white/70 border border-white/20'
                    )}
                  >
                    {analysis.overallSignal}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Fear & Greed</h3>
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
                        analysis.fearGreed >= 50
                          ? `rgba(34, 197, 94, ${analysis.fearGreed / 100})`
                          : `rgba(239, 68, 68, ${(100 - analysis.fearGreed) / 100})`
                      }
                      strokeWidth="8"
                      strokeDasharray={`${(analysis.fearGreed / 100) * 251.2} 251.2`}
                    />
                    <text
                      x="20"
                      y="95"
                      fill="rgba(255, 255, 255, 0.5)"
                      fontSize="10"
                      textAnchor="start"
                    >
                      Fear
                    </text>
                    <text
                      x="180"
                      y="95"
                      fill="rgba(255, 255, 255, 0.5)"
                      fontSize="10"
                      textAnchor="end"
                    >
                      Greed
                    </text>
                    <line
                      x1="100"
                      y1="80"
                      x2={
                        100 +
                        Math.cos((gaugeAngle * Math.PI) / 180) * 60
                      }
                      y2={
                        80 -
                        Math.sin((gaugeAngle * Math.PI) / 180) * 60
                      }
                      stroke={analysis.fearGreed >= 50 ? '#22c55e' : '#ef4444'}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <text
                      x="100"
                      y="50"
                      fill="rgba(255, 255, 255, 0.9)"
                      fontSize="24"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {Math.round(analysis.fearGreed)}
                    </text>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className={cn('text-sm font-semibold', fearGreedLabel.color)}>
                  {fearGreedLabel.text}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
