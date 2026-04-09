'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  valueColor?: 'positive' | 'negative' | 'neutral';
  className?: string;
}

function KPICard({ icon: Icon, label, value, change, changeType = 'neutral', valueColor = 'neutral', className }: KPICardProps) {
  return (
    <Card className={cn('card-glass hover-lift', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-[var(--dashboard-accent-primary)]/20 flex items-center justify-center">
          <Icon className="h-4 w-4 text-[var(--dashboard-accent-primary)]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold tracking-tight",
          valueColor === 'positive' && 'text-[var(--dashboard-profit)]',
          valueColor === 'negative' && 'text-[var(--dashboard-loss)]',
          valueColor === 'neutral' && 'text-white dark:text-white text-black'
        )}>{value}</div>
        {change && (
          <p
            className={cn(
              'text-xs mt-1.5',
              changeType === 'positive' && 'text-[var(--dashboard-profit)]',
              changeType === 'negative' && 'text-[var(--dashboard-loss)]',
              changeType === 'neutral' && 'text-white/50 dark:text-white/50 text-black/50'
            )}
          >
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface KPICardsProps {
  balance: number;
  todayPnL: number;
  winRate: number;
  agentsStatus: string;
}

export function KPICards({ balance, todayPnL, winRate, agentsStatus }: KPICardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const initialBalance = 10000;
  const balanceChange = balance - initialBalance;
  const balanceChangePercent = (balanceChange / initialBalance) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        icon={Wallet}
        label="Portfolio Balance"
        value={formatCurrency(balance)}
        change={
          balanceChange !== 0
            ? `${balanceChange >= 0 ? '+' : ''}${formatCurrency(balanceChange)} (${balanceChangePercent >= 0 ? '+' : ''}${balanceChangePercent.toFixed(2)}%)`
            : undefined
        }
        changeType={balanceChange >= 0 ? 'positive' : balanceChange < 0 ? 'negative' : 'neutral'}
      />
      <KPICard
        icon={TrendingUp}
        label="Today's P&L"
        value={formatCurrency(todayPnL)}
        valueColor={todayPnL >= 0 ? 'positive' : 'negative'}
        changeType={todayPnL >= 0 ? 'positive' : 'negative'}
      />
      <KPICard
        icon={Target}
        label="Win Rate"
        value={formatPercent(winRate)}
        changeType="positive"
      />
      <KPICard
        icon={Zap}
        label="Agents Status"
        value={agentsStatus}
        changeType="positive"
      />
    </div>
  );
}

