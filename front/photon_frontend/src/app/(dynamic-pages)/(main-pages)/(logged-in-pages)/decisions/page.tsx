'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDecisions } from '@/hooks/use-decisions';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { toast } from 'sonner';
import type { Decision } from '@/types/trading';

function CreateDecisionDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    action: 'BUY' as 'BUY' | 'SELL' | 'HOLD',
    confidence: 50,
    reasoning: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // This would need to be implemented in the hook
      // await createDecision(formData);
      toast.success('Decision created successfully');
      setOpen(false);
      setFormData({ symbol: '', action: 'BUY', confidence: 50, reasoning: '' });
      onCreated();
    } catch (error) {
      toast.error('Failed to create decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Decision
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Decision</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Symbol</label>
            <Input
              value={formData.symbol}
              onChange={(e) => setFormData(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              placeholder="BTCUSDT"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Action</label>
            <Select value={formData.action} onValueChange={(value: 'BUY' | 'SELL' | 'HOLD') => setFormData(prev => ({ ...prev, action: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUY">BUY</SelectItem>
                <SelectItem value="SELL">SELL</SelectItem>
                <SelectItem value="HOLD">HOLD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Confidence (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.confidence}
              onChange={(e) => setFormData(prev => ({ ...prev, confidence: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reasoning</label>
            <Textarea
              value={formData.reasoning}
              onChange={(e) => setFormData(prev => ({ ...prev, reasoning: e.target.value }))}
              placeholder="Explain the reasoning for this decision..."
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? 'Creating...' : 'Create Decision'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DecisionRow({ decision }: { decision: Decision }) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'SELL':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{decision.symbol}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {getActionIcon(decision.action)}
          {decision.action}
        </div>
      </TableCell>
      <TableCell>{decision.confidence}%</TableCell>
      <TableCell>
        <Badge className={getStatusColor(decision.status)}>
          {decision.status.toUpperCase()}
        </Badge>
      </TableCell>
      <TableCell className="max-w-xs truncate" title={decision.reasoning}>
        {decision.reasoning}
      </TableCell>
      <TableCell>
        {decision.createdAt.toLocaleDateString()}
      </TableCell>
      <TableCell>
        {decision.executedAt ? decision.executedAt.toLocaleDateString() : '-'}
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Button size="sm" variant="outline">
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function DecisionsPage() {
  const { decisions, loading: decisionsLoading, error: decisionsError, createDecision } = useDecisions();

  if (decisionsLoading && decisions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading decisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Decisions</h2>
          <p className="text-muted-foreground mt-1">Manage trading decisions and their execution</p>
        </div>
        <CreateDecisionDialog onCreated={() => {}} />
      </div>

      {decisionsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{decisionsError}</AlertDescription>
        </Alert>
      )}

      {/* Decisions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reasoning</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Executed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions.map((decision) => (
                <DecisionRow key={decision.id} decision={decision} />
              ))}
              {decisions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No decisions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}





