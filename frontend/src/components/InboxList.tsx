import React from 'react';
import { Paperclip, ChevronRight, Bookmark } from 'lucide-react';
import { MessageSummary } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';

interface InboxListProps {
  messages: MessageSummary[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
  onToggleSave?: (messageId: string, e: React.MouseEvent) => void;
}

export const InboxList: React.FC<InboxListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  onToggleSave,
}) => {
  return (
    <div className="border border-surface-200 dark:border-surface-800 rounded-md bg-surface-0 dark:bg-surface-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-200 dark:border-surface-800">
        <span className="text-2xs font-mono uppercase tracking-wider text-surface-500">
          Bandeja de entrada
        </span>
        <span className="text-2xs font-mono font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
          {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
        </span>
      </div>

      {/* Messages */}
      <div className="divide-y divide-surface-100 dark:divide-surface-800 max-h-[520px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;
          return (
            <div
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors cursor-pointer group ${
                isSelected
                  ? 'bg-accent-50 dark:bg-accent-900/20'
                  : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
              }`}
            >
              {/* Unread dot */}
              <div className="pt-1.5 shrink-0">
                <span
                  className={`block h-2 w-2 rounded-full ${
                    !msg.is_read ? 'bg-accent-600' : 'bg-surface-300 dark:bg-surface-700'
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span
                    className={`text-sm truncate ${
                      !msg.is_read
                        ? 'font-semibold text-surface-900 dark:text-surface-50'
                        : 'font-medium text-surface-600 dark:text-surface-300'
                    }`}
                  >
                    {msg.from_address}
                  </span>
                  <span className="text-2xs text-surface-400 shrink-0 font-mono">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p className={`text-xs truncate ${
                  !msg.is_read
                    ? 'text-surface-800 dark:text-surface-100 font-medium'
                    : 'text-surface-500 dark:text-surface-400'
                }`}>
                  {msg.subject || '(Sin asunto)'}
                </p>

                {msg.has_attachments && (
                  <div className="flex items-center gap-1 text-2xs text-surface-400 mt-0.5">
                    <Paperclip className="h-2.5 w-2.5" />
                    <span>Adjuntos</span>
                  </div>
                )}
              </div>

              {/* Quick Save button directly on the row */}
              <div className="flex items-center gap-1 self-center shrink-0">
                {onToggleSave && (
                  <button
                    onClick={(e) => onToggleSave(String(msg.id), e)}
                    className={`p-1 rounded transition-colors ${
                      msg.is_saved
                        ? 'text-accent-600 dark:text-accent-400 hover:bg-accent-100 dark:hover:bg-accent-900/30'
                        : 'text-surface-300 dark:text-surface-600 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 opacity-60 group-hover:opacity-100'
                    }`}
                    title={msg.is_saved ? 'Guardado en historial' : 'Guardar correo'}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${msg.is_saved ? 'fill-current' : ''}`} />
                  </button>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 ${
                    isSelected ? 'text-accent-600' : 'text-surface-300 dark:text-surface-600'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
