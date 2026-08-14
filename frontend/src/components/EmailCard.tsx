import React, { useState } from 'react';
import { Copy, Check, RotateCw, QrCode, Trash2, Clock, Plus, Pencil, RefreshCw } from 'lucide-react';
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

  return (
    <section className="border border-surface-200 dark:border-surface-800 rounded-md bg-surface-0 dark:bg-surface-900 p-4 sm:p-5">
      {/* Domain selector + label */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-2xs font-mono uppercase tracking-wider text-surface-500">
          Dirección activa
        </span>
        {domains.length > 1 && (
          <select
            value={selectedDomain}
            onChange={(e) => {
              onSelectDomain(e.target.value);
              onGenerateNew(e.target.value);
            }}
            disabled={isLoading}
            className="text-2xs font-mono rounded border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 px-2 py-1 text-surface-700 dark:text-surface-200 focus:border-accent-600 focus:outline-none"
          >
            {domains.map((d) => (
              <option key={d} value={d}>@{d}</option>
            ))}
          </select>
        )}
      </div>

      {/* Address row */}
      <div className="flex items-stretch gap-2 mb-3">
        <div className="flex-1 min-w-0 flex items-center px-3 py-2.5 rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950">
          {isLoading ? (
            <div className="h-5 w-2/3 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
          ) : (
            <span className="font-mono text-base sm:text-lg font-medium text-surface-900 dark:text-surface-50 break-all select-all leading-tight">
              {inbox?.email_address || 'Generando…'}
            </span>
          )}
        </div>

        <button
          onClick={handleCopy}
          disabled={isLoading || !inbox}
          className={`flex items-center gap-1.5 px-4 rounded-md text-sm font-medium transition-colors shrink-0 ${
            copied
              ? 'bg-ok-DEFAULT text-white'
              : 'bg-accent-700 hover:bg-accent-800 text-white'
          } disabled:opacity-40`}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
        </button>
      </div>

      {/* Timer bar */}
      {inbox && remaining > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1 text-2xs text-surface-500">
              <Clock className="h-3 w-3" />
              <span className={`font-mono font-medium ${isCritical ? 'text-fail-light dark:text-fail-dark' : isLow ? 'text-warn-light dark:text-warn-dark' : 'text-surface-700 dark:text-surface-200'}`}>
                {formatRemainingTime(remaining)}
              </span>
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onExtendTime(10)}
                className="text-2xs font-medium text-accent-700 dark:text-accent-400 hover:underline"
              >
                +10m
              </button>
              <span className="text-surface-300 dark:text-surface-700">·</span>
              <button
                onClick={() => onExtendTime(60)}
                className="text-2xs font-medium text-accent-700 dark:text-accent-400 hover:underline"
              >
                +1h
              </button>
            </div>
          </div>
          <div className="h-1 w-full rounded-full bg-surface-200 dark:bg-surface-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                isCritical ? 'bg-fail-DEFAULT' : isLow ? 'bg-warn-DEFAULT' : 'bg-accent-600'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Custom alias form */}
      {isEditingAlias && (
        <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center rounded-md border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-950 px-3 py-1.5 font-mono text-sm">
            <input
              type="text"
              value={customPrefix}
              onChange={(e) => setCustomPrefix(e.target.value)}
              placeholder="mi-alias"
              className="bg-transparent w-full focus:outline-none text-surface-900 dark:text-surface-50"
              autoFocus
            />
            <span className="text-surface-400 text-xs select-none ml-1">@{selectedDomain}</span>
          </div>
          <button type="submit" className="rounded-md bg-accent-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-800">
            Crear
          </button>
          <button
            type="button"
            onClick={() => setIsEditingAlias(false)}
            className="rounded-md border border-surface-200 dark:border-surface-700 px-3 py-1.5 text-xs font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onGenerateNew()}
            disabled={isLoading}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Nueva
          </button>
          <button
            onClick={() => setIsEditingAlias(!isEditingAlias)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Alias
          </button>
          <button
            onClick={onOpenQR}
            disabled={isLoading || !inbox}
            className="rounded p-1 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
            title="Código QR"
          >
            <QrCode className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded p-1 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-40"
            title="Actualizar bandeja"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-fail-light dark:text-fail-dark hover:bg-fail-DEFAULT/10 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-3 w-3" />
          Eliminar
        </button>
      </div>
    </section>
  );
};
