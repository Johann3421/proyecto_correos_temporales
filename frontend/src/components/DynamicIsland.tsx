import React, { useState } from 'react';
import { Copy, Check, Sparkles, QrCode, Hourglass } from 'lucide-react';
import { formatRemainingTime } from '../utils/formatters';

interface DynamicIslandProps {
  emailAddress: string;
  remainingSeconds: number;
  onGenerateNew: () => void;
  onOpenQR: () => void;
  isLoading: boolean;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  emailAddress,
  remainingSeconds,
  onGenerateNew,
  onOpenQR,
  isLoading
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!emailAddress) return;
    navigator.clipboard.writeText(emailAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside aria-label="Acciones rápidas del correo" className="fixed bottom-6 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-full glass-island border border-white/80 dark:border-white/15 shadow-island animate-slide-up max-w-xl w-full sm:w-auto justify-between sm:justify-start">
        {/* Email Pill */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all min-w-0 text-left group"
          title="Clic para copiar"
        >
          <span className="w-2 h-2 rounded-full bg-apple-green animate-pulse shrink-0" />
          <span className="font-mono text-xs sm:text-sm font-bold text-studio-900 dark:text-white truncate max-w-[140px] sm:max-w-[220px]">
            {emailAddress || 'Cargando...'}
          </span>
          <span className="text-[11px] font-semibold text-apple-blue dark:text-apple-blueDark opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
            Copiar
          </span>
        </button>

        {/* Expiration Mini Timer */}
        {remainingSeconds > 0 && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-xs font-mono font-bold text-studio-700 dark:text-studio-300 shrink-0">
            <Hourglass className="w-3 h-3 text-apple-amber" />
            <span>{formatRemainingTime(remainingSeconds)}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleCopy}
            disabled={isLoading || !emailAddress}
            className={`p-2 rounded-full font-bold text-xs transition-all active:scale-95 ${
              copied
                ? 'bg-apple-green text-white shadow-glow-green/40'
                : 'bg-apple-blue hover:bg-apple-blueHover text-white shadow-glow-blue/40'
            }`}
            title="Copiar dirección"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onOpenQR}
            disabled={isLoading || !emailAddress}
            className="p-2 rounded-full glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-700 dark:text-studio-200 transition-all active:scale-95"
            title="Código QR"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onGenerateNew}
            disabled={isLoading}
            className="p-2 rounded-full glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-700 dark:text-studio-200 transition-all active:scale-95"
            title="Generar nuevo correo"
          >
            <Sparkles className="w-3.5 h-3.5 text-apple-purple" />
          </button>
        </div>
      </div>
    </aside>
  );
};
