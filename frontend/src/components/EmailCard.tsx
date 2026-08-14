import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Copy, Check, RotateCw, QrCode, Plus, Trash2, Globe } from 'lucide-react';
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
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!inbox) return;
    navigator.clipboard.writeText(inbox.email_address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl border border-charcoal-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-soft dark:shadow-medium overflow-hidden animate-slide-up">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" aria-hidden="true" />
            <span className="text-overline text-charcoal-500 dark:text-charcoal-400">
              Tu dirección temporal
            </span>
          </div>

          {domains.length > 1 && (
            <div className="flex items-center gap-2 text-body-sm font-medium">
              <Globe className="w-4 h-4 text-charcoal-400" aria-hidden="true" />
              <span className="text-charcoal-500 dark:text-charcoal-400">Dominio:</span>
              <select
                value={selectedDomain}
                onChange={(e) => {
                  onSelectDomain(e.target.value);
                  onGenerateNew(e.target.value);
                }}
                disabled={isLoading}
                className="input py-2 px-3 text-body-sm w-auto"
                aria-label="Seleccionar dominio"
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

        <div className="rounded-xl bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="h-10 bg-charcoal-200 dark:bg-ink-700 rounded-lg animate-pulse w-3/4 max-w-md" aria-hidden="true" />
              ) : (
                <code className="font-mono text-display-md font-semibold text-charcoal-900 dark:text-charcoal-100 break-all select-all">
                  {inbox?.email_address || 'Generando...'}
                </code>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopy}
                disabled={isLoading || !inbox}
                className={clsx(
                  'btn-primary flex-1 sm:flex-none whitespace-nowrap',
                  copied && 'bg-success-DEFAULT hover:bg-success-dark'
                )}
                aria-label={copied ? 'Copiado al portapapeles' : 'Copiar dirección de correo'}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 animate-bounce" aria-hidden="true" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" aria-hidden="true" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <button
                onClick={onOpenQR}
                disabled={isLoading || !inbox}
                className="btn-secondary btn-icon"
                title="Mostrar código QR"
                aria-label="Mostrar código QR para móvil"
              >
                <QrCode className="w-5 h-5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-body-sm font-medium">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onGenerateNew()}
              disabled={isLoading}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Otro correo</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-secondary btn-icon"
              title="Actualizar bandeja"
              aria-label="Actualizar mensajes"
            >
              <RotateCw className={clsx('w-5 h-5', isLoading && 'animate-spin-slow')} aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={onDelete}
            disabled={isLoading}
            className="btn-danger btn-sm"
            title="Eliminar esta bandeja"
            aria-label="Eliminar bandeja actual"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
};