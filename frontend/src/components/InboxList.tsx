import React from 'react';
import { Paperclip, ChevronRight, Inbox as InboxIcon } from 'lucide-react';
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
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 overflow-hidden shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950">
        <div className="flex items-center gap-2">
          <InboxIcon className="h-4 w-4 text-clay-600 dark:text-clay-400" />
          <span className="font-serif font-semibold text-sm text-ink-900 dark:text-paper-50">
            Bandeja
          </span>
        </div>
        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-stone-200 dark:bg-ink-800 text-ink-700 dark:text-paper-100">
          {messages.length}
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-200 dark:divide-ink-800 max-h-[560px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;
          return (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 transition-colors ${
                isSelected
                  ? 'bg-clay-50 dark:bg-clay-950/30 border-l-2 border-l-clay-500'
                  : 'hover:bg-paper-100 dark:hover:bg-ink-800/60 border-l-2 border-l-transparent'
              }`}
            >
              <div className="pt-1.5 shrink-0">
                {!msg.is_read ? (
                  <span className="block h-2.5 w-2.5 rounded-full bg-clay-500" title="No leído" />
                ) : (
                  <span className="block h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-ink-700" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`text-sm truncate ${
                      !msg.is_read
                        ? 'font-bold text-ink-900 dark:text-paper-50'
                        : 'font-medium text-ink-700 dark:text-stone-300'
                    }`}
                  >
                    {msg.from_address}
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 shrink-0">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p
                  className={`text-xs truncate ${
                    !msg.is_read
                      ? 'font-semibold text-ink-800 dark:text-paper-100'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {msg.subject || '(Sin asunto)'}
                </p>

                {msg.has_attachments && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-clay-600 dark:text-clay-400 mt-1">
                    <Paperclip className="h-3 w-3" />
                    <span>Adjuntos</span>
                  </div>
                )}
              </div>

              <ChevronRight
                className={`h-4 w-4 shrink-0 self-center transition-transform ${
                  isSelected ? 'text-clay-500 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
