'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Brain, Zap, ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/trading';

interface AgentWorkflowVisualizationProps {
  agents: Agent[];
}

export function AgentWorkflowVisualization({ agents }: AgentWorkflowVisualizationProps) {
  const getAgentByType = (type: 'market' | 'decision' | 'execution') => {
    return agents.find((agent) => agent.type === type);
  };

  const marketAgent = getAgentByType('market');
  const decisionAgent = getAgentByType('decision');
  const executionAgent = getAgentByType('execution');

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'idle':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const AgentNode = ({
    icon: Icon,
    title,
    agent,
    gradient,
  }: {
    icon: React.ElementType;
    title: string;
    agent?: Agent;
    gradient: string;
  }) => (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          'relative h-20 w-20 rounded-2xl flex items-center justify-center',
          gradient,
          agent?.status === 'active' && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
        )}
      >
        <Icon className="h-10 w-10 text-white" />
        <div className="absolute -top-1 -right-1">{getStatusIcon(agent?.status)}</div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{agent?.lastAction || 'Waiting...'}</p>
      </div>
    </div>
  );

  const Arrow = ({ active }: { active?: boolean }) => (
    <div className="flex items-center justify-center px-4">
      <ArrowRight
        className={cn('h-8 w-8', active ? 'text-primary animate-pulse' : 'text-muted-foreground/30')}
      />
    </div>
  );

  return (
    <Card className="card-glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Agent Workflow</CardTitle>
          <Badge
            variant={
              marketAgent?.status === 'active' || decisionAgent?.status === 'active'
                ? 'default'
                : 'secondary'
            }
            className={cn(
              marketAgent?.status === 'active' || decisionAgent?.status === 'active'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
            )}
          >
            {marketAgent?.status === 'active' || decisionAgent?.status === 'active'
              ? 'RUNNING'
              : 'IDLE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <AgentNode
            icon={Activity}
            title="Market Monitor"
            agent={marketAgent}
            gradient="bg-gradient-blue"
          />
          <Arrow active={marketAgent?.status === 'active'} />
          <AgentNode
            icon={Brain}
            title="Decision Maker"
            agent={decisionAgent}
            gradient="bg-gradient-yellow"
          />
          <Arrow active={decisionAgent?.status === 'active'} />
          <AgentNode
            icon={Zap}
            title="Execution"
            agent={executionAgent}
            gradient="bg-gradient-green"
          />
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">How it works:</span> Every minute, the
            Market Monitor collects market data and sends it to the Decision Maker. The Decision
            Maker analyzes the data using AI and decides whether to BUY, SELL, or HOLD. If the
            decision is BUY or SELL, the Execution Agent executes the trade.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
