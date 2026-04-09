'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  heading: React.ReactNode;
}

export function DashboardHeader({ heading }: DashboardHeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="dashboard-header flex h-16 shrink-0 items-center gap-2 border-b border-white/10 dark:border-white/10 border-black/10 px-4 bg-[var(--dashboard-background-card)] backdrop-blur-[50px]">
      <SidebarTrigger className="-ml-1 text-white dark:text-white text-black hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5" />
      <Separator orientation="vertical" className="mr-2 h-4 bg-white/10 dark:bg-white/10 bg-black/10" />
      <div className="flex-1 text-white dark:text-white text-black">{heading}</div>
      <div className="flex items-center gap-4">
        {mounted && currentTime && (
          <div className="text-sm font-medium text-white/70 dark:text-white/70 text-black/70">{formatTime(currentTime)}</div>
        )}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="hover:bg-white/5 dark:hover:bg-white/5 hover:bg-black/5 text-white dark:text-white text-black"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
      </div>
    </header>
  );
}

