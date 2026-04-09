'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const POPULAR_CRYPTOS = [
  { symbol: 'BTCUSDT', label: 'BTC/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/bitcoin/standard.png' },
  { symbol: 'ETHUSDT', label: 'ETH/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ethereum/standard.png' },
  { symbol: 'BNBUSDT', label: 'BNB/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/binance-coin/standard.png' },
  { symbol: 'SOLUSDT', label: 'SOL/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/solana/standard.png' },
  { symbol: 'XRPUSDT', label: 'XRP/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/ripple/standard.png' },
  { symbol: 'ADAUSDT', label: 'ADA/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/cardano/standard.png' },
  { symbol: 'DOGEUSDT', label: 'DOGE/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/dogecoin/standard.png' },
  { symbol: 'DOTUSDT', label: 'DOT/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/polkadot/standard.png' },
  { symbol: 'AVAXUSDT', label: 'AVAX/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/avalanche/standard.png' },
  { symbol: 'LINKUSDT', label: 'LINK/USDT', logo: 'https://cdn.jsdelivr.net/gh/simplr-sh/coin-logos/images/chainlink/standard.png' },
];

interface CryptoSelectorProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export function CryptoSelector({ selectedSymbol, onSymbolChange }: CryptoSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {POPULAR_CRYPTOS.map((crypto) => (
        <Button
          key={crypto.symbol}
          variant={selectedSymbol === crypto.symbol ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSymbolChange(crypto.symbol)}
          className={cn(
            'text-xs flex items-center gap-2',
            selectedSymbol === crypto.symbol
              ? 'bg-white/10 dark:bg-white/10 border-white/20 dark:border-white/20 text-black dark:text-white border-black/20'
              : 'bg-transparent border-white/10 dark:border-white/10 text-black/70 dark:text-white/70 hover:bg-white/5 dark:hover:bg-white/5 border-black/10 hover:bg-black/5'
          )}
        >
          <img
            src={crypto.logo}
            alt={crypto.label}
            className="w-5 h-5 rounded-full object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <span className="whitespace-nowrap">{crypto.label}</span>
        </Button>
      ))}
    </div>
  );
}
