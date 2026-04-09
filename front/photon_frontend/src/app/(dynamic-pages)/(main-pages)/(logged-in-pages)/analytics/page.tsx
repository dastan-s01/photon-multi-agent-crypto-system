'use client';

import { PerformanceMetrics } from '@/components/Analytics/PerformanceMetrics';
import { PnLCurve } from '@/components/Analytics/PnLCurve';
import { StatisticsTable } from '@/components/Analytics/StatisticsTable';
import { MonthlyBreakdown } from '@/components/Analytics/MonthlyBreakdown';
import { usePerformanceMetrics, usePnLCurve, useMonthlyBreakdown } from '@/hooks/use-analytics';
import { usePortfolio } from '@/hooks/use-portfolio';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: metricsData, loading: metricsLoading, error: metricsError } = usePerformanceMetrics();
  const {
    data: pnlData,
    totalPnL,
    initialBalance: pnlInitial,
    currentBalance: pnlCurrent,
    loading: pnlLoading,
    error: pnlError,
  } = usePnLCurve();
  const { data: breakdownData, loading: breakdownLoading, error: breakdownError } = useMonthlyBreakdown();
  const { data: portfolioData } = usePortfolio();

  if (metricsLoading && !metricsData) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (metricsError && !metricsData) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading analytics</AlertTitle>
          <AlertDescription>{metricsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!metricsData) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
      </div>

      {(metricsError || pnlError || breakdownError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{metricsError || pnlError || breakdownError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <PerformanceMetrics metrics={metricsData} />
        <PnLCurve
          initialBalance={pnlInitial || portfolioData?.initialBalance || 10000}
          currentBalance={pnlCurrent || portfolioData?.balance || 10000}
          pnlData={pnlData}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <StatisticsTable metrics={metricsData} />
          <MonthlyBreakdown data={breakdownData} />
        </div>
      </div>
    </div>
  );
}

