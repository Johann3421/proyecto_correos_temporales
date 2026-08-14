import React from 'react';

export const EmptyState: React.FC = () => {
  return (
    <div className="border border-dashed border-surface-300 dark:border-surface-700 rounded-md p-8 sm:p-12 text-center">
      <div className="text-2xs font-mono uppercase tracking-widest text-surface-400 mb-2">
        sin mensajes
      </div>
      <p className="text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
        Tu bandeja está lista y escuchando
      </p>
      <p className="text-xs text-surface-500 max-w-sm mx-auto">
        Copia la dirección de arriba y úsala donde necesites. Los mensajes aparecerán aquí en tiempo real.
      </p>
    </div>
  );
};
