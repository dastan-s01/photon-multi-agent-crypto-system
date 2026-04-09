'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Brain, Zap, Clock, Activity, Play, Square, RefreshCw } from 'lucide-react';
import { Agent } from '@/types/trading';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAgents } from '@/hooks/use-agents';

interface LiveAgentStatusCardProps {
  agent: Agent;
  index: number;
}

const agentConfig = [
  {
    name: 'Market Monitor',
    icon: BarChart3,
    gradient: 'bg-[var(--dashboard-accent-primary)]/20',
    iconColor: 'text-[var(--dashboard-accent-primary)]',
    description: 'Monitors financial market data',
  },
  {
    name: 'Decision Maker',
    icon: Brain,
    gradient: 'bg-[var(--dashboard-accent-secondary)]/20',
    iconColor: 'text-[var(--dashboard-accent-secondary)]',
    description: 'Analyzes data and makes decisions',
  },
  {
    name: 'Executor',
    icon: Zap,
    gradient: 'bg-[var(--dashboard-accent-primary)]/20',
    iconColor: 'text-[var(--dashboard-accent-primary)]',
    description: 'Executes trades and records actions',
  },
];

export function LiveAgentStatusCard({ agent, index }: LiveAgentStatusCardProps) {
  const config = agentConfig[index];
  const Icon = config.icon;
  const isOnline = agent.status === 'active';
  const [isControlling, setIsControlling] = useState(false);
  const {
    startMarketMonitor,
    stopMarketMonitor,
    startDecisionMaker,
    stopDecisionMaker,
    startExecutionAgent,
    stopExecutionAgent,
  } = useAgents();

  const handleControl = async (action: 'start' | 'stop') => {
    setIsControlling(true);
    try {
      if (index === 0) {
        // Market Monitor
        if (action === 'start') {
          await startMarketMonitor();
          toast.success('Market Monitor started');
        } else {
          await stopMarketMonitor();
          toast.success('Market Monitor stopped');
        }
      } else if (index === 1) {
        // Decision Maker
        if (action === 'start') {
          await startDecisionMaker();
          toast.success('Decision Maker started');
        } else {
          await stopDecisionMaker();
          toast.success('Decision Maker stopped');
        }
      } else if (index === 2) {
        // Execution Agent
        if (action === 'start') {
          await startExecutionAgent();
          toast.success('Execution Agent started');
        } else {
          await stopExecutionAgent();
          toast.success('Execution Agent stopped');
        }
      }
    } catch (error) {
      toast.error(`Failed to ${action} ${config.name}`);
      console.error(`Failed to ${action} ${config.name}:`, error);
    } finally {
      setIsControlling(false);
    }
  };

  return (
    <Card className="card-glass hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', config.gradient)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <CardTitle className="text-base">{config.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
          <Badge
            variant={isOnline ? 'default' : 'secondary'}
            className={cn(
              isOnline ? 'bg-white/10 text-white/70 border-white/20' : 'bg-white/5 text-white/50 border-white/10'
            )}
          >
            <div className={cn('h-2 w-2 rounded-full mr-1.5', isOnline ? 'bg-white/70' : 'bg-white/30')} />
            {isOnline ? 'Online' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {index === 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monitoring</span>
              <span className="font-medium">15 exchanges</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data points/min</span>
              <span className="font-medium">2,450</span>
            </div>
          </div>
        )}
        {index === 1 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">Analyzing</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next decision</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                30 sec
              </span>
            </div>
          </div>
        )}
        {index === 2 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">Idle</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last trade</span>
              <span className="font-medium text-[var(--dashboard-profit)]">BTC +2.5%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Time ago</span>
              <span className="font-medium">12 min</span>
            </div>
          </div>
        )}
        <div className="pt-2 border-t border-border/50 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Last updated
            </span>
            <span className="font-medium">
              {typeof agent.lastUpdated === 'string'
                ? new Date(agent.lastUpdated).toLocaleTimeString()
                : agent.lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={isOnline ? "secondary" : "default"}
              className="flex-1 text-white dark:text-white text-black dark:bg-[var(--dashboard-accent-primary)] bg-[var(--dashboard-accent-primary)] hover:opacity-90"
              disabled={isControlling}
              onClick={() => handleControl(isOnline ? 'stop' : 'start')}
            >
              {isControlling ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : isOnline ? (
                <Square className="h-3 w-3 mr-1" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {isOnline ? 'Stop' : 'Start'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface LiveAgentStatusCardsProps {
  agents: Agent[];
}

export function LiveAgentStatusCards({ agents }: LiveAgentStatusCardsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-white dark:text-white text-black">Live Agent Status</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {agents.map((agent, index) => (
          <LiveAgentStatusCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>
    </div>
  );
}

