'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Trade } from '@/types/trading';

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  const getActionBadgeVariant = (action: string) => {
    return action === 'BUY' ? 'default' : action === 'SELL' ? 'destructive' : 'secondary';
  };

  if (trades.length === 0) {
    return (
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Trade History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No trades yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <CardTitle>Trade History (Last 20)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="font-semibold">Time</TableHead>
                <TableHead className="font-semibold">Action</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Agent</TableHead>
                <TableHead className="text-right font-semibold">P&L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {trades.map((trade) => {
              const quantity = typeof trade.quantity === 'number' ? trade.quantity : parseFloat(String(trade.quantity)) || 0;
              
              return (
                <TableRow key={trade.id} className="border-b border-border/30 hover:bg-card/50 transition-colors">
                  <TableCell>
                    {new Date(trade.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={getActionBadgeVariant(trade.action)}
                      className={trade.action === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-500/50' : trade.action === 'SELL' ? 'bg-red-500/20 text-red-400 border-red-500/50' : ''}
                    >
                      {trade.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(trade.price)}</TableCell>
                  <TableCell>{quantity.toFixed(8)}</TableCell>
                  <TableCell className="capitalize font-medium">{trade.agent}</TableCell>
                <TableCell className="text-right">
                  {trade.pnl !== undefined ? (
                    <span
                      className={
                        trade.pnl >= 0
                          ? 'text-green-400 font-semibold'
                          : 'text-red-400 font-semibold'
                      }
                    >
                      {trade.pnl >= 0 ? '+' : ''}
                      {formatCurrency(trade.pnl)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

