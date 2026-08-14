import React from 'react';
import { Wifi, WifiOff, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isDark, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-200 dark:border-ink-800 bg-paper-50/85 dark:bg-ink-950/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-clay-600 font-serif text-lg font-semibold text-paper-50">
            t
          </span>
          <div className="leading-none">
            <h1 className="font-serif text-xl font-semibold tracking-tight text-ink-900 dark:text-paper-50">
              TempMail
            </h1>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 -mt-0.5">
              correo desechable
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live status */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-900"
            title={isConnected ? 'Recepción en tiempo real' : 'Reconectando…'}
          >
            <span className="relative flex h-2 w-2">
              {isConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive-400 opacity-60" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  isConnected ? 'bg-olive-500' : 'bg-amber-400'
                }`}
              />
            </span>
            <span className={isConnected ? 'text-olive-700 dark:text-olive-300' : 'text-amber-600 dark:text-amber-400'}>
              {isConnected ? 'En vivo' : 'Reconectando'}
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="grid h-9 w-9 place-items-center rounded-lg border border-stone-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-900 text-ink-600 dark:text-paper-200 hover:bg-stone-200 dark:hover:bg-ink-800 transition-colors"
            aria-label={isDark ? 'Usar tema claro' : 'Usar tema oscuro'}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
