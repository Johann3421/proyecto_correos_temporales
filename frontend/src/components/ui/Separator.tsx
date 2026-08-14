import React from 'react';
import { clsx } from 'clsx';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
}

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ orientation = 'horizontal', decorative = true, className = '', ...props }, ref) => (
    <hr
      ref={ref}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      className={clsx(
        'border-0 bg-charcoal-200 dark:bg-ink-800',
        orientation === 'horizontal' ? 'w-full h-px' : 'h-full w-px',
        className
      )}
      {...props}
    />
  )
);

Separator.displayName = 'Separator';