'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Loader2, TrendingUp, TrendingDown, BarChart3, XCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MetaModelBacktestProps {
  onComplete?: () => void;
}

export function MetaModelBacktest({ onComplete }: MetaModelBacktestProps) {
  const [symbol, setSymbol] = useState('SOLUSDT');
  const [initialBalance, setInitialBalance] = useState('10000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await apiClient.getPortfolio();
        if (!cancelled && p?.balance != null) {
          setInitialBalance(String(p.balance));
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.runMetaModelBacktest({
        symbol: symbol.trim().toUpperCase(),
        initial_balance: parseFloat(initialBalance) || 10000,
        train_window: 200,
        retrain_interval: 50,
        use_ensemble: true,
        use_regime_switching: true,
        apply_to_account: true,
      });
      setResult(response);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Backtest error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Backtest failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Meta-Model Backtest
          <Badge variant="secondary" className="text-xs">Walk-Forward</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Symbol</p>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="SOLUSDT"
              className="bg-background/60"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Simulation start (USD)</p>
            <Input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="10000"
              className="bg-background/60"
            />
            <p className="text-xs text-muted-foreground">
              Prefilled from your paper balance; only affects the historical run, not the sync target
              (sync uses final balance below).
            </p>
          </div>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-500"
          disabled={loading}
          onClick={runBacktest}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Backtest...
            </>
          ) : (
            'Run Backtest'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result?.account_synced === true && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Paper account balance was set to the backtest final equity. Demo trade history and open
              positions were cleared so the ledger stays consistent.
            </AlertDescription>
          </Alert>
        )}
        {result?.account_synced === false && result?.account_sync_error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Backtest finished but the account was not updated: {result.account_sync_error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4 pt-2 border-t">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="trades">Trades</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-background/40">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Initial Balance</p>
                      <p className="text-2xl font-bold">{formatCurrency(result.initial_balance)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/40">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Final Balance</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        result.total_return >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {formatCurrency(result.final_balance)}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className={cn(
                  "bg-background/40",
                  result.total_return >= 0 ? "border-green-500/50" : "border-red-500/50"
                )}>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Total Return</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      result.total_return >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatPercent(result.total_return)}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-background/40">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                      <p className="text-xl font-bold">{result.total_trades}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/40 border-green-500/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Profitable</p>
                      <p className="text-xl font-bold text-green-500">{result.profitable_trades}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-background/40 border-red-500/50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Losing</p>
                      <p className="text-xl font-bold text-red-500">{result.losing_trades}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-background/40">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Win Rate</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-background/60 rounded-full h-4 overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${result.win_rate}%` }}
                        />
                      </div>
                      <span className="text-lg font-bold">{result.win_rate.toFixed(2)}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/40">
                  <CardHeader>
                    <CardTitle className="text-sm">Market Regime Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(result.regime_distribution).map(([regime, count]: [string, number]) => {
                      const total = (Object.values(result.regime_distribution) as number[]).reduce((a: number, b: number) => a + b, 0);
                      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                      return (
                        <div key={regime} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="capitalize">
                              {regime}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="bg-background/40">
                  <CardHeader>
                    <CardTitle className="text-sm">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Models Used:</span>
                      <div className="flex gap-1">
                        {result.models_used?.map((model) => (
                          <Badge key={model} variant="outline" className="text-xs capitalize">
                            {model.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Models Count:</span>
                      <span className="font-medium">{result.models_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Train Window:</span>
                      <span className="font-medium">{result.settings.train_window}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Retrain Interval:</span>
                      <span className="font-medium">{result.settings.retrain_interval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ensemble:</span>
                      <Badge variant={result.settings.use_ensemble ? "default" : "secondary"}>
                        {result.settings.use_ensemble ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Regime Switching:</span>
                      <Badge variant={result.settings.use_regime_switching ? "default" : "secondary"}>
                        {result.settings.use_regime_switching ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trades" className="space-y-2">
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                  {result.trades.map((trade: any, idx: number) => {
                    const isBuy = trade.action === 'BUY';
                    const isProfitable = trade.pnl_pct !== undefined && trade.pnl_pct > 0;
                    const isLosing = trade.pnl_pct !== undefined && trade.pnl_pct < 0;
                    
                    return (
                      <Card
                        key={idx}
                        className={cn(
                          "bg-background/40",
                          isBuy ? "border-blue-500/50" : isProfitable ? "border-green-500/50" : isLosing ? "border-red-500/50" : ""
                        )}
                      >
                        <CardContent className="pt-3 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isBuy ? (
                                <TrendingUp className="h-4 w-4 text-blue-500" />
                              ) : (
                                <TrendingDown className={cn(
                                  "h-4 w-4",
                                  isProfitable ? "text-green-500" : isLosing ? "text-red-500" : "text-muted-foreground"
                                )} />
                              )}
                              <Badge
                                variant={isBuy ? "default" : isProfitable ? "default" : isLosing ? "destructive" : "secondary"}
                              >
                                {trade.action}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                @ ${trade.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <div className="text-right">
                                <span className="text-muted-foreground">Confidence: </span>
                                <span className="font-medium">{(trade.confidence * 100).toFixed(1)}%</span>
                              </div>
                              <Badge variant="outline" className="capitalize">
                                {trade.regime}
                              </Badge>
                              {trade.pnl_pct !== undefined && (
                                <div className={cn(
                                  "text-right font-medium",
                                  isProfitable ? "text-green-500" : isLosing ? "text-red-500" : ""
                                )}>
                                  {formatPercent(trade.pnl_pct)}
                                </div>
                              )}
                            </div>
                          </div>
                          {trade.is_closing && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Closing position
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Walk-forward simulation only uses historical candles; after a run, the paper wallet is
          reset to the simulated final balance (same as your main demo balance in Portfolio).
        </p>
      </CardContent>
    </Card>
  );
}
