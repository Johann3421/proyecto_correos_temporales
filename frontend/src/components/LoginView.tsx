import React, { useState } from 'react';
import { Mail, Lock, User, KeyRound, AlertCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api, LoginResponse } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (session: LoginResponse) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo1234');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor completa todos los campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const session = await api.login(username.trim(), password);
      onLoginSuccess(session);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setUsername('demo');
    setPassword('demo1234');
    setError(null);
  };

  const handleFillAdmin = () => {
    setUsername('admin');
    setPassword('admin1234');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cobalt-600 text-white mx-auto mb-3 flex items-center justify-center shadow-sm">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Acceso a TempMail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generador con subdominios dinámicos y protección anti-spam
          </p>
        </div>

        {/* Quick Credentials Cards */}
        <div className="mb-6 space-y-2.5">
          {/* Demo User Card */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Usuario Demo (1 hora)</span>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 transition-colors"
              >
                Autocompletar
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              demo / demo1234
            </p>
          </div>

          {/* Admin User Card */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                <ShieldAlert className="w-4 h-4 text-cobalt-600" />
                <span>Administrador (24 horas)</span>
              </div>
              <button
                type="button"
                onClick={handleFillAdmin}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cobalt-100 dark:bg-cobalt-950/60 text-cobalt-700 dark:text-cobalt-300 hover:bg-cobalt-200 transition-colors"
              >
                Autocompletar
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              admin / admin1234
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Usuario
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="demo o admin"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cobalt-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cobalt-600"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-cobalt-600 hover:bg-cobalt-700 text-white font-bold text-sm transition-colors mt-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Iniciando sesión...' : 'Ingresar a la bandeja'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
