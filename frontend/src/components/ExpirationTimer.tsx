import React from 'react';
import { Clock, Plus, Hourglass } from 'lucide-react';
import { formatRemainingTime } from '../utils/formatters';

interface ExpirationTimerProps {
  remainingSeconds: number;
  createdAt: string;
  expiresAt: string;
  onExtendTime: (minutes: number) => void;
}

export const ExpirationTimer: React.FC<ExpirationTimerProps> = ({
  remainingSeconds,
  createdAt,
  expiresAt,
  onExtendTime,
}) => {
  const totalSeconds = Math.max(
    1,
    Math.round((new Date(expiresAt).getTime() - new Date(createdAt).getTime()) / 1000),
  );

  const percentage = Math.min(100, Math.max(0, (remainingSeconds / totalSeconds) * 100));

  let colorClass = 'text-apple-blue stroke-apple-blue';
  let badgeClass = 'text-apple-blue dark:text-apple-blueDark';
  if (remainingSeconds < 120) {
    colorClass = 'text-apple-amber stroke-apple-amber';
    badgeClass = 'text-apple-amber';
  }
  if (remainingSeconds < 30) {
    colorClass = 'text-apple-red stroke-apple-red';
    badgeClass = 'text-apple-red animate-pulse';
  }

  const dash = `${percentage} 100`;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl glass-card transition-all">
      {/* Time Display with Circular Ring */}
      <div className="flex items-center gap-3.5 w-full sm:w-auto">
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-black/[0.06] dark:text-white/[0.08]"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={`transition-all duration-1000 ease-linear ${colorClass}`}
              strokeDasharray={dash}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Hourglass className="w-4 h-4 absolute text-studio-600 dark:text-studio-300" />
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-studio-500 dark:text-studio-400 flex items-center gap-1.5 mb-0.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Tiempo de vida del correo</span>
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono ${badgeClass}`}>
            {formatRemainingTime(remainingSeconds)}
          </div>
        </div>
      </div>

      {/* Extension Pills */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button
          onClick={() => onExtendTime(10)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-studio-800 dark:text-studio-200 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-apple-blue" />
          <span>+10 Min</span>
        </button>

        <button
          onClick={() => onExtendTime(60)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-studio-800 dark:text-studio-200 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-apple-blue" />
          <span>+1 Hora</span>
        </button>

        <button
          onClick={() => onExtendTime(1440)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-xs font-bold text-studio-800 dark:text-studio-200 transition-all active:scale-95 shadow-sm hidden md:flex"
        >
          <Plus className="w-3.5 h-3.5 text-apple-blue" />
          <span>+24 Horas</span>
        </button>
      </div>
    </div>
  );
};