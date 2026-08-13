import React from 'react';
import { Mail, Paperclip, ChevronRight, Inbox as InboxIcon } from 'lucide-react';
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
  onSelectMessage
}) => {
  return (
    <div className="w-full bg-white dark:bg-obsidian-850 rounded-3xl border border-slate-200 dark:border-obsidian-700/80 overflow-hidden shadow-xl shadow-obsidian-950/5">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-obsidian-750 flex items-center justify-between bg-slate-50/50 dark:bg-obsidian-900/40">
        <div className="flex items-center gap-2.5">
          <InboxIcon className="w-5 h-5 text-brand-500" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Bandeja de Entrada
          </h2>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-obsidian-750 text-slate-700 dark:text-slate-300 text-xs font-bold">
          {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 dark:divide-obsidian-750 max-h-[500px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;

          return (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left p-4 sm:p-5 transition-all flex items-start justify-between gap-3 group relative ${
                isSelected
                  ? 'bg-brand-500/10 dark:bg-brand-500/15 border-l-4 border-l-brand-500'
                  : 'hover:bg-slate-50 dark:hover:bg-obsidian-800/60'
              }`}
            >
              {/* Unread blue/green indicator dot */}
              <div className="pt-1 shrink-0">
                {!msg.is_read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500 block shadow-sm shadow-brand-500/50" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              {/* Subject & Sender Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-sm truncate ${!msg.is_read ? 'font-extrabold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-300'}`}>
                    {msg.from_address}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p className={`text-xs truncate ${!msg.is_read ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>
                  {msg.subject || '(Sin asunto)'}
                </p>

                {msg.has_attachments && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5">
                    <Paperclip className="w-3 h-3 text-brand-500" />
                    <span>Contiene archivos adjuntos</span>
                  </div>
                )}
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-brand-500 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
