import React from 'react';
import { clsx } from 'clsx';
import { Mail, Paperclip, ChevronRight } from 'lucide-react';
import { MessageSummary } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';

interface InboxListProps {
  messages: MessageSummary[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
}

export const InboxList: React.FC<InboxListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
}) => {
  if (messages.length === 0) return null;

  return (
    <div className="rounded-2xl border border-charcoal-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-soft dark:shadow-medium overflow-hidden animate-slide-up">
      <div className="p-4 sm:p-5 border-b border-charcoal-200 dark:border-ink-800 bg-charcoal-50/50 dark:bg-ink-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-sage-600 dark:text-sage-400" aria-hidden="true" />
            <h2 className="text-heading-sm text-charcoal-900 dark:text-charcoal-100">
              Bandeja de entrada
            </h2>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-charcoal-100 dark:bg-ink-800 text-charcoal-600 dark:text-charcoal-300 text-caption font-medium">
            {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
          </span>
        </div>
      </div>

      <div className="divide-y divide-charcoal-200 dark:divide-ink-800 max-h-[500px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;

          return (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={clsx(
                'w-full text-left p-4 sm:p-5 transition-all flex items-start justify-between gap-3 group relative',
                isSelected
                  ? 'bg-sage-50 dark:bg-sage-900/20 border-l-4 border-l-sage-500'
                  : 'hover:bg-charcoal-50 dark:hover:bg-ink-800/50'
              )}
            >
              <div className="pt-1 shrink-0">
                {!msg.is_read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-sage-500 block shadow-sm shadow-sage-500/30" aria-label="No leído" />
                ) : (
                  <Mail className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500" aria-hidden="true" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={clsx(
                    'text-body-sm truncate',
                    !msg.is_read
                      ? 'font-bold text-charcoal-900 dark:text-charcoal-100'
                      : 'font-medium text-charcoal-700 dark:text-charcoal-300'
                  )}>
                    {msg.from_address}
                  </span>
                  <span className="text-caption text-charcoal-400 dark:text-charcoal-500 shrink-0 font-medium">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p className={clsx(
                  'text-caption truncate',
                  !msg.is_read
                    ? 'font-semibold text-charcoal-800 dark:text-charcoal-200'
                    : 'text-charcoal-500 dark:text-charcoal-400'
                )}>
                  {msg.subject || '(Sin asunto)'}
                </p>

                {msg.has_attachments && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-charcoal-400 dark:text-charcoal-500 mt-1.5">
                    <Paperclip className="w-3 h-3 text-sage-500" aria-hidden="true" />
                    <span>Adjuntos</span>
                  </div>
                )}
              </div>

              <ChevronRight className={clsx(
                'w-4 h-4 shrink-0 transition-transform',
                isSelected ? 'text-sage-500 translate-x-0.5' : 'text-charcoal-300 dark:text-charcoal-600 group-hover:translate-x-0.5'
              )} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
};