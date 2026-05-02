'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetaModelTrade } from './MetaModelTrade';
import { MetaModelBacktest } from './MetaModelBacktest';

interface TradeTicketProps {
  onExecuted?: () => void;
}

export function TradeTicket({ onExecuted }: TradeTicketProps) {
  return (
    <Tabs defaultValue="meta-model" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="meta-model">AI Meta-Model</TabsTrigger>
        <TabsTrigger value="backtest">Backtest</TabsTrigger>
      </TabsList>
      <TabsContent value="meta-model">
        <MetaModelTrade onExecuted={onExecuted} />
      </TabsContent>
      <TabsContent value="backtest">
        <MetaModelBacktest onComplete={onExecuted} />
      </TabsContent>
    </Tabs>
  );
}
