'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import type { SimulationSettings } from '@/types/trading';

interface ModelSettingsProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
}

export function ModelSettings({ settings, onSettingsChange }: ModelSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="model">Model Type</Label>
          <Select
            value={settings.modelType}
            onValueChange={(value) => onSettingsChange({ ...settings, modelType: value })}
          >
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Random Forest">Random Forest</SelectItem>
              <SelectItem value="Logistic Regression">Logistic Regression</SelectItem>
              <SelectItem value="XGBoost">XGBoost</SelectItem>
              <SelectItem value="LSTM">LSTM</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Current accuracy on test set: 52.3%
          </p>
        </div>
        <div>
          <Label htmlFor="horizon">Prediction Horizon</Label>
          <Select
            value={settings.predictionHorizon}
            onValueChange={(value) => onSettingsChange({ ...settings, predictionHorizon: value })}
          >
            <SelectTrigger id="horizon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="30m">30 minutes</SelectItem>
              <SelectItem value="1 hour">1 hour</SelectItem>
              <SelectItem value="4h">4 hours</SelectItem>
              <SelectItem value="1d">1 day</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Model predicts price N time ahead
          </p>
        </div>
        <div>
          <Label htmlFor="confidence">Confidence Threshold: {settings.confidenceThreshold.toFixed(2)}</Label>
          <Slider
            id="confidence"
            min={0.45}
            max={0.75}
            step={0.01}
            value={[settings.confidenceThreshold]}
            onValueChange={([value]) =>
              onSettingsChange({ ...settings, confidenceThreshold: value })
            }
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            If probability &gt; {settings.confidenceThreshold.toFixed(2)}, signal BUY/SELL. Otherwise HOLD.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Load Model
          </Button>
          <Button variant="outline" className="flex-1">
            Train New
          </Button>
          <Button variant="outline" className="flex-1">
            Upload Custom
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

