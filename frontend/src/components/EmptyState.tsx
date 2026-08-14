import React from 'react';
import { clsx } from 'clsx';
import { Mail, Radio, ArrowDownTray } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="rounded-2xl border-2 border-dashed border-charcoal-300 dark:border-ink-700 bg-white/60 dark:bg-ink-900/60 p-12 text-center min-h-[320px] flex flex-col items-center justify-center animate-fade-in">
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-28 h-28 rounded-full bg-sage-100 dark:bg-sage-900/30 animate-pulse-soft" aria-hidden="true" />
        <div className="absolute w-20 h-20 rounded-full bg-sage-200 dark:bg-sage-800/30 animate-pulse-soft delay-200" aria-hidden="true" />
        <div className="w-14 h-14 rounded-2xl bg-sage-100 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 text-sage-600 dark:text-sage-400 flex items-center justify-center relative z-10 shadow-soft">
          <Mail className="w-7 h-7" aria-hidden="true" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sage-600 dark:text-sage-400 font-medium text-caption uppercase tracking-widest mb-3">
        <Radio className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
        <span>Esperando mensajes</span>
      </div>

      <h3 className="text-heading-md font-bold text-charcoal-900 dark:text-charcoal-100 mb-2">
        Tu bandeja está lista
      </h3>
      <p className="text-body-sm text-charcoal-500 dark:text-charcoal-400 max-w-sm mx-auto mb-6">
        Copia tu dirección de correo arriba y úsala donde necesites. Los mensajes aparecerán aquí automáticamente en tiempo real.
      </p>

      <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800 max-w-md">
        <ArrowDownTray className="w-5 h-5 text-sage-600 dark:text-sage-400 shrink-0" aria-hidden="true" />
        <span className="text-body-sm text-charcoal-700 dark:text-charcoal-300">
          Los nuevos correos llegarán instantáneamente
        </span>
      </div>
    </div>
  );
};