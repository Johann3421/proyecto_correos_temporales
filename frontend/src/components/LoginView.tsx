import React from 'react';
import { Lock, AlertCircle, ShieldCheck, Zap, Forward } from 'lucide-react';
import { api, LoginResponse } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (session: LoginResponse) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa ambos campos.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const session = await api.login(username.trim(), password);
      onLoginSuccess(session);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Usuario o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[46%] bg-surface-900 dark:bg-surface-950 items-end p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 max-w-md space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-500" />
            <span className="text-surface-400 text-xs font-mono tracking-widest uppercase">
              AirInbox Platform
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-surface-0 leading-tight mb-3 tracking-tight">
              Tu escudo de privacidad.<br />
              Recibe, filtra y reenvía.
            </h1>
            <p className="text-surface-400 text-sm leading-relaxed">
              Buzones temporales con subdominios dinámicos, filtros de verificación y reenvío automático a tu correo personal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-200">
                <Zap className="w-3.5 h-3.5 text-accent-400" />
                <span>Tiempo real</span>
              </div>
              <p className="text-2xs text-surface-400">Notificaciones instantáneas vía WebSockets.</p>
            </div>
            <div className="p-3 rounded-lg bg-surface-800/60 border border-surface-700/50 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-surface-200">
                <Forward className="w-3.5 h-3.5 text-ok-DEFAULT" />
                <span>Reenvío a Gmail</span>
              </div>
              <p className="text-2xs text-surface-400">Protege tu bandeja personal del spam.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-accent-600" />
              <span className="text-surface-400 text-2xs font-mono tracking-widest uppercase">
                AirInbox
              </span>
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
              Accede a tu buzón
            </h1>
          </div>

          <div className="hidden lg:block mb-6">
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-0 mb-1">
              Iniciar sesión
            </h2>
            <p className="text-xs text-surface-500">
              Ingresa con tus credenciales de acceso.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 text-fail-light dark:text-fail-dark text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-user" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Usuario
              </label>
              <input
                id="login-user"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                autoComplete="username"
                placeholder="demo o admin"
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="login-pass" className="block text-xs font-semibold text-surface-700 dark:text-surface-300 mb-1.5">
                Contraseña
              </label>
              <input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-accent-700 hover:bg-accent-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-all"
            >
              {isLoading ? 'Verificando sesión…' : 'Acceder al buzón'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
