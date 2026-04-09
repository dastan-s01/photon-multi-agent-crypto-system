'use client';

import { useState } from 'react';
import { CandlestickChart } from '@/components/CryptoDashboard/CandlestickChart';
import { MarketInfoCard } from '@/components/CryptoDashboard/MarketInfoCard';
import { OrderBook } from '@/components/CryptoDashboard/OrderBook';
import { TechnicalAnalysisWidget } from '@/components/CryptoDashboard/TechnicalAnalysisWidget';
import { AdvancedTechnicalAnalysis } from '@/components/CryptoDashboard/AdvancedTechnicalAnalysis';
import { CryptoSelector } from '@/components/CryptoDashboard/CryptoSelector';

export default function CryptoDashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const formatSymbol = (symbol: string) => {
    return symbol.replace('USDT', '/USDT');
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {formatSymbol(selectedSymbol)} Dashboard
          </h1>
          <p className="text-white/70">Real-time market data</p>
        </div>
        <CryptoSelector selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
      </div>

      <div className="space-y-6">
        <div className="w-full" key={`chart-${selectedSymbol}`}>
          <div className="dashboard-card rounded-lg p-4">
            <CandlestickChart symbol={selectedSymbol} interval="1m" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1" key={`market-${selectedSymbol}`}>
            <MarketInfoCard symbol={selectedSymbol.toLowerCase()} />
          </div>
          <div className="lg:col-span-1" key={`orderbook-${selectedSymbol}`}>
            <OrderBook symbol={selectedSymbol.toLowerCase()} depth={15} />
          </div>
          <div className="lg:col-span-1" key={`tech-${selectedSymbol}`}>
            <TechnicalAnalysisWidget symbol={selectedSymbol} />
          </div>
        </div>

        <div className="w-full" key={`advanced-${selectedSymbol}`}>
          <AdvancedTechnicalAnalysis symbol={selectedSymbol} />
        </div>
      </div>
    </div>
  );
}
