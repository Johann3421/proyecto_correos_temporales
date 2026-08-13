import React from 'react';
import { Zap, Wifi, WifiOff, Sun, Moon, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isDark, onToggleTheme }) => {
  return (
    <header className="w-full border-b border-slate-200/80 dark:border-obsidian-800/80 bg-white/70 dark:bg-obsidian-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <Zap className="w-5 h-5 text-obsidian-950 fill-obsidian-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Air<span className="text-brand-500">Inbox</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400 border border-brand-500/30">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Correos temporales sin registro ni fricción
            </p>
          </div>
        </div>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-3">
          {/* WebSocket Status Indicator */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
            }`}
            title={isConnected ? 'Conexión WebSocket en tiempo real activa' : 'Conectando WebSocket...'}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden md:inline">En Vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-bounce" />
                <span className="hidden md:inline">Reconectando</span>
              </>
            )}
          </div>

          {/* Privacy badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-obsidian-700">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
            <span>100% Privado</span>
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-obsidian-800 hover:bg-slate-200 dark:hover:bg-obsidian-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-obsidian-700 transition-colors focus:outline-none"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
};
