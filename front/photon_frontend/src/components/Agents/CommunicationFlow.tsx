'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Brain, Zap, ArrowRight } from 'lucide-react';

export function CommunicationFlow() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 py-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-blue-500/10 border-2 border-blue-500">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium">Market Monitoring</p>
            <p className="text-xs text-muted-foreground">Fetches real data</p>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
          <div className="text-xs text-muted-foreground text-center px-4 py-2 bg-muted rounded-md">
            MARKET_SNAPSHOT
            <br />
            (price, SMA, RSI)
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-purple-500/10 border-2 border-purple-500">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-medium">Decision Making</p>
            <p className="text-xs text-muted-foreground">Runs ML model</p>
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />
          <div className="text-xs text-muted-foreground text-center px-4 py-2 bg-muted rounded-md">
            TRADE_DECISION
            <br />
            (BUY/SELL/HOLD, confidence)
          </div>

          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:rotate-0" />

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-green-500/10 border-2 border-green-500">
              <Zap className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm font-medium">Execution</p>
            <p className="text-xs text-muted-foreground">Executes trade</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

