'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { Message } from '@/types/trading';

interface MessageTimelineProps {
  messages: Message[];
}

function MessageItem({ message }: { message: Message }) {
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'MARKET_SNAPSHOT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'TRADE_DECISION':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'EXECUTION_REPORT':
        return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const formatPayload = (payload: Message['payload']) => {
    const parts: string[] = [];
    if (payload.ticker) parts.push(`Ticker=${payload.ticker}`);
    if (payload.price) parts.push(`Price=$${payload.price.toFixed(2)}`);
    if (payload.sma) parts.push(`SMA=${payload.sma.toFixed(2)}`);
    if (payload.rsi) parts.push(`RSI=${payload.rsi.toFixed(1)}`);
    if (payload.action) parts.push(`Action=${payload.action}`);
    if (payload.quantity) parts.push(`Quantity=${payload.quantity}`);
    if (payload.confidence) parts.push(`Confidence=${(payload.confidence * 100).toFixed(1)}%`);
    if (payload.rationale) parts.push(`Rationale: ${payload.rationale}`);
    if (payload.pnl !== undefined) parts.push(`P&L=$${payload.pnl.toFixed(2)}`);
    return parts.join(', ');
  };

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      <div className="flex-shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-px h-full bg-border min-h-[40px]" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-sm font-medium">
            {message.from.charAt(0).toUpperCase() + message.from.slice(1)}Agent
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-medium">
            {message.to.charAt(0).toUpperCase() + message.to.slice(1)}Agent
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
        <Badge className={cn('mb-2', getMessageTypeColor(message.type))}>
          {message.type}
        </Badge>
        <p className="text-sm text-muted-foreground">{formatPayload(message.payload)}</p>
      </div>
    </div>
  );
}

export function MessageTimeline({ messages }: MessageTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'market' | 'decision' | 'execution'>('all');

  const filteredMessages =
    filter === 'all'
      ? messages
      : messages.filter((msg) => msg.to === filter || msg.from === filter);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>All Messages</CardTitle>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="market">→ Market</TabsTrigger>
              <TabsTrigger value="decision">→ Decision</TabsTrigger>
              <TabsTrigger value="execution">→ Execution</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {filteredMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No messages found
              </p>
            ) : (
              filteredMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

