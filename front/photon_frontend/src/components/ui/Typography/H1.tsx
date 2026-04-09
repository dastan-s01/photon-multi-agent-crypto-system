import { cn } from '@/lib/utils';
import { ComponentProps } from 'react';

export function H1({ className, ...rest }: ComponentProps<'h1'>) {
  const classNames = cn(
    'scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl xl:text-6xl',
    'bg-gradient-to-br from-foreground via-foreground to-foreground/80',
    'bg-clip-text text-transparent',
    'leading-tight',
    className
  );
  return <h1 className={classNames} {...rest}></h1>;
}
