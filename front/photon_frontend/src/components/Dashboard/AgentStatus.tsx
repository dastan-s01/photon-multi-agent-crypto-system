'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/trading';
import Link from 'next/link';

interface AgentStatusCardProps {
  agent: Agent;
}

function AgentStatusCard({ agent }: AgentStatusCardProps) {
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

  return (
    <Card className="relative">
      <div className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', statusColor)} />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{agent.name}</CardTitle>
          </div>
          <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>
            {agent.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Last action:</p>
          <p className="text-sm font-medium">{agent.lastAction}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Updated:</p>
          <p className="text-sm font-medium">
            {new Date(agent.lastUpdated).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Messages:</p>
          <p className="text-sm font-medium">{agent.messagesProcessed}</p>
        </div>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/agents">View Details →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface AgentStatusProps {
  agents: Agent[];
}

export function AgentStatus({ agents }: AgentStatusProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {agents.map((agent) => (
        <AgentStatusCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

