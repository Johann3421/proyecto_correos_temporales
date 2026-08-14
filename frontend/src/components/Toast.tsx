import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-down">
      <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-island border border-white/80 dark:border-white/15 text-studio-900 dark:text-white text-xs sm:text-sm font-bold shadow-island backdrop-blur-2xl">
        <Sparkles className="w-4 h-4 text-apple-blue dark:text-apple-blueDark animate-pulse" />
        <span>{message}</span>
      </div>
    </div>
  );
};
