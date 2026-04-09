'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { SimulationSettings } from '@/types/trading';

interface DataSourceSettingsProps {
  settings: SimulationSettings;
  onSettingsChange: (settings: SimulationSettings) => void;
}

export function DataSourceSettings({ settings, onSettingsChange }: DataSourceSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Source Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="symbol">Symbol</Label>
          <Select
            value={settings.symbol}
            onValueChange={(value) => onSettingsChange({ ...settings, symbol: value })}
          >
            <SelectTrigger id="symbol">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AAPL">AAPL</SelectItem>
              <SelectItem value="MSFT">MSFT</SelectItem>
              <SelectItem value="GOOGL">GOOGL</SelectItem>
              <SelectItem value="TSLA">TSLA</SelectItem>
              <SelectItem value="AMZN">AMZN</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Loads last 1 year of daily data
          </p>
        </div>
        <div>
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select
            value={settings.timeframe}
            onValueChange={(value) =>
              onSettingsChange({ ...settings, timeframe: value as typeof settings.timeframe })
            }
          >
            <SelectTrigger id="timeframe">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5m">5m</SelectItem>
              <SelectItem value="15m">15m</SelectItem>
              <SelectItem value="1h">1h</SelectItem>
              <SelectItem value="4h">4h</SelectItem>
              <SelectItem value="1d">1d</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Historical data is used for simulation
          </p>
        </div>
        <div>
          <Label htmlFor="provider">Data Provider</Label>
          <Select
            value={settings.dataProvider}
            onValueChange={(value) => onSettingsChange({ ...settings, dataProvider: value })}
          >
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Yahoo Finance">Yahoo Finance</SelectItem>
              <SelectItem value="Alpha Vantage">Alpha Vantage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="history">History Length</Label>
          <Select
            value={settings.historyLength}
            onValueChange={(value) => onSettingsChange({ ...settings, historyLength: value })}
          >
            <SelectTrigger id="history">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Last month">Last month</SelectItem>
              <SelectItem value="Last 3m">Last 3 months</SelectItem>
              <SelectItem value="Last 6m">Last 6 months</SelectItem>
              <SelectItem value="Last 1 year">Last 1 year</SelectItem>
              <SelectItem value="All">All</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            More data = more accurate model, but slower
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

