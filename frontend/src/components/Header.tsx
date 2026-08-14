import React from 'react';
import { clsx } from 'clsx';
import { Wifi, WifiOff, Sun, Moon, Shield } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isDark, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-charcoal-200 dark:border-ink-800 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-sage-600 dark:text-sage-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-heading-md font-bold text-charcoal-900 dark:text-charcoal-100">
              TempMail
              <span className="text-sage-600 dark:text-sage-400">.</span>
            </h1>
            <p className="text-caption text-charcoal-500 dark:text-charcoal-400 hidden sm:block">
              Correo temporal simple y privado
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-caption font-medium border transition-all',
              isConnected
                ? 'bg-success-light dark:bg-success-dark/20 text-success-dark dark:text-success-light border-success-dark/30'
                : 'bg-warning-light dark:bg-warning-dark/20 text-warning-dark dark:text-warning-light border-warning-dark/30'
            )}
            title={isConnected ? 'Conectado en tiempo real' : 'Reconectando...'}
          >
            {isConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-success-DEFAULT animate-pulse" aria-hidden="true" />
                <Wifi className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">En vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 animate-bounce" aria-hidden="true" />
                <span className="hidden sm:inline">Reconectando</span>
              </>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-100 dark:bg-ink-800 text-charcoal-600 dark:text-charcoal-300 text-caption font-medium border border-charcoal-200 dark:border-ink-700">
            <Shield className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
            <span>100% Privado</span>
          </div>

          <button
            onClick={onToggleTheme}
            className="btn-ghost btn-icon p-2 rounded-xl"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-warning-DEFAULT" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-charcoal-600" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};