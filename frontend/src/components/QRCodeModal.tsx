import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { clsx } from 'clsx';
import { X, Smartphone, Copy, Check } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  emailAddress: string;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, emailAddress, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="relative w-full max-w-sm p-6 bg-white dark:bg-ink-900 rounded-2xl border border-charcoal-200 dark:border-ink-800 shadow-strong animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-ink-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 flex items-center justify-center">
            <Smartphone className="w-6 h-6" aria-hidden="true" />
          </div>

          <h3 id="qr-modal-title" className="text-heading-md font-bold text-charcoal-900 dark:text-charcoal-100 mb-1">
            Escanear en tu móvil
          </h3>
          <p className="text-body-sm text-charcoal-500 dark:text-charcoal-400">
            Apunta la cámara para copiar el correo fácilmente
          </p>
        </div>

        <div className="p-4 bg-white dark:bg-ink-800 rounded-xl border border-charcoal-200 dark:border-ink-700 shadow-inner inline-block mx-auto mb-6">
          <QRCodeSVG value={emailAddress} size={180} level="M" includeMargin={true} />
        </div>

        <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800 text-caption font-mono font-medium text-charcoal-800 dark:text-charcoal-200">
          <span className="truncate">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className={clsx(
              'btn-icon p-2 rounded-lg transition-colors flex-shrink-0',
              copied
                ? 'bg-success-light dark:bg-success-dark/20 text-success-DEFAULT'
                : 'bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 hover:bg-sage-200 dark:hover:bg-sage-800'
            )}
            title="Copiar correo"
            aria-label={copied ? 'Copiado al portapapeles' : 'Copiar dirección de correo'}
          >
            {copied ? <Check className="w-4 h-4 animate-bounce" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};