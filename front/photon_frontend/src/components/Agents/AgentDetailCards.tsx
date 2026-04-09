'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, Brain, Zap, TrendingUp, TrendingDown, Minus, Zap as ZapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/trading';
import Link from 'next/link';

interface AgentDetailCardProps {
  agent: Agent;
}

function AgentDetailCard({ agent }: AgentDetailCardProps) {
  const getIcon = () => {
    switch (agent.type) {
      case 'market':
        return Activity;
      case 'decision':
        return Brain;
      case 'execution':
        return Zap;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const Icon = getIcon();
  const statusColor = getStatusColor(agent.status);

  const getGradient = () => {
    switch (agent.type) {
      case 'market':
        return 'bg-gradient-blue';
      case 'decision':
        return 'bg-gradient-yellow';
      case 'execution':
        return 'bg-gradient-green';
      default:
        return 'bg-gradient-primary';
    }
  };

  const getDecisionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return TrendingUp;
      case 'SELL':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getDecisionColor = (action: string) => {
    switch (action) {
      case 'BUY':
        return 'text-green-500';
      case 'SELL':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <Card className="card-glass hover-lift relative border-l-2 border-l-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', getGradient())}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-lg">{agent.name}</CardTitle>
          </div>
          <Badge 
            variant={agent.status === 'active' ? 'default' : 'secondary'}
            className={cn(
              agent.status === 'active' && 'bg-green-500/20 text-green-400 border-green-500/50',
              agent.status === 'idle' && 'bg-gray-500/20 text-gray-400 border-gray-500/50',
              agent.status === 'error' && 'bg-red-500/20 text-red-400 border-red-500/50'
            )}
          >
            {agent.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Exploration Mode Alert for Decision Maker */}
        {agent.type === 'decision' && (agent as any).explorationMode?.enabled && (
          <Alert className="border-blue-500/50 bg-blue-500/10 p-3">
            <ZapIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-xs">
              <span className="font-semibold text-blue-400">Exploration Mode</span>
              <br />
              {(agent as any).explorationMode.reason}
            </AlertDescription>
          </Alert>
        )}

        {/* Latest decisions for Decision Maker */}
        {agent.type === 'decision' && (agent as any).recentDecisions && (agent as any).recentDecisions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Recent Decisions</p>
            <div className="space-y-1.5">
              {(agent as any).recentDecisions.slice(0, 3).map((decision: any, idx: number) => {
                const DecisionIcon = getDecisionIcon(decision.action);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded bg-muted/20 border border-border/50"
                  >
                    <DecisionIcon className={cn('h-4 w-4', getDecisionColor(decision.action))} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">
                        {decision.action} {decision.symbol}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Confidence: {decision.confidence.toFixed(1)}%
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        decision.action === 'BUY'
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : decision.action === 'SELL'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                      )}
                    >
                      {decision.action}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current State Info */}
        {(agent as any).currentState && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
            {agent.type === 'decision' && (
              <>
                {(agent as any).currentState.modelType && (
                  <p className="text-xs text-foreground/80">
                    Model: {(agent as any).currentState.modelType}
                  </p>
                )}
                {(agent as any).currentState.completedTrades !== undefined && (
                  <p className="text-xs text-foreground/80">
                    Completed Trades: {(agent as any).currentState.completedTrades}
                    {(agent as any).currentState.needsMoreData && (
                      <span className="text-yellow-500"> (needs more data)</span>
                    )}
                  </p>
                )}
              </>
            )}
            {agent.type === 'execution' && (agent as any).currentState.totalTrades !== undefined && (
              <p className="text-xs text-foreground/80">
                Total Trades: {(agent as any).currentState.totalTrades}
              </p>
            )}
            {agent.type === 'market' && (
              <>
                {(agent as any).currentState.symbol && (
                  <p className="text-xs text-foreground/80">
                    Symbol: {(agent as any).currentState.symbol}
                  </p>
                )}
                {(agent as any).currentState.timeframe && (
                  <p className="text-xs text-foreground/80">
                    Timeframe: {(agent as any).currentState.timeframe}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Messages Processed</p>
          <p className="text-2xl font-bold tracking-tight">{agent.messagesProcessed}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Action</p>
          <p className="text-sm font-medium">{agent.lastAction}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Last Updated</p>
          <p className="text-sm font-medium">
            {new Date(agent.lastUpdated).toLocaleString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Recent Logs</p>
          <div className="space-y-1.5">
            {agent.logs.slice(0, 3).map((log, idx) => (
              <div key={idx} className="text-xs text-muted-foreground font-mono">
                [{new Date(log.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}] {log.message.substring(0, 60)}{log.message.length > 60 && '...'}
              </div>
            ))}
          </div>
        </div>
        <Button variant="outline" className="w-full border-border/50 hover:bg-primary/10" asChild>
          <Link href="/agents">View Details</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface AgentDetailCardsProps {
  agents: Agent[];
}

export function AgentDetailCards({ agents }: AgentDetailCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {agents.map((agent) => (
        <AgentDetailCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
