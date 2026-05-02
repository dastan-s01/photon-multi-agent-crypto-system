'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { Position } from '@/types/trading';

interface PositionTableProps {
  positions: Position[];
}

export function PositionTable({ positions }: PositionTableProps) {
  if (positions.length === 0) {
    return (
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No open positions
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <CardTitle>Open Positions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50">
                <TableHead className="font-semibold">Symbol</TableHead>
                <TableHead className="font-semibold">Quantity</TableHead>
                <TableHead className="font-semibold">Entry Price</TableHead>
                <TableHead className="font-semibold">Current Price</TableHead>
                <TableHead className="font-semibold">P&L</TableHead>
                <TableHead className="font-semibold">P&L %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((position) => {
                const quantity = typeof position.quantity === 'number' ? position.quantity : parseFloat(String(position.quantity)) || 0;
                const pnlPercent = typeof position.pnlPercent === 'number' ? position.pnlPercent : parseFloat(String(position.pnlPercent)) || 0;
                
                return (
                  <TableRow key={position.id} className="border-b border-border/30 hover:bg-card/50 transition-colors">
                    <TableCell className="font-semibold">{position.symbol}</TableCell>
                    <TableCell>{quantity.toFixed(8)}</TableCell>
                    <TableCell>{formatCurrency(position.entryPrice)}</TableCell>
                    <TableCell>{formatCurrency(position.currentPrice)}</TableCell>
                    <TableCell
                      className={
                        position.pnl >= 0
                          ? 'text-green-400 font-semibold'
                          : 'text-red-400 font-semibold'
                      }
                    >
                      {position.pnl >= 0 ? '+' : ''}
                      {formatCurrency(position.pnl)}
                    </TableCell>
                    <TableCell
                      className={
                        pnlPercent >= 0
                          ? 'text-green-400 font-semibold'
                          : 'text-red-400 font-semibold'
                      }
                    >
                      {pnlPercent >= 0 ? '+' : ''}
                      {pnlPercent.toFixed(2)}%
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

