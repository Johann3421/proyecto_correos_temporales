import React, { useState } from 'react';
import { Copy, Check, RotateCw, QrCode, Sparkles, Trash2, Globe, ArrowRight } from 'lucide-react';
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
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customPrefix, setCustomPrefix] = useState('');

  const handleCopy = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrefix.trim()) return;
    onGenerateNew(selectedDomain, customPrefix.trim());
    setIsCustomizing(false);
    setCustomPrefix('');
  };

  return (
    <section aria-label="Generador de correo" className="w-full glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">
      {/* Background Soft Glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-apple-blue/15 dark:bg-apple-blueDark/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-apple-purple/10 dark:bg-apple-purple/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top Header info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-apple-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-apple-green" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-studio-500 dark:text-studio-400">
              Bandeja Temporal Activa
            </span>
          </div>

          {/* Domain Selector Pill */}
          {domains.length > 1 && (
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-studio-400" />
              <span className="text-studio-500">Dominio:</span>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  onSelectDomain(e.target.value);
                  onGenerateNew(e.target.value);
                }}
                className="bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1 text-studio-800 dark:text-studio-200 font-bold focus:outline-none focus:ring-2 focus:ring-apple-blue"
              >
                {domains.map((d) => (
                  <option key={d} value={d} className="dark:bg-studio-900">
                    @{d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Email Address Hero Display */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.06] dark:border-white/[0.06] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 shadow-inner">
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="h-9 bg-black/[0.08] dark:bg-white/[0.08] rounded-xl animate-pulse w-3/4" />
            ) : (
              <p className="font-mono text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-studio-900 dark:text-white select-all break-all leading-tight">
                {inbox?.email_address || 'Generando correo temporal...'}
              </p>
            )}
          </div>

          {/* Hero Buttons: Copy & QR */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={isLoading || !inbox}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-95 shadow-md ${
                copied
                  ? 'bg-apple-green text-white shadow-glow-green/40'
                  : 'bg-apple-blue hover:bg-apple-blueHover text-white shadow-glow-blue/40 hover:shadow-glow-blue/60'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 animate-scale-in" />
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
              className="p-3.5 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-700 dark:text-studio-200 transition-all active:scale-95 shadow-sm"
              title="Abrir Código QR"
            >
              <QrCode className="w-5 h-5 text-apple-blue dark:text-apple-blueDark" />
            </button>
          </div>
        </div>

        {/* Custom prefix input toggle */}
        {isCustomizing ? (
          <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 mb-4 animate-scale-in">
            <div className="flex-1 flex items-center rounded-2xl glass-input px-3 py-2 text-sm font-mono">
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="nombre-personalizado"
                className="bg-transparent w-full focus:outline-none text-studio-900 dark:text-white"
                autoFocus
              />
              <span className="text-studio-400 select-none">@{selectedDomain || 'correos.abadgroup.tech'}</span>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-apple-blue text-white font-bold text-xs hover:bg-apple-blueHover transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Crear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCustomizing(false)}
              className="px-3 py-2.5 rounded-2xl glass-pill text-xs font-semibold text-studio-600 dark:text-studio-300"
            >
              Cancelar
            </button>
          </form>
        ) : null}

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGenerateNew()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-700 dark:text-studio-200 transition-all active:scale-95 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-apple-purple" />
              <span>Generar nuevo</span>
            </button>

            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-600 dark:text-studio-300 transition-all active:scale-95"
            >
              <span>Personalizar alias</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-600 dark:text-studio-300 transition-all active:scale-95"
              title="Refrescar mensajes"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={onDelete}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-apple-red hover:opacity-80 font-medium px-2 py-1 transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar bandeja</span>
          </button>
        </div>
      </div>
    </section>
  );
};