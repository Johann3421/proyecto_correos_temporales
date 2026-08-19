import React from 'react';
import { Mail, Zap } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="border border-dashed border-surface-200 dark:border-surface-800 rounded-xl p-8 sm:p-12 text-center bg-surface-0/50 dark:bg-surface-900/50">
      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-accent-50 dark:bg-accent-950/60 border border-accent-200 dark:border-accent-800/40 flex items-center justify-center text-accent-600">
        <Mail className="w-5 h-5" />
      </div>
      <div className="inline-flex items-center gap-1.5 text-2xs font-mono font-semibold uppercase tracking-wider text-ok-DEFAULT bg-ok-DEFAULT/10 px-2.5 py-0.5 rounded-full mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-ok-DEFAULT animate-pulse" />
        Escuchando en tiempo real
      </div>
      <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100 mb-1">
        Bandeja lista para recibir mensajes
      </h3>
      <p className="text-xs text-surface-500 max-w-sm mx-auto leading-relaxed">
        Copia la dirección activa y úsala para registros o verificaciones. Cualquier correo nuevo aparecerá de inmediato aquí.
      </p>
    </div>
  );
};
