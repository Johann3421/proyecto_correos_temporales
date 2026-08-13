import React from 'react';
import { Clock, Plus, Hourglass } from 'lucide-react';
import { formatRemainingTime } from '../utils/formatters';

interface ExpirationTimerProps {
  remainingSeconds: number;
  /** ISO string of inbox creation timestamp */
  createdAt: string;
  /** ISO string of inbox expiry timestamp */
  expiresAt: string;
  onExtendTime: (minutes: number) => void;
}

export const ExpirationTimer: React.FC<ExpirationTimerProps> = ({
  remainingSeconds,
  createdAt,
  expiresAt,
  onExtendTime,
}) => {
  // Compute total lifespan dynamically so the ring stays accurate after extensions
  const totalSeconds = Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - new Date(createdAt).getTime()) / 1000),
  );

  const percentage = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));

  // Colour shifts as time runs low
  let ringColor = 'text-brand-500';
  let textColor = 'text-brand-500';
  let borderClass = 'border-brand-500/30';
  if (remainingSeconds < 120) {
    ringColor = 'text-amber-500';
    textColor = 'text-amber-500 animate-pulse';
    borderClass = 'border-amber-500/40';
  }
  if (remainingSeconds < 30) {
    ringColor = 'text-rose-500';
    textColor = 'text-rose-500 animate-bounce';
    borderClass = 'border-rose-500/50';
  }

  // Stroke-dasharray percentage for SVG circle (circumference ≈ 100 viewBox units)
  const dash = `${percentage} 100`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-obsidian-850 border border-slate-200 dark:border-obsidian-700/70">
      {/* Radial ring + time readout */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Track */}
            <path
              className="text-slate-200 dark:text-obsidian-700"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress arc */}
            <path
              className={`transition-all duration-1000 ease-linear ${ringColor}`}
              strokeDasharray={dash}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Hourglass className="w-4 h-4 absolute text-slate-700 dark:text-slate-300" />
        </div>

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempo restante de tu correo</span>
          </div>
          <div className={`text-xl font-bold font-mono ${textColor}`}>
            {formatRemainingTime(remainingSeconds)}
          </div>
        </div>
      </div>

      {/* Extension pills */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => onExtendTime(10)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 border ${borderClass} hover:bg-slate-50 dark:hover:bg-obsidian-750 shadow-sm active:scale-95`}
        >
          <Plus className="w-3.5 h-3.5 text-brand-500" />
          <span>+10 Minutos</span>
        </button>

        <button
          onClick={() => onExtendTime(60)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-obsidian-700 hover:bg-slate-50 dark:hover:bg-obsidian-750 shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-brand-500" />
          <span>+1 Hora</span>
        </button>

        <button
          onClick={() => onExtendTime(1440)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-white dark:bg-obsidian-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-obsidian-700 hover:bg-slate-50 dark:hover:bg-obsidian-750 shadow-sm active:scale-95 hidden lg:flex"
        >
          <Plus className="w-3.5 h-3.5 text-brand-500" />
          <span>+24 Horas</span>
        </button>
      </div>
    </div>
  );
};
