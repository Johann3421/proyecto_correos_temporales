import React from 'react';
import { Check } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 px-3 py-2 rounded-md bg-surface-900 dark:bg-surface-100 text-surface-50 dark:text-surface-900 text-xs font-medium shadow-md">
        <Check className="h-3.5 w-3.5 text-ok-dark dark:text-ok-light shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
