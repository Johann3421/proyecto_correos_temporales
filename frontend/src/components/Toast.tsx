import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-scale-in">
      <div className="flex items-center gap-2.5 px-4 py-3 bg-obsidian-850 border border-brand-500/40 text-slate-100 text-sm font-medium rounded-xl shadow-xl shadow-brand-500/10 backdrop-blur-md">
        <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
        <span>{message}</span>
      </div>
    </div>
  );
};
