import React, { useState, useEffect } from 'react';
import { BarChart3, Inbox, Mail, Bookmark, Globe, Calendar, RotateCw } from 'lucide-react';
import { api, StatsData } from '../services/api';

interface StatsViewProps {
  sessionToken: string;
}

export const StatsView: React.FC<StatsViewProps> = ({ sessionToken }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUserStats(sessionToken);
      setStats(data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionToken) {
      loadStats();
    }
  }, [sessionToken]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900 h-24" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const maxDaily = Math.max(1, ...stats.messages_by_day.map((d) => d.count));
  const maxDomain = Math.max(1, ...stats.top_senders.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Top metrics cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between text-surface-500 mb-2">
            <span className="text-2xs font-mono uppercase tracking-wider">Total Recibidos</span>
            <Mail className="w-4 h-4 text-accent-500" />
          </div>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {stats.total_messages_received}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between text-surface-500 mb-2">
            <span className="text-2xs font-mono uppercase tracking-wider">Buzones Activos</span>
            <Inbox className="w-4 h-4 text-ok-DEFAULT" />
          </div>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {stats.active_inboxes}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between text-surface-500 mb-2">
            <span className="text-2xs font-mono uppercase tracking-wider">Guardados</span>
            <Bookmark className="w-4 h-4 text-accent-600" />
          </div>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {stats.saved_messages_count}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between text-surface-500 mb-2">
            <span className="text-2xs font-mono uppercase tracking-wider">Total Creados</span>
            <Globe className="w-4 h-4 text-surface-400" />
          </div>
          <div className="text-2xl font-bold text-surface-900 dark:text-surface-50">
            {stats.total_inboxes}
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Sender Domains */}
        <div className="p-5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-accent-500" />
              Principales Dominios Remitentes
            </h3>
            <span className="text-2xs font-mono text-surface-400">Top 5</span>
          </div>

          {stats.top_senders.length === 0 ? (
            <p className="text-xs text-surface-500 py-6 text-center">
              Aún no se han recibido correos para analizar dominios.
            </p>
          ) : (
            <div className="space-y-3">
              {stats.top_senders.map((s, idx) => {
                const pct = Math.round((s.count / maxDomain) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-surface-700 dark:text-surface-200 truncate">
                        @{s.domain}
                      </span>
                      <span className="text-surface-500 font-semibold">{s.count} msgs</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 7-Day Activity Chart */}
        <div className="p-5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-surface-900 dark:text-surface-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-ok-DEFAULT" />
              Actividad Reciente (Últimos 7 días)
            </h3>
            <button
              onClick={loadStats}
              className="p-1 text-surface-400 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
              title="Actualizar estadísticas"
            >
              <RotateCw className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-end justify-between h-36 pt-4 gap-2">
            {stats.messages_by_day.map((d, idx) => {
              const heightPct = Math.max(8, Math.round((d.count / maxDaily) * 100));
              const dayLabel = new Date(d.date + "T00:00:00").toLocaleDateString("es-ES", {
                weekday: "short",
                day: "numeric",
              });

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-2xs font-mono font-medium text-surface-500">
                    {d.count > 0 ? d.count : '-'}
                  </span>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-t-sm overflow-hidden flex items-end h-20">
                    <div
                      className="w-full bg-accent-500/80 dark:bg-accent-600 hover:bg-accent-600 transition-all rounded-t-sm"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-2xs font-mono text-surface-400 uppercase truncate text-center w-full">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
