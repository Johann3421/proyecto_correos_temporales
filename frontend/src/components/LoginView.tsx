import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
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
      setError('Completa ambos campos.');
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
      {/* Left — branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] bg-surface-900 dark:bg-surface-950 items-end p-12 relative overflow-hidden">
        {/* Subtle grid texture — not a gradient blob */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative z-10 max-w-md">
          <div className="text-surface-400 text-2xs font-mono tracking-widest uppercase mb-4">
            correos.abadgroup.tech
          </div>
          <h1 className="text-3xl font-bold text-surface-0 leading-tight mb-3 tracking-tight">
            Bandeja temporal.<br />Sin registro. Sin spam.
          </h1>
          <p className="text-surface-400 text-sm leading-relaxed">
            Genera una dirección desechable con subdominios dinámicos. Recibe correos en tiempo real y descártalos cuando quieras.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-surface-50 dark:bg-surface-950">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="lg:hidden mb-8">
            <div className="text-surface-400 text-2xs font-mono tracking-widest uppercase mb-1">
              correos.abadgroup.tech
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-surface-0 tracking-tight">
              Bandeja temporal
            </h1>
          </div>

          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-0 mb-1">
            Iniciar sesión
          </h2>
          <p className="text-sm text-surface-500 mb-6">
            Ingresa tus credenciales para acceder.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-md bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 text-fail-light dark:text-fail-dark text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-user" className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Usuario
              </label>
              <input
                id="login-user"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(null); }}
                autoComplete="username"
                autoFocus
                className="w-full px-3 py-2 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="login-pass" className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5">
                Contraseña
              </label>
              <input
                id="login-pass"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-sm text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-md bg-accent-700 hover:bg-accent-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              {isLoading ? 'Verificando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
