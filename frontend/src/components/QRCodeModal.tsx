import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check } from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/50 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xs p-5 bg-surface-0 dark:bg-surface-900 rounded-md border border-surface-200 dark:border-surface-800 shadow-md animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded text-surface-400 hover:text-surface-900 dark:hover:text-surface-50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-50">
            Escanear en el móvil
          </h3>
          <p className="text-2xs text-surface-500 mt-0.5">
            Apunta con la cámara para copiar esta dirección.
          </p>
        </div>

        <div className="mx-auto mb-4 w-fit p-2 bg-white rounded border border-surface-200 dark:border-surface-700">
          <QRCodeSVG value={emailAddress} size={152} level="M" includeMargin={true} />
        </div>

        <div className="flex items-center justify-between gap-2 p-2 rounded border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950 text-xs font-mono">
          <span className="truncate text-surface-700 dark:text-surface-200">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors ${
              copied ? 'text-ok-DEFAULT' : 'text-surface-400 hover:text-accent-600'
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
