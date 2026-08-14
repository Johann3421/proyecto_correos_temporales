import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', dot = false, className = '', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-charcoal-100 dark:bg-ink-800 text-charcoal-700 dark:text-charcoal-300 border border-charcoal-200 dark:border-ink-700',
      success: 'bg-success-light text-success-dark dark:bg-success-dark/20 dark:text-success-light',
      warning: 'bg-warning-light text-warning-dark dark:bg-warning-dark/20 dark:text-warning-light',
      error: 'bg-error-light text-error-dark dark:bg-error-dark/20 dark:text-error-light',
      info: 'bg-info-light text-info-dark dark:bg-info-dark/20 dark:text-info-light',
      outline: 'bg-transparent text-charcoal-600 dark:text-charcoal-400 border border-charcoal-300 dark:border-ink-600',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 rounded-full text-[0.6875rem] gap-1',
      md: 'px-2.5 py-1 rounded-full text-caption gap-1.5',
    };

    const dotColors = {
      default: 'bg-charcoal-400',
      success: 'bg-success-DEFAULT',
      warning: 'bg-warning-DEFAULT',
      error: 'bg-error-DEFAULT',
      info: 'bg-info-DEFAULT',
      outline: 'bg-charcoal-400',
    };

    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center font-medium transition-colors duration-fast',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant])} aria-hidden="true" />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';