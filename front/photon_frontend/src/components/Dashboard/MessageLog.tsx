'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/trading';
import { useEffect, useRef } from 'react';

interface MessageLogProps {
  messages: Message[];
}

function MessageItem({ message }: { message: Message }) {
  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'MARKET_SNAPSHOT':
        return 'bg-[var(--dashboard-accent-primary)]/10 text-[var(--dashboard-accent-primary)] border-[var(--dashboard-accent-primary)]/20';
      case 'TRADE_DECISION':
        return 'bg-[var(--dashboard-accent-secondary)]/10 text-[var(--dashboard-accent-secondary)] border-[var(--dashboard-accent-secondary)]/20';
      case 'EXECUTION_REPORT':
        return 'bg-[var(--dashboard-accent-primary)]/10 text-[var(--dashboard-accent-primary)] border-[var(--dashboard-accent-primary)]/20';
      default:
        return 'bg-white/5 text-white/70 border-white/10';
    }
  };

  const formatPayload = (payload: Message['payload']) => {
    const parts: string[] = [];
    if (payload.price) parts.push(`Price=$${payload.price.toFixed(2)}`);
    if (payload.sma) parts.push(`SMA=${payload.sma.toFixed(2)}`);
    if (payload.rsi) parts.push(`RSI=${payload.rsi.toFixed(1)}`);
    if (payload.action) parts.push(`Action=${payload.action}`);
    if (payload.confidence) parts.push(`Confidence=${(payload.confidence * 100).toFixed(1)}%`);
    if (payload.pnl !== undefined) parts.push(`P&L=$${payload.pnl.toFixed(2)}`);
    return parts.join(', ');
  };

  return (
    <div className="flex gap-3 py-3 px-2 rounded-lg hover:bg-card/50 transition-colors border-b border-border/30 last:border-0">
      <div className="flex-shrink-0">
        <div className="flex flex-col items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[var(--dashboard-accent-primary)]" />
          <div className="w-px h-full bg-white/10" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <span className="text-sm font-semibold">
            {message.from.charAt(0).toUpperCase() + message.from.slice(1)}Agent
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="text-sm font-semibold">
            {message.to.charAt(0).toUpperCase() + message.to.slice(1)}Agent
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
        <Badge className={cn('mb-1.5 text-xs', getMessageTypeColor(message.type))}>
          {message.type}
        </Badge>
        <p className="text-sm text-muted-foreground">{formatPayload(message.payload)}</p>
      </div>
    </div>
  );
}

export function MessageLog({ messages }: MessageLogProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="card-glass hover-lift">
      <CardHeader>
        <CardTitle>Agent Communication Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={scrollAreaRef}>
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No messages yet
                </p>
              ) : (
                messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

