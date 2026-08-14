import React from 'react';
import { Mail, Paperclip, ChevronRight, Inbox as InboxIcon } from 'lucide-react';
import { MessageSummary } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';

interface InboxListProps {
  messages: MessageSummary[];
  selectedMessageId: string | null;
  onSelectMessage: (id: string) => void;
}

function getSenderInitial(from: string): string {
  if (!from) return '?';
  const clean = from.replace(/<.*?>/, '').trim();
  return clean.charAt(0).toUpperCase() || '?';
}

function getAvatarColor(char: string): string {
  const colors = [
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-purple-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-cyan-500 to-blue-600'
  ];
  const idx = char.charCodeAt(0) % colors.length;
  return colors[idx];
}

export const InboxList: React.FC<InboxListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage
}) => {
  return (
    <div className="w-full glass-card rounded-3xl overflow-hidden shadow-glass dark:shadow-glass-dark">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-black/[0.05] dark:border-white/[0.08] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-apple-blue/10 dark:bg-apple-blueDark/20 text-apple-blue dark:text-apple-blueDark flex items-center justify-center">
            <InboxIcon className="w-4 h-4" />
          </div>
          <h2 className="font-extrabold text-base text-studio-900 dark:text-white tracking-tight">
            Bandeja de Entrada
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full glass-pill text-studio-700 dark:text-studio-300 text-xs font-bold">
          {messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'}
        </span>
      </div>

      {/* Message Items */}
      <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] max-h-[520px] overflow-y-auto">
        {messages.map((msg) => {
          const isSelected = msg.id === selectedMessageId;
          const initial = getSenderInitial(msg.from_address);
          const avatarGradient = getAvatarColor(initial);

          return (
            <button
              key={msg.id}
              onClick={() => onSelectMessage(msg.id)}
              className={`w-full text-left p-4 sm:p-5 transition-all flex items-start justify-between gap-3 group relative ${
                isSelected
                  ? 'bg-apple-blue/10 dark:bg-apple-blueDark/15 border-l-4 border-l-apple-blue dark:border-l-apple-blueDark'
                  : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
              }`}
            >
              {/* Avatar Initial with subtle gradient */}
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${avatarGradient} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm shadow-black/10`}>
                {initial}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-apple-blue shrink-0 shadow-glow-blue/50" />
                    )}
                    <span className={`text-sm truncate ${!msg.is_read ? 'font-extrabold text-studio-900 dark:text-white' : 'font-semibold text-studio-700 dark:text-studio-300'}`}>
                      {msg.from_address}
                    </span>
                  </div>

                  <span className="text-xs text-studio-400 dark:text-studio-500 shrink-0 font-medium">
                    {formatTimeAgo(msg.received_at)}
                  </span>
                </div>

                <p className={`text-xs sm:text-sm truncate mb-1.5 ${!msg.is_read ? 'font-bold text-studio-800 dark:text-studio-100' : 'text-studio-500 dark:text-studio-400'}`}>
                  {msg.subject || '(Sin asunto)'}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-studio-400 font-medium">
                  <span>{msg.raw_size_kb} KB</span>
                  {msg.has_attachments && (
                    <span className="flex items-center gap-1 text-apple-blue dark:text-apple-blueDark">
                      <Paperclip className="w-3 h-3" />
                      <span>Adjunto</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-apple-blue translate-x-1' : 'text-studio-300 dark:text-studio-600 group-hover:translate-x-1'}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};