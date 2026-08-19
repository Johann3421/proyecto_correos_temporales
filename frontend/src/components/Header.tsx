import React from 'react';
import { Sun, Moon, LogOut, User, HelpCircle, Sparkles } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  username?: string | null;
  onToggleTheme: () => void;
  onOpenSupport: () => void;
  onOpenOnboarding: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isDark,
  username,
  onToggleTheme,
  onOpenSupport,
  onOpenOnboarding,
  onLogout,
}) => {
  return (
    <header className="w-full bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-0 z-30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 h-13 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-sm text-surface-900 dark:text-surface-50 tracking-tight flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent-600" />
            AirInbox
          </span>
          <span className="hidden sm:inline text-2xs font-mono text-surface-400">
            *.correos.abadgroup.tech
          </span>
        </div>

        {/* Right: status + user + controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Connection indicator */}
          <span className="flex items-center gap-1.5 text-2xs font-medium text-surface-500">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-ok-DEFAULT animate-pulse' : 'bg-warn-DEFAULT'}`}
            />
            <span className="hidden sm:inline">{isConnected ? 'en vivo' : 'reconectando…'}</span>
          </span>

          {/* Quick guide button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-2xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title="Ver guía y funciones"
          >
            <Sparkles className="w-3 h-3 text-accent-500" />
            <span className="hidden md:inline">Guía</span>
          </button>

          {/* Support button */}
          <button
            onClick={onOpenSupport}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-2xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            title="Centro de ayuda y soporte"
          >
            <HelpCircle className="w-3.5 h-3.5 text-surface-400" />
            <span className="hidden md:inline">Soporte</span>
          </button>

          {/* User info */}
          {username && (
            <span className="hidden lg:flex items-center gap-1 text-2xs font-mono text-surface-500 border-l border-surface-200 dark:border-surface-800 pl-2.5">
              <User className="w-3 h-3 text-surface-400" />
              {username}
            </span>
          )}

          {/* Theme switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-md text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-md text-surface-500 hover:text-fail-light dark:hover:text-fail-dark hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
