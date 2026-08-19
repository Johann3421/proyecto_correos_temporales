import React, { useState, useEffect } from 'react';
import { Forward, X, Check, AlertCircle, ShieldAlert, Mail } from 'lucide-react';
import { api, InboxData } from '../services/api';

interface ForwardSettingsModalProps {
  isOpen: boolean;
  inbox: InboxData | null;
  onClose: () => void;
  onUpdated: (updated: InboxData) => void;
}

export const ForwardSettingsModal: React.FC<ForwardSettingsModalProps> = ({
  isOpen,
  inbox,
  onClose,
  onUpdated,
}) => {
  const [forwardTo, setForwardTo] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (inbox) {
      setForwardTo(inbox.forward_to || '');
      setIsEnabled(inbox.forward_enabled || false);
      setError(null);
      setSuccess(false);
    }
  }, [inbox, isOpen]);

  if (!isOpen || !inbox) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = forwardTo.trim();
    if (isEnabled && !email) {
      setError('Introduce un correo electrónico de destino válido.');
      return;
    }

    if (isEnabled && (!email.includes('@') || !email.includes('.'))) {
      setError('El formato del correo es inválido.');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await api.updateForwarding(inbox.access_token, email, isEnabled);
      onUpdated(updated);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch {
      setError('Error al guardar la configuración de reenvío.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-lg bg-accent-50 dark:bg-accent-950/50 border border-accent-200 dark:border-accent-800/50 text-accent-600">
            <Forward className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
              Reenvío a correo real
            </h3>
            <p className="text-xs text-surface-500 font-mono truncate max-w-[260px]">
              {inbox.email_address}
            </p>
          </div>
        </div>

        <p className="text-xs text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
          Reenvía automáticamente los mensajes que lleguen a este buzón temporal hacia tu correo personal (Gmail, Outlook, etc.).
        </p>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-md bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 text-fail-light dark:text-fail-dark text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-2.5 rounded-md bg-ok-DEFAULT/10 border border-ok-DEFAULT/20 text-ok-DEFAULT text-xs font-medium">
            <Check className="w-4 h-4 shrink-0" />
            <span>Configuración de reenvío guardada</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Toggle enable switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
            <div>
              <span className="block text-xs font-semibold text-surface-900 dark:text-surface-100">
                Activar reenvío automático
              </span>
              <span className="text-2xs text-surface-500">
                {isEnabled ? 'Reenviando mensajes nuevos' : 'Pausado actualmente'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-300 peer-focus:outline-none rounded-full peer dark:bg-surface-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-600"></div>
            </label>
          </div>

          {/* Destination email */}
          <div>
            <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5">
              Correo de destino (Gmail / Outlook / etc.)
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-surface-400" />
              <input
                type="email"
                value={forwardTo}
                onChange={(e) => setForwardTo(e.target.value)}
                placeholder="ejemplo@gmail.com"
                disabled={!isEnabled}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-md border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-600 disabled:opacity-50 transition-colors"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-2xs text-surface-500 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-surface-700 dark:text-surface-300">
              <ShieldAlert className="w-3.5 h-3.5 text-accent-500" />
              <span>Privacidad garantizada</span>
            </div>
            <p>Los correos reenviados llevan el prefijo [AirInbox] en el asunto para que los identifiques con facilidad en tu bandeja principal.</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-surface-200 dark:border-surface-700 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-md bg-accent-700 hover:bg-accent-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSaving ? 'Guardando…' : 'Guardar reenvío'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
