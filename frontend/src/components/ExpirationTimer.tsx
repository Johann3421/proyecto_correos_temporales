import React from 'react';
import { clsx } from 'clsx';
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

  const isWarning = remainingSeconds < 600; // 10 minutes
  const isCritical = remainingSeconds < 180; // 3 minutes

  const ringColor = isCritical
    ? 'text-error-DEFAULT'
    : isWarning
      ? 'text-warning-DEFAULT'
      : 'text-sage-500';

  const textColor = isCritical
    ? 'text-error-DEFAULT animate-pulse'
    : isWarning
      ? 'text-warning-DEFAULT'
      : 'text-sage-600 dark:text-sage-400';

  const borderColor = isCritical
    ? 'border-error-DEFAULT/40'
    : isWarning
      ? 'border-warning-DEFAULT/40'
      : 'border-sage-500/30';

  const bgColor = isCritical
    ? 'bg-error-light dark:bg-error-dark/10'
    : isWarning
      ? 'bg-warning-light dark:bg-warning-dark/10'
      : 'bg-sage-50 dark:bg-sage-900/20';

  const dash = `${percentage} 100`;

  const extensions = [
    { minutes: 10, label: '+10 min' },
    { minutes: 60, label: '+1 hora' },
    { minutes: 1440, label: '+24 hrs', hidden: 'hidden lg:flex' },
  ];

  return (
    <div className={clsx(
      'rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4',
      'bg-white dark:bg-ink-900 shadow-soft dark:shadow-medium',
      bgColor,
      borderColor
    )}>
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <path
              className="text-charcoal-200 dark:text-ink-800"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className={clsx('transition-all duration-1000 ease-linear', ringColor)}
              strokeDasharray={dash}
              strokeWidth="3"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <Hourglass className="w-5 h-5 absolute text-charcoal-400 dark:text-charcoal-500" aria-hidden="true" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-caption font-medium text-charcoal-500 dark:text-charcoal-400 mb-1">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>Tiempo restante</span>
          </div>
          <div className={clsx('text-xl sm:text-2xl font-bold font-mono tabular-nums', textColor)}>
            {formatRemainingTime(remainingSeconds)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
        {extensions.map((ext) => (
          <button
            key={ext.minutes}
            onClick={() => onExtendTime(ext.minutes)}
            className={clsx(
              'btn-secondary btn-sm flex items-center gap-1.5',
              ext.hidden
            )}
          >
            <Plus className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
            <span>{ext.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};