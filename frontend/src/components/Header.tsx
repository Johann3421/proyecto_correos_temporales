import React from 'react';
import { Wifi, WifiOff, Sun, Moon, Shield, Sparkles, Inbox } from 'lucide-react';

interface HeaderProps {
  isConnected: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isDark, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-white/65 dark:bg-studio-950/65 border-b border-black/[0.05] dark:border-white/[0.08] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand with macOS Glass Icon */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-apple-blue to-apple-purple p-[1px] shadow-glow-blue/40 shadow-lg">
            <div className="w-full h-full rounded-[15px] bg-white/90 dark:bg-studio-900/90 backdrop-blur-sm flex items-center justify-center">
              <Inbox className="w-5 h-5 text-apple-blue dark:text-apple-blueDark" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-studio-900 dark:text-white">
                AirInbox
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-apple-blue/10 dark:bg-apple-blueDark/20 text-apple-blue dark:text-apple-blueDark border border-apple-blue/20 dark:border-apple-blueDark/30">
                Pro
              </span>
            </div>
            <p className="text-[11px] text-studio-500 dark:text-studio-400 font-medium hidden sm:block">
              Correos temporales instantáneos con diseño macOS
            </p>
          </div>
        </div>

        {/* Right Status Capsule */}
        <div className="flex items-center gap-2.5">
          {/* Live WebSocket Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all ${
              isConnected
                ? 'bg-apple-green/10 text-apple-green border border-apple-green/30 shadow-glow-green/20'
                : 'bg-apple-amber/10 text-apple-amber border border-apple-amber/30'
            }`}
            title={isConnected ? 'Conectado a la red de correo en vivo' : 'Reconectando socket...'}
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-apple-green animate-ping' : 'bg-apple-amber'}`} />
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">En Vivo</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reconectando</span>
              </>
            )}
          </div>

          {/* Privacy Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-pill text-xs font-medium text-studio-600 dark:text-studio-300">
            <Shield className="w-3.5 h-3.5 text-apple-blue" />
            <span>Sin Registro</span>
          </div>

          {/* Theme Switcher Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-700 dark:text-studio-200 transition-all active:scale-95"
            aria-label="Cambiar tema de color"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-apple-amber" />
            ) : (
              <Moon className="w-4 h-4 text-studio-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};