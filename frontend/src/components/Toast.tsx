import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl bg-ink-900 text-paper-50 dark:bg-paper-50 dark:text-ink-900 text-xs font-semibold shadow-lift border border-ink-800 dark:border-stone-200">
        <CheckCircle2 className="h-4 w-4 text-olive-400 dark:text-olive-600 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
