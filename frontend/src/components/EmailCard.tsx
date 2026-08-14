import React, { useState } from 'react';
import { Copy, Check, RotateCw, QrCode, Sparkles, Trash2, Clock, Plus, Pencil } from 'lucide-react';
import { InboxData } from '../services/api';
import { formatRemainingTime } from '../utils/formatters';

interface EmailCardProps {
  inbox: InboxData | null;
  domains: string[];
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  onGenerateNew: (domain?: string, customPrefix?: string) => void;
  onRefresh: () => void;
  onDelete: () => void;
  onOpenQR: () => void;
  onExtendTime: (minutes: number) => void;
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
  onExtendTime,
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

  const remaining = inbox?.remaining_seconds || 0;
  const totalSeconds = inbox
    ? Math.max(1, Math.round((new Date(inbox.expires_at).getTime() - new Date(inbox.created_at).getTime()) / 1000))
    : 1;
  const pct = Math.min(100, Math.max(0, (remaining / totalSeconds) * 100));
  const isLow = remaining > 0 && remaining < 120;
  const isCritical = remaining > 0 && remaining < 30;

  const barColor = isCritical
    ? 'bg-brick-500'
    : isLow
      ? 'bg-amber-400'
      : 'bg-olive-500';

  return (
    <section className="rounded-2xl border border-stone-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-5 sm:p-7 shadow-soft">
      {/* Top meta row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          Tu dirección temporal
        </span>
        {domains.length > 1 && (
          <label className="flex items-center gap-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            Dominio
            <select
              value={selectedDomain}
              onChange={(e) => {
                onSelectDomain(e.target.value);
                onGenerateNew(e.target.value);
              }}
              disabled={isLoading}
              className="rounded-lg border border-stone-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950 px-2 py-1 text-ink-800 dark:text-paper-100 font-mono focus:border-clay-500 focus:outline-none"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  @{d}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Address + copy */}
      <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
        <div className="flex-1 min-w-0 flex items-center rounded-xl border border-stone-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-4 py-4">
          {isLoading ? (
            <div className="h-7 w-2/3 animate-pulse rounded bg-stone-200 dark:bg-ink-800" />
          ) : (
            <span className="font-mono text-lg sm:text-2xl font-medium text-ink-900 dark:text-paper-50 break-all select-all">
              {inbox?.email_address || 'Generando…'}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          disabled={isLoading || !inbox}
          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm transition-colors shrink-0 ${
            copied ? 'bg-olive-600 text-white' : 'bg-clay-600 hover:bg-clay-700 text-paper-50'
          } disabled:opacity-50`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Expiration progress */}
      {inbox && remaining > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <Clock className="h-3.5 w-3.5" />
              Expira en
              <span className={`font-mono font-semibold ${isCritical ? 'text-brick-600 dark:text-brick-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-ink-700 dark:text-paper-100'}`}>
                {formatRemainingTime(remaining)}
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onExtendTime(10)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-clay-700 dark:text-clay-300 hover:bg-clay-50 dark:hover:bg-clay-950/40 transition-colors"
                title="Sumar 10 minutos"
              >
                <Plus className="h-3 w-3" /> 10 min
              </button>
              <button
                onClick={() => onExtendTime(60)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-clay-700 dark:text-clay-300 hover:bg-clay-50 dark:hover:bg-clay-950/40 transition-colors"
                title="Sumar 1 hora"
              >
                <Plus className="h-3 w-3" /> 1 h
              </button>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-stone-200 dark:bg-ink-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Custom alias form */}
      {isEditingAlias && (
        <form onSubmit={handleCustomSubmit} className="mt-5 flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-lg border border-stone-200 dark:border-ink-800 bg-white dark:bg-ink-950 px-3 py-2 font-mono text-sm">
            <input
              type="text"
              value={customPrefix}
              onChange={(e) => setCustomPrefix(e.target.value)}
              placeholder="alias-personalizado"
              className="bg-transparent w-full focus:outline-none text-ink-900 dark:text-paper-50"
              autoFocus
            />
            <span className="text-stone-400 select-none">@{selectedDomain || 'correos.abadgroup.tech'}</span>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-clay-600 px-3.5 py-2 text-xs font-semibold text-paper-50 hover:bg-clay-700 transition-colors"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => setIsEditingAlias(false)}
            className="rounded-lg border border-stone-200 dark:border-ink-800 px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-ink-800"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Secondary actions */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-200 dark:border-ink-800">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onGenerateNew()}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-700 dark:text-paper-100 hover:bg-stone-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4 text-clay-600 dark:text-clay-400" />
            Nueva dirección
          </button>
          <button
            onClick={() => setIsEditingAlias(!isEditingAlias)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-ink-800 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Personalizar
          </button>
          <button
            onClick={onOpenQR}
            disabled={isLoading || !inbox}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 dark:text-paper-200 hover:bg-stone-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
            title="Mostrar código QR"
          >
            <QrCode className="h-4 w-4" />
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-600 dark:text-paper-200 hover:bg-stone-100 dark:hover:bg-ink-800 transition-colors disabled:opacity-50"
            title="Refrescar mensajes"
          >
            <RotateCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brick-600 dark:text-brick-400 hover:bg-brick-50 dark:hover:bg-brick-950/40 transition-colors disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </section>
  );
};
