import React from 'react';
import { clsx } from 'clsx';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'overlay';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', padding = 'md', className = '', ...props }, ref) => {
    const variantStyles = {
      default: 'bg-white dark:bg-ink-900 border border-charcoal-200 dark:border-ink-800 shadow-soft dark:shadow-medium',
      elevated: 'bg-white dark:bg-ink-900 border border-charcoal-200 dark:border-ink-800 shadow-medium dark:shadow-strong',
      overlay: 'bg-white/95 dark:bg-ink-900/95 backdrop-blur-sm border border-charcoal-200/80 dark:border-ink-800/80 shadow-strong dark:shadow-strong',
    };

    const paddingStyles = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-2xl',
          variantStyles[variant],
          paddingStyles[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={clsx('mb-4', className)} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ children, className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={clsx('text-heading-md text-charcoal-900 dark:text-charcoal-100', className)}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ children, className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={clsx('mt-1 text-body-sm text-charcoal-500 dark:text-charcoal-400', className)}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div ref={ref} className={clsx('', className)} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={clsx('mt-4 pt-4 border-t border-charcoal-200 dark:border-ink-800 flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';