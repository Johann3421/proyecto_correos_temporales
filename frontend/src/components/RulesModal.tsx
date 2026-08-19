import React, { useState, useEffect } from 'react';
import { Filter, Plus, Trash2, X, AlertCircle, Check, Bell, Bookmark, Forward } from 'lucide-react';
import { api, InboxData, InboxRule } from '../services/api';

interface RulesModalProps {
  isOpen: boolean;
  inbox: InboxData | null;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, inbox, onClose }) => {
  const [rules, setRules] = useState<InboxRule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ruleType, setRuleType] = useState<'domain' | 'subject' | 'from'>('domain');
  const [pattern, setPattern] = useState('');
  const [action, setAction] = useState<'notify_only' | 'auto_save' | 'forward'>('notify_only');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && inbox) {
      loadRules();
    }
  }, [isOpen, inbox]);

  const loadRules = async () => {
    if (!inbox) return;
    setIsLoading(true);
    try {
      const data = await api.getInboxRules(inbox.access_token);
      setRules(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !inbox) return null;

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern.trim()) {
      setError('Escribe un patrón o palabra clave.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const newRule = await api.createInboxRule(inbox.access_token, {
        rule_type: ruleType,
        pattern: pattern.trim().toLowerCase(),
        action,
      });
      setRules([newRule, ...rules]);
      setPattern('');
    } catch {
      setError('Error al crear la regla.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await api.deleteInboxRule(inbox.access_token, ruleId);
      setRules(rules.filter((r) => r.id !== ruleId));
    } catch {
      // silent
    }
  };

  const getActionBadge = (act: string) => {
    switch (act) {
      case 'auto_save':
        return (
          <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded bg-accent-100 dark:bg-accent-950 text-accent-700 dark:text-accent-300 font-medium">
            <Bookmark className="w-3 h-3" /> Auto-guardar
          </span>
        );
      case 'forward':
        return (
          <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded bg-ok-DEFAULT/10 text-ok-DEFAULT font-medium">
            <Forward className="w-3 h-3" /> Reenviar
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-2xs px-2 py-0.5 rounded bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 font-medium">
            <Bell className="w-3 h-3" /> Alertar
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2.5 rounded-lg bg-accent-50 dark:bg-accent-950/50 border border-accent-200 dark:border-accent-800/50 text-accent-600">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-surface-900 dark:text-surface-50">
              Alertas y reglas de filtrado
            </h3>
            <p className="text-xs text-surface-500 font-mono truncate max-w-[280px]">
              {inbox.email_address}
            </p>
          </div>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreateRule} className="p-3.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 mb-5 space-y-3">
          <span className="block text-xs font-semibold text-surface-900 dark:text-surface-100">
            Crear nueva regla
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-2xs font-medium text-surface-500 mb-1">Si el mensaje:</label>
              <select
                value={ruleType}
                onChange={(e: any) => setRuleType(e.target.value)}
                className="w-full text-xs rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-1.5 text-surface-800 dark:text-surface-100 focus:outline-none"
              >
                <option value="domain">Es de dominio (@)</option>
                <option value="subject">Asunto contiene</option>
                <option value="from">Remitente contiene</option>
              </select>
            </div>

            <div>
              <label className="block text-2xs font-medium text-surface-500 mb-1">Valor / Patrón:</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder={ruleType === 'domain' ? 'netflix.com' : 'código'}
                className="w-full text-xs rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-1.5 font-mono text-surface-800 dark:text-surface-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-2xs font-medium text-surface-500 mb-1">Acción automática:</label>
              <select
                value={action}
                onChange={(e: any) => setAction(e.target.value)}
                className="w-full text-xs rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-1.5 text-surface-800 dark:text-surface-100 focus:outline-none"
              >
                <option value="notify_only">Avisar con alerta</option>
                <option value="auto_save">Guardar en historial</option>
                <option value="forward">Reenviar a correo</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-2xs text-fail-light dark:text-fail-dark">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-700 hover:bg-accent-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Añadiendo…' : 'Añadir regla'}
            </button>
          </div>
        </form>

        {/* Existing rules list */}
        <div>
          <h4 className="text-xs font-semibold text-surface-900 dark:text-surface-100 mb-2">
            Reglas activas ({rules.length})
          </h4>

          {isLoading ? (
            <div className="h-16 flex items-center justify-center text-xs text-surface-400">
              Cargando reglas…
            </div>
          ) : rules.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-surface-200 dark:border-surface-800 text-center text-xs text-surface-500">
              No tienes reglas activas para esta bandeja.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {rules.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 hover:border-surface-300 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xs font-mono text-surface-500 uppercase shrink-0">
                      {r.rule_type}:
                    </span>
                    <span className="text-xs font-mono font-medium text-surface-900 dark:text-surface-100 truncate">
                      "{r.pattern}"
                    </span>
                    {getActionBadge(r.action)}
                  </div>

                  <button
                    onClick={() => handleDeleteRule(r.id)}
                    className="p-1 rounded text-surface-400 hover:text-fail-light dark:hover:text-fail-dark hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
