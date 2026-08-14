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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-sm p-6 sm:p-8 glass-card rounded-4xl border border-white/80 dark:border-white/15 shadow-2xl text-center animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-400 hover:text-studio-700 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-apple-blue/10 dark:bg-apple-blueDark/20 text-apple-blue dark:text-apple-blueDark flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-extrabold text-studio-900 dark:text-white mb-1 tracking-tight">
          Escanear en iPhone / Android
        </h3>
        <p className="text-xs text-studio-500 dark:text-studio-400 mb-6">
          Apunta con la cámara de tu móvil para copiar esta dirección o abrir la bandeja instantáneamente.
        </p>

        {/* QR Code Container with Apple Rounded Box */}
        <div className="p-4 bg-white rounded-3xl border border-studio-200/80 shadow-lg inline-block mx-auto mb-6">
          <QRCodeSVG value={emailAddress} size={180} level="M" includeMargin={true} />
        </div>

        {/* Monospaced email address pill */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-studio-800 dark:text-studio-200">
          <span className="truncate">{emailAddress}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl bg-apple-blue text-white font-bold hover:bg-apple-blueHover transition-colors shrink-0 shadow-sm"
            title="Copiar correo"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};