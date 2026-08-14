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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4 text-slate-500" />
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Mensajes recibidos
          </span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {messages.length}
        </span>
      </div>

      {/* Message Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;

          return (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left p-4 transition-colors flex items-start justify-between gap-3 ${
                isSelected
                  ? 'bg-cobalt-50 dark:bg-cobalt-950/40 border-l-4 border-l-cobalt-600'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              {/* Unread indicator */}
              <div className="pt-1.5 shrink-0">
                {!msg.is_read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-cobalt-600 block" title="Mensaje no leído" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-transparent block" />
                )}
              </div>

              {/* Message Summary */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={`text-sm truncate ${
                      !msg.is_read
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'font-medium text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {msg.from_address}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p
                  className={`text-xs truncate ${
                    !msg.is_read
                      ? 'font-semibold text-slate-800 dark:text-slate-200'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {msg.subject || '(Sin asunto)'}
                </p>

                {msg.has_attachments && (
                  <div className="flex items-center gap-1 text-[11px] text-cobalt-600 dark:text-cobalt-400 font-medium mt-1.5">
                    <Paperclip className="w-3 h-3" />
                    <span>Contiene archivos adjuntos</span>
                  </div>
                )}
              </div>

              <ChevronRight
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isSelected ? 'text-cobalt-600 translate-x-0.5' : 'text-slate-400'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};