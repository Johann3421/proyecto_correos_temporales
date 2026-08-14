import React from 'react';
import { Mail, Radio } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 dark:border-ink-700 bg-paper-50/70 dark:bg-ink-900/50 p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
      <div className="relative grid h-16 w-16 place-items-center rounded-2xl bg-clay-50 dark:bg-clay-950/40 text-clay-600 dark:text-clay-400 mb-5">
        <span className="absolute inset-0 rounded-2xl bg-clay-100 dark:bg-clay-900/30 animate-pulse-soft" />
        <Mail className="h-7 w-7 relative" />
      </div>

      <div className="flex items-center justify-center gap-2 text-clay-600 dark:text-clay-400 font-semibold text-xs uppercase tracking-wider mb-2">
        <Radio className="h-3.5 w-3.5 animate-pulse-soft" />
        <span>Esperando correos</span>
      </div>

      <h3 className="font-serif text-lg font-semibold text-ink-900 dark:text-paper-50 mb-2">
        Tu bandeja está lista
      </h3>

      <p className="text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
        Copia la dirección de arriba y úsala donde necesites. Los mensajes aparecerán aquí automáticamente, en tiempo real.
      </p>
    </div>
  );
};
