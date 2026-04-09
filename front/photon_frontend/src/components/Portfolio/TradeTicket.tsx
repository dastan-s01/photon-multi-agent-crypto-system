'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { MetaModelTrade } from './MetaModelTrade';
import { MetaModelBacktest } from './MetaModelBacktest';

interface TradeTicketProps {
  onExecuted?: () => void;
}

export function TradeTicket({ onExecuted }: TradeTicketProps) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [quantity, setQuantity] = useState('0.01');
  const [submitting, setSubmitting] = useState<'BUY' | 'SELL' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (action: 'BUY' | 'SELL') => {
    setSubmitting(action);
    setError(null);
    setMessage(null);
    try {
      await apiClient.placeDemoOrder({
        action,
        symbol: symbol.trim().toUpperCase(),
        quantity: parseFloat(quantity),
      });
      setMessage(`${action} executed`);
      if (onExecuted) {
        onExecuted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Tabs defaultValue="manual" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="manual">Manual Trade</TabsTrigger>
        <TabsTrigger value="meta-model">AI Meta-Model</TabsTrigger>
        <TabsTrigger value="backtest">Backtest</TabsTrigger>
      </TabsList>
      <TabsContent value="manual">
        <Card className="card-glass hover-lift">
          <CardHeader>
            <CardTitle>Quick Trade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Symbol</p>
                <Input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="BTCUSDT"
                  className="bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Quantity</p>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.01"
                  className="bg-background/60"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className={cn('flex-1', 'bg-emerald-600 hover:bg-emerald-500')}
                disabled={submitting !== null}
                onClick={() => submit('BUY')}
              >
                {submitting === 'BUY' ? 'Buying...' : 'Buy'}
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={submitting !== null}
                onClick={() => submit('SELL')}
              >
                {submitting === 'SELL' ? 'Selling...' : 'Sell'}
              </Button>
            </div>
            {message && <p className="text-sm text-emerald-400">{message}</p>}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Orders are fully simulated. Prices come from the live feed; balances and PnL update instantly in the demo ledger.
            </p>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="meta-model">
        <MetaModelTrade onExecuted={onExecuted} />
      </TabsContent>
      <TabsContent value="backtest">
        <MetaModelBacktest onComplete={onExecuted} />
      </TabsContent>
    </Tabs>
  );
}
