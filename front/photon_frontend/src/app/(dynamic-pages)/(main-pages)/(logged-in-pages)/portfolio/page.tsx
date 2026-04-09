'use client';

import { PortfolioSummary } from '@/components/Portfolio/PortfolioSummary';
import { PositionTable } from '@/components/Portfolio/PositionTable';
import { TradeHistory } from '@/components/Portfolio/TradeHistory';
import { EquityCurve } from '@/components/Portfolio/EquityCurve';
import { TradeTicket } from '@/components/Portfolio/TradeTicket';
import { usePortfolio, usePerformanceMetrics } from '@/hooks/use-portfolio';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function PortfolioPage() {
  const { data: portfolioData, loading: portfolioLoading, error: portfolioError, refetch } = usePortfolio();
  const { data: metricsData, loading: metricsLoading, error: metricsError } = usePerformanceMetrics();

  if (portfolioLoading && !portfolioData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (portfolioError && !portfolioData) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading portfolio</AlertTitle>
          <AlertDescription>{portfolioError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!portfolioData) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
      </div>

      {(portfolioError || metricsError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{portfolioError || metricsError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <PortfolioSummary
          balance={portfolioData.balance}
          freeCash={portfolioData.freeCash}
          usedMargin={portfolioData.usedMargin}
          totalTrades={portfolioData.totalTrades}
          todayPnL={portfolioData.todayPnL}
          totalPnL={portfolioData.totalPnL}
        />
        <TradeTicket onExecuted={refetch} />
        <PositionTable positions={portfolioData.positions} />
        <TradeHistory trades={portfolioData.trades} />
        <EquityCurve
          initialBalance={portfolioData.initialBalance}
          currentBalance={portfolioData.balance}
          maxDrawdown={metricsData?.maxDrawdown || 0}
          sharpeRatio={metricsData?.sharpeRatio || 0}
        />
      </div>
    </div>
  );
}

