'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pill } from './pill';

export interface HeroPanelProps {
  title: string | React.ReactNode;
  features?: Array<{
    icon?: React.ReactNode;
    label: string;
  }>;
  pills?: Array<{
    label: string;
    badge?: string;
  }>;
  disclosures?: React.ReactNode;
  className?: string;
}

const HeroPanel = React.forwardRef<HTMLDivElement, HeroPanelProps>(
  ({ title, features, pills, disclosures, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-6',
          'bg-gradient-to-br from-[#e5ebff] to-white',
          'p-8 md:p-12 rounded-2xl',
          className
        )}
        {...props}
      >
        <div className="flex flex-col gap-4">
          {typeof title === 'string' ? (
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-tight">
              {title}
            </h1>
          ) : (
            title
          )}
        </div>

        {features && features.length > 0 && (
          <ul className="flex flex-col gap-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                {feature.icon && (
                  <div className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
                    {feature.icon}
                  </div>
                )}
                <span className="text-sm text-[#516880]">
                  {feature.label}
                </span>
              </li>
            ))}
          </ul>
        )}

        {pills && pills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pills.map((pill, index) => (
              <Pill
                key={index}
                variant="default"
                showCheck
                className="bg-white/80 backdrop-blur-sm"
              >
                {pill.label}
                {pill.badge && (
                  <span className="ml-1 text-[10px] opacity-70">{pill.badge}</span>
                )}
              </Pill>
            ))}
          </div>
        )}

        {disclosures && (
          <div className="mt-4 pt-4 border-t border-[#eef0f2]">
            {disclosures}
          </div>
        )}
      </div>
    );
  }
);

HeroPanel.displayName = 'HeroPanel';

export { HeroPanel };





