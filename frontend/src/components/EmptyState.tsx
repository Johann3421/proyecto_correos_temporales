import React from 'react';
import { Mail, Radio } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white/60 dark:bg-obsidian-850/60 border border-dashed border-slate-300 dark:border-obsidian-700/80 my-4 min-h-[320px]">
      {/* Radar Pulse Graphic */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-28 h-28 rounded-full bg-brand-500/10 dark:bg-brand-500/20 animate-radar-ping" />
        <div className="absolute w-20 h-20 rounded-full bg-brand-500/20 dark:bg-brand-500/30 animate-pulse" />
        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-500 flex items-center justify-center relative z-10 shadow-lg shadow-brand-500/10">
          <Mail className="w-7 h-7" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase tracking-widest mb-1.5">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span>Buscando mensajes entrantes</span>
      </div>

      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
        Tu bandeja está lista y esperando
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        Copia tu dirección de correo temporal arriba y úsala en el servicio que desees. Los correos aparecerán aquí automáticamente en tiempo real.
      </p>
    </div>
  );
};
