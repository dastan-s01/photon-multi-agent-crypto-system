'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';
import { useKlinesWS, KlineData } from '@/hooks/use-klines-ws';

interface CandlestickChartProps {
  symbol?: string;
  interval?: string;
}

export function CandlestickChart({ symbol = 'BTCUSDT', interval = '1m' }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { data, isLoading, error } = useKlinesWS(symbol, interval);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      crosshair: {
        vertLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
        },
      },
    });

    let candlestickSeries;
    
    if (CandlestickSeries && typeof chart.addSeries === 'function') {
      try {
        candlestickSeries = chart.addSeries(CandlestickSeries, {
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
      } catch (err) {
        console.error('Error creating candlestick series with addSeries:', err);
      }
    }
    
    if (!candlestickSeries && typeof (chart as any).addCandlestickSeries === 'function') {
      try {
        candlestickSeries = (chart as any).addCandlestickSeries({
          upColor: '#22c55e',
          downColor: '#ef4444',
          borderVisible: false,
          wickUpColor: '#22c55e',
          wickDownColor: '#ef4444',
        });
      } catch (err) {
        console.error('Error creating candlestick series with addCandlestickSeries:', err);
      }
    }
    
    if (!candlestickSeries) {
      console.error('Unable to create candlestick series');
      chart.remove();
      return;
    }

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return;

    const formattedData: CandlestickData<Time>[] = data.map((kline: KlineData) => ({
      time: (kline.time / 1000) as Time,
      open: kline.open,
      high: kline.high,
      low: kline.low,
      close: kline.close,
    }));

    candlestickSeriesRef.current.setData(formattedData);
  }, [data]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[500px] rounded-lg bg-[var(--dashboard-background-card)] border border-white/10">
        <p className="text-red-400">Error loading chart: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div ref={chartContainerRef} className="w-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--dashboard-background-card)]/50 backdrop-blur-sm rounded-lg z-10">
          <p className="text-white/70">Loading chart data...</p>
        </div>
      )}
    </div>
  );
}
