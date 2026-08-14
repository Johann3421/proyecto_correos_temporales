import React from 'react';
import { Mail, Radio, ArrowDownToLine } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <div className="w-full glass-card rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center justify-center min-h-[340px] animate-fade-in relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute w-40 h-40 bg-apple-blue/10 dark:bg-apple-blueDark/10 rounded-full blur-3xl pointer-events-none" />

      {/* Radar Signal Icon */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="absolute w-28 h-28 rounded-full bg-apple-blue/10 dark:bg-apple-blueDark/15 animate-ping" />
        <div className="absolute w-20 h-20 rounded-full bg-apple-blue/15 dark:bg-apple-blueDark/20 animate-pulse" />
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-apple-blue to-apple-blueDark text-white flex items-center justify-center relative z-10 shadow-glow-blue/40 shadow-xl">
          <Mail className="w-8 h-8" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-apple-blue dark:text-apple-blueDark font-bold text-xs uppercase tracking-widest mb-2">
        <Radio className="w-3.5 h-3.5 animate-pulse" />
        <span>Esperando correos entrantes</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-extrabold text-studio-900 dark:text-white mb-2">
        Tu bandeja está lista
      </h3>
      <p className="text-xs sm:text-sm text-studio-500 dark:text-studio-400 max-w-md mx-auto mb-6 leading-relaxed">
        Copia tu dirección de correo arriba y úsala en cualquier sitio web o aplicación. Los correos entrantes aparecerán aquí al instante sin recargar la página.
      </p>

      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-pill text-xs font-semibold text-studio-600 dark:text-studio-300">
        <ArrowDownToLine className="w-4 h-4 text-apple-green shrink-0" />
        <span>Actualización en tiempo real vía WebSockets activa</span>
      </div>
    </div>
  );
};