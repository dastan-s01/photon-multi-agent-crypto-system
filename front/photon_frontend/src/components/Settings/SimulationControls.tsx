'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import type { SimulationSettings } from '@/types/trading';

interface SimulationControlsProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
}

export function SimulationControls({ settings, onSettingsChange }: SimulationControlsProps) {
  const [status, setStatus] = useState(settings.status);

  const handleStart = () => {
    setStatus('running');
    onSettingsChange({ ...settings, status: 'running' });
  };

  const handlePause = () => {
    setStatus('paused');
    onSettingsChange({ ...settings, status: 'paused' });
  };

  const handleStop = () => {
    setStatus('stopped');
    onSettingsChange({ ...settings, status: 'stopped' });
  };

  const handleReset = () => {
    setStatus('stopped');
    onSettingsChange({ ...settings, status: 'stopped' });
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">RUNNING</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">PAUSED</Badge>;
      case 'stopped':
        return <Badge variant="destructive">STOPPED</Badge>;
      default:
        return <Badge>UNKNOWN</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Simulation Controls</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleStart} disabled={status === 'running'} variant="default">
            <Play className="mr-2 h-4 w-4" />
            START
          </Button>
          <Button onClick={handlePause} disabled={status !== 'running'} variant="secondary">
            <Pause className="mr-2 h-4 w-4" />
            PAUSE
          </Button>
          <Button onClick={handleStop} disabled={status === 'stopped'} variant="destructive">
            <Square className="mr-2 h-4 w-4" />
            STOP
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            RESET
          </Button>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Simulation Speed</label>
          <Select
            value={settings.speed.toString()}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, speed: parseFloat(value) as typeof settings.speed })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x (Slower)</SelectItem>
              <SelectItem value="1">1x (Normal)</SelectItem>
              <SelectItem value="2">2x (Fast)</SelectItem>
              <SelectItem value="4">4x (Very Fast)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Will update data {settings.speed}x faster
          </p>
        </div>
        {status === 'running' && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
            <p className="text-sm text-green-600 dark:text-green-400">
              Simulation is RUNNING. Updating every {1 / settings.speed} second(s).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

