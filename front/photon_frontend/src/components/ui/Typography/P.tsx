import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef } from 'react';
import { Slot } from '@radix-ui/react-slot';

export function P({
  className,
  asChild,
  ...rest
}: ComponentPropsWithoutRef<'p'> & {
  asChild?: boolean;
}) {
  const classNames = cn(
    'leading-7 text-foreground/90',
    '&:not(:first-child):mt-6',
    'text-base',
    className
  );
  const Component = asChild ? Slot : 'p';
  return <Component className={classNames} {...rest}></Component>;
}
