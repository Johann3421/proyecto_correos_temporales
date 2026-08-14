import React from 'react';
import { Sun, Moon, LogOut, User } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  username?: string | null;
  onToggleTheme: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isConnected,
  isDark,
  username,
  onToggleTheme,
  onLogout,
}) => {
  return (
    <header className="w-full bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
        {/* Left: brand text — no icon box */}
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-sm text-surface-900 dark:text-surface-100 tracking-tight">
            tempmail
          </span>
          <span className="text-2xs font-mono text-surface-400">
            *.correos.abadgroup.tech
          </span>
        </div>

        {/* Right: status + user + controls */}
        <div className="flex items-center gap-2">
          {/* Connection indicator — just a dot and text, not a pill */}
          <span className="flex items-center gap-1.5 text-2xs font-medium text-surface-500">
            <span
              className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-ok-DEFAULT' : 'bg-warn-DEFAULT'}`}
            />
            <span className="hidden sm:inline">{isConnected ? 'conectado' : 'reconectando…'}</span>
          </span>

          {/* User */}
          {username && (
            <span className="hidden md:flex items-center gap-1 text-2xs font-mono text-surface-500 border-l border-surface-200 dark:border-surface-800 pl-2 ml-1">
              <User className="w-3 h-3" />
              {username}
            </span>
          )}

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            className="ml-1 p-1 rounded text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Cambiar tema"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Logout */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1 rounded text-surface-500 hover:text-fail-light dark:hover:text-fail-dark hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
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
