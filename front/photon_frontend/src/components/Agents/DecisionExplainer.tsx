'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DecisionData {
  id: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  symbol: string;
  timestamp: Date;
  metadata: {
    risk_score?: number;
    quantity?: number;
    model_type?: string;
    indicators?: Record<string, any>;
    analysis?: Record<string, any>;
  };
}

interface DecisionExplainerProps {
  decision: DecisionData;
  explorationMode?: {
    enabled: boolean;
    reason?: string;
    confidenceThreshold?: number;
  };
}

export function DecisionExplainer({ decision, explorationMode }: DecisionExplainerProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return TrendingUp;
      case 'SELL':
        return TrendingDown;
      case 'HOLD':
      default:
        return Minus;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'text-green-500';
      case 'SELL':
        return 'text-red-500';
      case 'HOLD':
      default:
        return 'text-yellow-500';
    }
  };

  const getActionBgColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'bg-green-500/20 border-green-500/50';
      case 'SELL':
        return 'bg-red-500/20 border-red-500/50';
      case 'HOLD':
      default:
        return 'bg-yellow-500/20 border-yellow-500/50';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'High';
    if (confidence >= 0.5) return 'Medium';
    if (confidence >= 0.35) return 'Low';
    return 'Very Low';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-500';
    if (confidence >= 0.5) return 'text-yellow-500';
    if (confidence >= 0.35) return 'text-orange-500';
    return 'text-red-500';
  };

  const ActionIcon = getActionIcon(decision.action);
  const confidencePercent = decision.confidence;
  const confidenceLabel = getConfidenceLabel(confidencePercent / 100);

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Decision Analysis
          </CardTitle>
          <Badge variant="outline" className={cn(getActionBgColor(decision.action))}>
            {decision.action}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exploration Mode Alert */}
        {explorationMode?.enabled && (
          <Alert className="border-blue-500/50 bg-blue-500/10">
            <Zap className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <span className="font-semibold text-blue-400">Exploration Mode Active:</span>{' '}
              {explorationMode.reason || 'Collecting data for model training'}
              {explorationMode.confidenceThreshold && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  Confidence threshold lowered to {explorationMode.confidenceThreshold * 100}% to
                  allow more trades
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Decision Summary */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
          <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', getActionBgColor(decision.action))}>
            <ActionIcon className={cn('h-6 w-6', getActionColor(decision.action))} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">
              {decision.action} {decision.metadata.quantity || 0} {decision.symbol}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(decision.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('text-lg font-bold', getConfidenceColor(confidencePercent / 100))}>
              {confidencePercent.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">{confidenceLabel} Confidence</p>
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
            Reasoning
          </p>
          <p className="text-sm text-foreground/90">{decision.reasoning}</p>
        </div>

        {/* Technical Indicators */}
        {decision.metadata.indicators && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Technical Indicators
            </p>
            <div className="grid grid-cols-2 gap-2">
              {decision.metadata.indicators.rsi14 && (
                <div className="p-2 rounded bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground">RSI(14)</p>
                  <p className="text-sm font-semibold">
                    {decision.metadata.indicators.rsi14.toFixed(1)}
                  </p>
                </div>
              )}
              {decision.metadata.indicators.macd && (
                <div className="p-2 rounded bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground">MACD</p>
                  <p className="text-sm font-semibold">
                    {decision.metadata.indicators.macd.toFixed(2)}
                  </p>
                </div>
              )}
              {decision.metadata.indicators.sma10 && (
                <div className="p-2 rounded bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground">SMA(10)</p>
                  <p className="text-sm font-semibold">
                    {decision.metadata.indicators.sma10.toFixed(2)}
                  </p>
                </div>
              )}
              {decision.metadata.indicators.sma20 && (
                <div className="p-2 rounded bg-muted/20 border border-border/50">
                  <p className="text-xs text-muted-foreground">SMA(20)</p>
                  <p className="text-sm font-semibold">
                    {decision.metadata.indicators.sma20.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Market Analysis */}
        {decision.metadata.analysis && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Market Analysis
            </p>
            <div className="space-y-1">
              {decision.metadata.analysis.trend && (
                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/50">
                  <span className="text-xs text-muted-foreground">Trend</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      decision.metadata.analysis.trend === 'bull'
                        ? 'bg-green-500/20 text-green-400 border-green-500/50'
                        : decision.metadata.analysis.trend === 'bear'
                          ? 'bg-red-500/20 text-red-400 border-red-500/50'
                          : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    )}
                  >
                    {decision.metadata.analysis.trend.toUpperCase()}
                  </Badge>
                </div>
              )}
              {decision.metadata.analysis.strength !== undefined && (
                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border border-border/50">
                  <span className="text-xs text-muted-foreground">Strength</span>
                  <span className="text-sm font-semibold">
                    {(decision.metadata.analysis.strength * 100).toFixed(0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Model Info */}
        {decision.metadata.model_type && (
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs text-muted-foreground">
              Model: <span className="font-semibold text-foreground">{decision.metadata.model_type}</span>
            </p>
            {decision.metadata.risk_score !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Risk Score: <span className="font-semibold text-foreground">{(decision.metadata.risk_score * 100).toFixed(0)}%</span>
              </p>
            )}
          </div>
        )}

        {/* Why HOLD? */}
        {decision.action === 'HOLD' && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              <span className="font-semibold text-yellow-400">Why HOLD?</span>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground list-disc list-inside">
                <li>
                  Confidence {confidencePercent.toFixed(1)}% is below threshold (
                  {explorationMode?.enabled ? '35%' : '55%'})
                </li>
                <li>Mixed or unclear market signals</li>
                <li>Risk score may be too high for current conditions</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
