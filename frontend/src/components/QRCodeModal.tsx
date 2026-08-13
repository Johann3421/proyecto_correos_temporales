import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm p-6 bg-white dark:bg-obsidian-850 rounded-3xl border border-slate-200 dark:border-obsidian-700 shadow-2xl shadow-obsidian-950/50 text-center animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-500 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Escanear en tu Móvil
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Apunta con la cámara de tu teléfono para copiar este correo fácilmente
        </p>

        {/* QR Code Container */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner inline-block mx-auto mb-6">
          <QRCodeSVG value={emailAddress} size={180} level="M" includeMargin={true} />
        </div>

        {/* Monospaced email address pill */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-100 dark:bg-obsidian-800 rounded-xl border border-slate-200 dark:border-obsidian-700 text-xs font-mono font-medium text-slate-800 dark:text-slate-200 mb-4">
          <span className="truncate">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-brand-500 text-obsidian-950 font-bold hover:bg-brand-400 transition-colors"
            title="Copiar correo"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
