import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-semibold shadow-lg border border-slate-800 dark:border-slate-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
