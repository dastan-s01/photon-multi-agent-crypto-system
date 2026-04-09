'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Loader2, TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MetaModelTradeProps {
  onExecuted?: () => void;
}

export function MetaModelTrade({ onExecuted }: MetaModelTradeProps) {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [execute, setExecute] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [approvedAssets, setApprovedAssets] = useState<string[]>([]);

  useEffect(() => {
    // Load approved assets
    apiClient.getApprovedAssets()
      .then((data) => {
        setApprovedAssets(data.approved.map((a: any) => a.symbol));
      })
      .catch(() => {
        // Ignore errors, just use empty list
      });
  }, []);

  const runMetaModel = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiClient.runMetaModelTrade({
        symbol: symbol.trim().toUpperCase(),
        execute,
      });
      setResult(response);
      if (onExecuted) {
        onExecuted();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meta-model trade failed');
    } finally {
      setLoading(false);
    }
  };

  const isApproved = approvedAssets.length === 0 || approvedAssets.includes(symbol.trim().toUpperCase());

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AI Meta-Model Trading
          <Badge variant="secondary" className="text-xs">Advanced</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Cryptocurrency Symbol</p>
          <Input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="BTCUSDT"
            className="bg-background/60"
          />
          {!isApproved && approvedAssets.length > 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">
                This asset is not approved for meta-model trading. Approved assets: {approvedAssets.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="execute"
            checked={execute}
            onChange={(e) => setExecute(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="execute" className="text-sm text-muted-foreground cursor-pointer">
            Execute trade automatically (if decision is BUY/SELL)
          </label>
        </div>

        <Button
          className="w-full bg-blue-600 hover:bg-blue-500"
          disabled={loading || !isApproved}
          onClick={runMetaModel}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Run Meta-Model Analysis'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Decision:</span>
              <Badge
                variant={
                  result.decision.action === 'BUY'
                    ? 'default'
                    : result.decision.action === 'SELL'
                    ? 'destructive'
                    : 'secondary'
                }
                className="flex items-center gap-1"
              >
                {result.decision.action === 'BUY' && <TrendingUp className="h-3 w-3" />}
                {result.decision.action === 'SELL' && <TrendingDown className="h-3 w-3" />}
                {result.decision.action === 'HOLD' && <Minus className="h-3 w-3" />}
                {result.decision.action}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-2 font-medium">
                  {(result.decision.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Regime:</span>
                <Badge variant="outline" className="ml-2">
                  {result.decision.regime}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Price:</span>
                <span className="ml-2 font-medium">${result.decision.price.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Volume:</span>
                <span className="ml-2 font-medium">
                  {result.market_data.volume.toLocaleString()}
                </span>
              </div>
            </div>

            {result.execution && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <AlertDescription className="text-emerald-400">
                  Trade executed: {result.execution.action} {result.execution.quantity.toFixed(6)} @ ${result.execution.price.toFixed(2)}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Uses ensemble of ML models (RandomForest, GradientBoosting, XGBoost) with dynamic regime-based selection.
        </p>
      </CardContent>
    </Card>
  );
}

