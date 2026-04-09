'use client';

import { TopGainersLosers } from './TopGainersLosers';

const POPULAR_CRYPTOS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'DOTUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'UNIUSDT',
  'LTCUSDT',
  'ATOMUSDT',
  'ETCUSDT',
  'XLMUSDT',
  'ALGOUSDT',
  'VETUSDT',
  'ICPUSDT',
  'FILUSDT',
];

interface MarketHeatmapProps {
  marketData?: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
}

export function MarketHeatmap({ marketData }: MarketHeatmapProps) {
  return <TopGainersLosers symbols={POPULAR_CRYPTOS} limit={10} />;
}



