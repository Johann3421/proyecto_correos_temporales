import React, { useState } from 'react';
import { Copy, Check, RotateCw, QrCode, Sparkles, Trash2, Clock, Plus } from 'lucide-react';
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
  const isExpiringSoon = remaining > 0 && remaining < 120;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Dirección temporal activa
          </span>
          {domains.length > 1 && (
            <select
              value={selectedDomain}
              onChange={(e) => {
                onSelectDomain(e.target.value);
                onGenerateNew(e.target.value);
              }}
              className="text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-300"
            >
              {domains.map((d) => (
                <option key={d} value={d}>
                  @{d}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Expiration Timer Indicator */}
        {inbox && remaining > 0 && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                isExpiringSoon
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatRemainingTime(remaining)}</span>
            </div>

            <button
              onClick={() => onExtendTime(10)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Sumar 10 minutos a la bandeja"
            >
              <Plus className="w-3 h-3 text-cobalt-600 dark:text-cobalt-400" />
              <span>+10 min</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Email Box (Dominant element) */}
      <div className="my-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 flex items-center justify-between min-w-0">
          {isLoading ? (
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-2/3 animate-pulse" />
          ) : (
            <span className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white truncate select-all">
              {inbox?.email_address || 'Cargando...'}
            </span>
          )}
        </div>

        {/* Primary Action: Copy Email */}
        <button
          onClick={handleCopy}
          disabled={isLoading || !inbox}
          className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-bold text-sm transition-colors shrink-0 ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-cobalt-600 hover:bg-cobalt-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Dirección copiada</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar dirección</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Alias Input Form */}
      {isEditingAlias && (
        <form onSubmit={handleCustomSubmit} className="mb-4 flex items-center gap-2">
          <div className="flex-1 flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs font-mono">
            <input
              type="text"
              value={customPrefix}
              onChange={(e) => setCustomPrefix(e.target.value)}
              placeholder="nombre-personalizado"
              className="bg-transparent w-full focus:outline-none text-slate-900 dark:text-white"
              autoFocus
            />
            <span className="text-slate-400 select-none">@{selectedDomain || 'correos.abadgroup.tech'}</span>
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-lg bg-cobalt-600 text-white font-bold text-xs hover:bg-cobalt-700 transition-colors"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={() => setIsEditingAlias(false)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
        </form>
      )}

      {/* Secondary Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onGenerateNew()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400" />
            <span>Generar nueva dirección</span>
          </button>

          <button
            onClick={() => setIsEditingAlias(!isEditingAlias)}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-colors"
          >
            Personalizar alias
          </button>

          <button
            onClick={onOpenQR}
            disabled={isLoading || !inbox}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Mostrar código QR"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Refrescar mensajes"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button
          onClick={onDelete}
          disabled={isLoading}
          className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Eliminar bandeja</span>
        </button>
      </div>
    </div>
  );
};