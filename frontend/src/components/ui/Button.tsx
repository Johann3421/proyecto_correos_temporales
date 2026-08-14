import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2 font-medium transition-all duration-fast ease-out-expo
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none
    `;

    const variantStyles = {
      primary: 'bg-sage-600 text-white hover:bg-sage-700 active:bg-sage-800 shadow-soft hover:shadow-medium',
      secondary: 'bg-charcoal-100 dark:bg-ink-800 text-charcoal-700 dark:text-charcoal-200 border border-charcoal-200 dark:border-ink-700 hover:bg-charcoal-200 dark:hover:bg-ink-700 active:bg-charcoal-300 dark:active:bg-ink-600',
      ghost: 'bg-transparent text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-ink-800 active:bg-charcoal-200 dark:active:bg-ink-700',
      danger: 'bg-error-light text-error-dark hover:bg-error-light/80 border border-error-dark/20',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 rounded-lg text-body-sm gap-1.5',
      md: 'px-4 py-2.5 rounded-xl text-body-sm gap-2',
      lg: 'px-6 py-3 rounded-xl text-body-md gap-2',
    };

    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], widthStyles, className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin-slow"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
          </svg>
        ) : leftIcon ? (
          <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';