import React, { useState } from 'react';
import { Copy, Check, RotateCw, QrCode, Trash2, Pencil, RefreshCw, Send, Forward, Filter, ShieldCheck } from 'lucide-react';
import { InboxData } from '../services/api';

interface EmailCardProps {
  inbox: InboxData | null;
  domains: string[];
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  onGenerateNew: (domain?: string, customPrefix?: string) => void;
  onRefresh: () => void;
  onDelete: () => void;
  onOpenQR: () => void;
  onOpenForward: () => void;
  onOpenRules: () => void;
  onSendTest: () => void;
  isLoading: boolean;
}

export const EmailCard: React.FC<EmailCardProps> = ({
  inbox,
  domains,
  selectedDomain,
  onSelectDomain,
  onGenerateNew,
  onRefresh,
  onDelete,
  onOpenQR,
  onOpenForward,
  onOpenRules,
  onSendTest,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('');

  const handleCopy = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrefix.trim()) return;
    onGenerateNew(selectedDomain, customPrefix.trim());
    setIsEditingAlias(false);
    setCustomPrefix('');
  };

  return (
    <section className="border border-surface-200 dark:border-surface-800 rounded-xl bg-surface-0 dark:bg-surface-900 p-4 sm:p-5 shadow-sm">
      {/* Top row: Status / Brand tag + domain dropdown */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-2xs font-mono font-semibold uppercase tracking-wider text-ok-DEFAULT bg-ok-DEFAULT/10 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-ok-DEFAULT animate-pulse" />
            Tu correo está listo
          </span>
          {inbox?.forward_enabled && (
            <span className="hidden sm:inline-flex items-center gap-1 text-2xs font-mono text-accent-600 bg-accent-50 dark:bg-accent-950 px-2 py-0.5 rounded-full border border-accent-200 dark:border-accent-800">
              <Forward className="w-3 h-3" />
              Reenviando a {inbox.forward_to}
            </span>
          )}
        </div>

        {domains.length > 1 && (
          <select
            value={selectedDomain}
            onChange={(e) => {
              onSelectDomain(e.target.value);
              onGenerateNew(e.target.value);
            }}
            disabled={isLoading}
            className="text-2xs font-mono rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 px-2 py-1 text-surface-700 dark:text-surface-200 focus:border-accent-600 focus:outline-none cursor-pointer"
          >
            {domains.map((d) => (
              <option key={d} value={d}>@{d}</option>
            ))}
          </select>
        )}
      </div>

      {/* Address row with prominent copy action */}
      <div className="flex items-stretch gap-2 mb-3">
        <div className="flex-1 min-w-0 flex items-center px-3.5 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 shadow-inner">
          {isLoading ? (
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
          ) : (
            <span className="font-mono text-base sm:text-lg font-medium text-surface-900 dark:text-surface-50 break-all select-all leading-tight">
              {inbox?.email_address || 'Preparando tu buzón…'}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          disabled={isLoading || !inbox}
          className={`flex items-center gap-1.5 px-4 rounded-lg text-sm font-semibold transition-all shadow-sm shrink-0 ${
            copied
              ? 'bg-ok-DEFAULT text-white scale-[0.98]'
              : 'bg-accent-700 hover:bg-accent-800 text-white'
          } disabled:opacity-40`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* Custom alias form */}
      {isEditingAlias && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 mb-3 animate-fadeIn">
          <div className="flex-1 flex items-center rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 px-3 py-1.5 font-mono text-sm">
            <input
              type="text"
              value={customPrefix}
              onChange={(e) => setCustomPrefix(e.target.value)}
              placeholder="mi-alias-personalizado"
              className="bg-transparent w-full focus:outline-none text-surface-900 dark:text-surface-50"
              autoFocus
            />
            <span className="text-surface-400 text-xs select-none ml-1">@{selectedDomain}</span>
          </div>
          <button type="submit" className="rounded-lg bg-accent-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-800">
            Crear
          </button>
          <button
            type="button"
            onClick={() => setIsEditingAlias(false)}
            className="rounded-lg border border-surface-200 dark:border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setIsEditingAlias(!isEditingAlias)}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            <span>Alias</span>
          </button>

          <button
            onClick={onOpenForward}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-colors"
            title="Configurar reenvío a tu correo personal"
          >
            <Forward className="h-3 w-3 text-accent-600" />
            <span>Reenvío</span>
          </button>

          <button
            onClick={onOpenRules}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-colors"
            title="Configurar filtros y reglas automáticas"
          >
            <Filter className="h-3 w-3 text-accent-600" />
            <span>Reglas</span>
          </button>

          <button
            onClick={onOpenQR}
            disabled={isLoading || !inbox}
            className="rounded-md p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-colors disabled:opacity-40"
            title="Ver código QR para escanear en móvil"
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onSendTest}
            disabled={isLoading || !inbox}
            className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-accent-700 dark:text-accent-400 bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-800/40 hover:bg-accent-100 transition-colors disabled:opacity-40"
            title="Inyectar correo de prueba"
          >
            <Send className="h-3 w-3" />
            <span>Prueba</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-md p-1.5 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 border border-surface-200 dark:border-surface-700 transition-colors disabled:opacity-40"
            title="Actualizar bandeja"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-fail-light dark:text-fail-dark hover:bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" />
          <span>Eliminar</span>
        </button>
      </div>
    </section>
  );
};
