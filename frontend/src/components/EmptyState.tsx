import React from 'react';
import { Mail, Radio, Info } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-4">
        <Mail className="w-6 h-6" />
      </div>

      <div className="flex items-center justify-center gap-2 text-cobalt-600 dark:text-cobalt-400 font-bold text-xs uppercase tracking-wider mb-2">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span>Bandeja lista y esperando</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2">
        No has recibido ningún mensaje aún
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
        Copia la dirección de correo temporal superior y úsala en el servicio donde deseas registrarte o recibir información. Los correos entrantes se mostrarán automáticamente.
      </p>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-slate-700">
        <Info className="w-3.5 h-3.5 text-cobalt-600 dark:text-cobalt-400 shrink-0" />
        <span>Recepción en vivo activa mediante WebSockets</span>
      </div>
    </div>
  );
};