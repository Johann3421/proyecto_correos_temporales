import React, { useState } from 'react';
import { Copy, Check, RefreshCw, QrCode, Sparkles, Trash2, Globe } from 'lucide-react';
import { InboxData } from '../services/api';

interface EmailCardProps {
  inbox: InboxData | null;
  domains: string[];
  selectedDomain: string;
  onSelectDomain: (domain: string) => void;
  onGenerateNew: (domain?: string) => void;
  onRefresh: () => void;
  onDelete: () => void;
  onOpenQR: () => void;
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
  isLoading
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full p-6 sm:p-8 rounded-3xl bg-white dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-700/80 shadow-xl shadow-obsidian-950/5 relative overflow-hidden">
      {/* Subtle top emerald ambient light glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Label & Domain Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tu Dirección de Correo Temporal
            </span>
          </div>

          {/* Domain Dropdown Selector if multiple domains available */}
          {domains.length > 1 && (
            <div className="flex items-center gap-2 text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">Dominio:</span>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  onSelectDomain(e.target.value);
                  onGenerateNew(e.target.value);
                }}
                className="bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    @{d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Email Hero Box */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-obsidian-900 border border-slate-200/90 dark:border-obsidian-750 mb-6">
          {/* Email Address Display */}
          <div className="flex-1 min-w-0 px-2 py-1">
            {isLoading ? (
              <div className="h-8 bg-slate-200 dark:bg-obsidian-800 rounded-lg animate-pulse w-3/4" />
            ) : (
              <span className="font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white select-all break-all">
                {inbox?.email_address || "Cargando correo..."}
              </span>
            )}
          </div>

          {/* Action Buttons: Big Copy Button + QR Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isLoading || !inbox}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-brand-500 hover:bg-brand-400 text-obsidian-950 shadow-brand-500/30 hover:shadow-brand-500/40'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 animate-bounce" />
                  <span>¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  <span>Copiar correo</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenQR}
              disabled={isLoading || !inbox}
              className="p-3.5 rounded-xl bg-white dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-obsidian-700 hover:bg-slate-100 dark:hover:bg-obsidian-750 transition-colors shadow-sm"
              title="Mostrar Código QR para móvil"
            >
              <QrCode className="w-5 h-5 text-brand-500" />
            </button>
          </div>
        </div>

        {/* Secondary Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateNew()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-obsidian-700 hover:bg-slate-200 dark:hover:bg-obsidian-750 transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Generar otro correo</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-100 dark:bg-obsidian-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-obsidian-700 hover:bg-slate-200 dark:hover:bg-obsidian-750 transition-colors"
              title="Refrescar mensajes manualmente"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={onDelete}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium px-2 py-1 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar esta bandeja</span>
          </button>
        </div>
      </div>
    </div>
  );
};
