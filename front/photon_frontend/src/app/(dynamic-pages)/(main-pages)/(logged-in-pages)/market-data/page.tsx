'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMarketData, useLatestMarketData } from '@/hooks/use-market-data';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

function MarketDataTable() {
  const { data, loading, error, refreshData } = useMarketData(100);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
      toast.success('Market data refreshed');
    } catch (error) {
      toast.error('Failed to refresh market data');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    );
  }

  if (error && !data.length) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading market data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Market Data History</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>${item.price.toFixed(2)}</TableCell>
                <TableCell>{item.volume.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.source}</Badge>
                </TableCell>
                <TableCell>
                  {item.timestamp.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No market data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function LatestMarketData() {
  const { data, loading, error } = useLatestMarketData();

  if (loading && !data.length) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (error && !data.length) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading latest data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Market Data</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => {
            const isPositive = item.change >= 0;
            return (
              <Card key={item.symbol} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{item.symbol}</h3>
                    <p className="text-2xl font-bold">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-medium">
                        {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ${item.change.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-sm text-muted-foreground">
                  <span>Volume: {item.volume.toLocaleString()}</span>
                  <span>{item.timestamp.toLocaleTimeString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketDataPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Market Data</h2>
          <p className="text-muted-foreground mt-1">View and manage market data feeds</p>
        </div>
      </div>

      <div className="space-y-6">
        <LatestMarketData />
        <MarketDataTable />
      </div>
    </div>
  );
}





