import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 dark:text-charcoal-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full px-4 py-3 rounded-xl bg-white dark:bg-ink-800',
              'border transition-all duration-fast',
              'text-charcoal-900 dark:text-charcoal-100 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500',
              'focus:outline-none focus:ring-2 focus:ring-sage-500/20',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              error
                ? 'border-error-DEFAULT focus:border-error-DEFAULT focus:ring-error-DEFAULT/20'
                : 'border-charcoal-300 dark:border-ink-700 hover:border-charcoal-400 dark:hover:border-ink-600 focus:border-sage-500',
              'disabled:bg-charcoal-100 dark:disabled:bg-ink-800 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 dark:text-charcoal-500 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-body-sm text-error-dark dark:text-error-light flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1.5 text-body-sm text-charcoal-500 dark:text-charcoal-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';