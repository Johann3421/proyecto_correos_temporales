import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  emailAddress: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, emailAddress, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/55 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-sm p-6 bg-paper-50 dark:bg-ink-900 rounded-2xl border border-stone-200 dark:border-ink-800 shadow-lift animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-lg hover:bg-stone-100 dark:hover:bg-ink-800 text-stone-500 hover:text-ink-900 dark:hover:text-paper-50 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center mb-5">
          <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl bg-clay-50 dark:bg-clay-950/40 text-clay-600 dark:text-clay-400">
            <Smartphone className="h-5 w-5" />
          </div>
          <h3 className="font-serif text-lg font-semibold text-ink-900 dark:text-paper-50">
            Escanear en el móvil
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Apunta con la cámara para copiar esta dirección.
          </p>
        </div>

        <div className="mx-auto mb-5 w-fit p-3 bg-white dark:bg-ink-950 rounded-xl border border-stone-200 dark:border-ink-800">
          <QRCodeSVG value={emailAddress} size={168} level="M" includeMargin={true} />
        </div>

        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-paper-100 dark:bg-ink-950 border border-stone-200 dark:border-ink-800 text-xs font-mono">
          <span className="truncate text-ink-800 dark:text-paper-100">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-colors ${
              copied ? 'bg-olive-600 text-white' : 'bg-clay-600 text-paper-50 hover:bg-clay-700'
            }`}
            title="Copiar"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
