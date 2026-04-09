'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { SimulationSettings } from '@/types/trading';

interface TradingPreferencesProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
}

export function TradingPreferences({ settings, onSettingsChange }: TradingPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trading Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="balance">Initial Balance</Label>
          <Input
            id="balance"
            type="number"
            value={settings.initialBalance}
            onChange={(e) =>
              onSettingsChange({ ...settings, initialBalance: parseFloat(e.target.value) || 0 })
            }
            min={1000}
            max={1000000}
            step={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Portfolio will be reset to this value
          </p>
        </div>
        <div>
          <Label htmlFor="position">Max Position Size: {settings.maxPositionSize}%</Label>
          <Slider
            id="position"
            min={10}
            max={100}
            step={5}
            value={[settings.maxPositionSize]}
            onValueChange={([value]) => onSettingsChange({ ...settings, maxPositionSize: value })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum {settings.maxPositionSize}% of balance in one position
          </p>
        </div>
        <div>
          <Label htmlFor="risk">Risk Level</Label>
          <Select
            value={settings.riskLevel}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, riskLevel: value as typeof settings.riskLevel })
            }
          >
            <SelectTrigger id="risk">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (Conservative)</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High (Aggressive)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stopLoss">Stop Loss (%)</Label>
            <Input
              id="stopLoss"
              type="number"
              value={settings.stopLoss}
              onChange={(e) =>
                onSettingsChange({ ...settings, stopLoss: parseFloat(e.target.value) || 0 })
              }
              step={0.5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Close position if loss &gt; {Math.abs(settings.stopLoss)}%
            </p>
          </div>
          <div>
            <Label htmlFor="takeProfit">Take Profit (%)</Label>
            <Input
              id="takeProfit"
              type="number"
              value={settings.takeProfit}
              onChange={(e) =>
                onSettingsChange({ ...settings, takeProfit: parseFloat(e.target.value) || 0 })
              }
              step={0.5}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Close position if profit &gt; {settings.takeProfit}%
            </p>
          </div>
        </div>
        <div>
          <Label htmlFor="leverage">Max Leverage: {settings.maxLeverage}x</Label>
          <Slider
            id="leverage"
            min={1.0}
            max={10.0}
            step={0.5}
            value={[settings.maxLeverage]}
            onValueChange={([value]) => onSettingsChange({ ...settings, maxLeverage: value })}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {settings.maxLeverage === 1.0
              ? 'No margin (1.0x = no credit)'
              : `${settings.maxLeverage}x = ${settings.maxLeverage}x position size`}
          </p>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="default" className="flex-1">
            Save Settings
          </Button>
          <Button variant="outline" className="flex-1">
            Reset to Defaults
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Settings will be applied on next start
        </p>
      </CardContent>
    </Card>
  );
}

