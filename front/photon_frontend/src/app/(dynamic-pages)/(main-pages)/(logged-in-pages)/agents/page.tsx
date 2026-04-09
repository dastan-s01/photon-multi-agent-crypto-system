'use client';

import { AgentDetailCards } from '@/components/Agents/AgentDetailCards';
import { MessageTimeline } from '@/components/Agents/MessageTimeline';
import { CommunicationFlow } from '@/components/Agents/CommunicationFlow';
import { AgentWorkflowVisualization } from '@/components/Agents/AgentWorkflowVisualization';
import { DecisionExplainer } from '@/components/Agents/DecisionExplainer';
import { MetaModelTrade } from '@/components/Portfolio/MetaModelTrade';
import { useAgents, useMessages } from '@/hooks/use-agents';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function AgentsPage() {
  const { agents, loading: agentsLoading, error: agentsError } = useAgents();
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(50);

  if (agentsLoading && agents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading agents data...</p>
        </div>
      </div>
    );
  }

  if (agentsError && agents.length === 0) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading agents</AlertTitle>
          <AlertDescription>{agentsError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Get Decision Maker agent and its latest decision
  const decisionAgent = agents.find((agent) => agent.type === 'decision');
  const latestDecision = (decisionAgent as any)?.recentDecisions?.[0];
  const explorationMode = (decisionAgent as any)?.explorationMode;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agents</h2>
          <p className="text-muted-foreground mt-1">Monitor and understand your multi-agent trading system</p>
        </div>
      </div>

      {(agentsError || messagesError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{agentsError || messagesError}</AlertDescription>
        </Alert>
      )}

      {/* Agent Workflow Visualization */}
      <AgentWorkflowVisualization agents={agents} />

      {/* Meta-Model Trading */}
      <MetaModelTrade />

      {/* Agent Details Cards */}
      <AgentDetailCards agents={agents} />

      {/* Latest Decision Analysis (if any) */}
      {latestDecision && (
        <DecisionExplainer decision={latestDecision} explorationMode={explorationMode} />
      )}

      {/* Messages and Communication */}
      <div className="grid gap-6 md:grid-cols-2">
        <MessageTimeline messages={messages} />
        <CommunicationFlow />
      </div>
    </div>
  );
}

