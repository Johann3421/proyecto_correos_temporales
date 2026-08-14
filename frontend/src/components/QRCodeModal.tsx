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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-cobalt-50 dark:bg-cobalt-950/40 text-cobalt-600 flex items-center justify-center">
          <Smartphone className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Escanear en dispositivo móvil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
          Apunta con la cámara de tu teléfono para abrir o copiar esta dirección.
        </p>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-lg border border-slate-200 inline-block mx-auto mb-4">
          <QRCodeSVG value={emailAddress} size={160} level="M" includeMargin={true} />
        </div>

        {/* Email Address Pill */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono">
          <span className="truncate text-slate-800 dark:text-slate-200">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className="p-1 rounded bg-cobalt-600 text-white hover:bg-cobalt-700 transition-colors shrink-0"
            title="Copiar"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};