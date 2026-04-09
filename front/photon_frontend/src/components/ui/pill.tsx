'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const pillVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--pw-greyscale-200)] text-[var(--pw-greyscale-1000)]',
        outline: 'bg-transparent border border-[var(--pw-greyscale-400)] text-[var(--pw-greyscale-1000)]',
        gradient: 'bg-gradient-primary text-white',
        success: 'bg-[var(--green-success)]/10 text-[var(--green-success)]',
        warning: 'bg-[var(--chart-2)]/10 text-[var(--chart-2)]',
        error: 'bg-[var(--red-error)]/10 text-[var(--red-error)]',
      },
      size: {
        sm: 'text-[10px] px-2 py-1',
        default: 'text-xs px-3 py-1.5',
        lg: 'text-sm px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface PillProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof pillVariants> {
  icon?: React.ReactNode;
  showCheck?: boolean;
}

const Pill = React.forwardRef<HTMLDivElement, PillProps>(
  ({ className, variant, size, icon, showCheck, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(pillVariants({ variant, size }), className)}
        {...props}
      >
        {showCheck && (
          <Check className="w-3 h-3 shrink-0" style={{ color: 'var(--pw-blue-300)' }} />
        )}
        {icon && <span className="shrink-0">{icon}</span>}
        {children}
      </div>
    );
  }
);

Pill.displayName = 'Pill';

export { Pill, pillVariants };





