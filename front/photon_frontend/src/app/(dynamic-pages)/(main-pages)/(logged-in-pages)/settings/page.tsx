'use client';

import { SimulationControls } from '@/components/Settings/SimulationControls';
import { DataSourceSettings } from '@/components/Settings/DataSourceSettings';
import { ModelSettings } from '@/components/Settings/ModelSettings';
import { TradingPreferences } from '@/components/Settings/TradingPreferences';
import { useSettings } from '@/hooks/use-settings';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { SimulationSettings } from '@/types/trading';

export default function SettingsPage() {
  const { settings, loading, error, updateSettings } = useSettings();

  const handleSettingsChange = async (newSettings: SimulationSettings) => {
    try {
      await updateSettings(newSettings);
      toast.success('Settings updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings');
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-8" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading settings</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <SimulationControls settings={settings} onSettingsChange={handleSettingsChange} />
        <DataSourceSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <ModelSettings settings={settings} onSettingsChange={handleSettingsChange} />
        <TradingPreferences settings={settings} onSettingsChange={handleSettingsChange} />
      </div>
    </div>
  );
}

