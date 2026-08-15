import React, { useState } from 'react';
import { Bookmark, ChevronRight, Code, FileText } from 'lucide-react';
import { SavedMessage } from '../services/api';
import { formatTimeAgo } from '../utils/formatters';
import { sanitizeHtmlContent } from '../utils/sanitize';

interface SavedMessagesProps {
  messages: SavedMessage[];
  isLoading: boolean;
}

export const SavedMessages: React.FC<SavedMessagesProps> = ({ messages, isLoading }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');

  const selected = messages.find((m) => m.id === selectedId) || null;

  if (isLoading) {
    return (
      <div className="border border-surface-200 dark:border-surface-800 rounded-md bg-surface-0 dark:bg-surface-900 p-6 animate-pulse space-y-3">
        <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded w-1/3" />
        <div className="h-10 bg-surface-100 dark:bg-surface-900 rounded" />
        <div className="h-10 bg-surface-100 dark:bg-surface-900 rounded" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="border border-dashed border-surface-300 dark:border-surface-700 rounded-md p-8 text-center">
        <Bookmark className="w-5 h-5 text-surface-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
          Sin correos guardados
        </p>
        <p className="text-xs text-surface-500 max-w-sm mx-auto">
          Usa el botón «Guardar» en el visor de mensajes para conservar correos importantes. Los correos guardados persisten aunque la bandeja expire.
        </p>
      </div>
    );
  }

  // If a message is selected, show detail view
  if (selected) {
    const sanitizedHtml = sanitizeHtmlContent(selected.body_html);
    const hasHtml = Boolean(sanitizedHtml.trim());

    return (
      <div className="border border-surface-200 dark:border-surface-800 rounded-md bg-surface-0 dark:bg-surface-900 overflow-hidden">
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <button
            onClick={() => setSelectedId(null)}
            className="text-2xs font-medium text-accent-700 dark:text-accent-400 hover:underline mb-2"
          >
            ← Volver a guardados
          </button>
          <h2 className="text-base font-semibold text-surface-900 dark:text-surface-50 mb-1">
            {selected.subject || '(Sin asunto)'}
          </h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-surface-500">
            <span className="font-mono">{selected.from_address}</span>
            <span>{new Date(selected.received_at).toLocaleString('es-ES')}</span>
            <span className="text-2xs font-mono bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
              bandeja: {selected.original_inbox_email}
            </span>
          </div>
        </div>
        <div className="p-4">
          {hasHtml && selected.body_text && (
            <div className="flex items-center gap-0.5 mb-3">
              <button
                onClick={() => setActiveTab('html')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'html'
                    ? 'bg-accent-700 text-white'
                    : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                <Code className="h-3 w-3" /> HTML
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-accent-700 text-white'
                    : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
                }`}
              >
                <FileText className="h-3 w-3" /> Texto
              </button>
            </div>
          )}
          <div className="min-h-[180px] rounded-md p-4 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 overflow-x-auto">
            {activeTab === 'html' && hasHtml ? (
              <div className="email-body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
            ) : (
              <pre className="whitespace-pre-wrap font-mono text-xs text-surface-800 dark:text-surface-100 leading-relaxed">
                {selected.body_text || selected.body_html || '(Sin contenido)'}
              </pre>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="border border-surface-200 dark:border-surface-800 rounded-md bg-surface-0 dark:bg-surface-900 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-200 dark:border-surface-800">
        <span className="text-2xs font-mono uppercase tracking-wider text-surface-500 flex items-center gap-1">
          <Bookmark className="h-3 w-3" /> Guardados
        </span>
        <span className="text-2xs font-mono font-medium text-surface-500 bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
          {messages.length}
        </span>
      </div>

      <div className="divide-y divide-surface-100 dark:divide-surface-800 max-h-[520px] overflow-y-auto">
        {messages.map((msg) => (
          <button
            key={msg.id}
            onClick={() => { setSelectedId(msg.id); setActiveTab('html'); }}
            className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
          >
            <div className="pt-1 shrink-0">
              <Bookmark className="h-3 w-3 text-accent-600 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-sm font-medium text-surface-900 dark:text-surface-50 truncate">
                  {msg.from_address}
                </span>
                <span className="text-2xs text-surface-400 shrink-0 font-mono">
                  {formatTimeAgo(msg.received_at)}
                </span>
              </div>
              <p className="text-xs text-surface-600 dark:text-surface-300 truncate">
                {msg.subject || '(Sin asunto)'}
              </p>
              <p className="text-2xs text-surface-400 font-mono mt-0.5 truncate">
                {msg.original_inbox_email}
              </p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 self-center text-surface-300 dark:text-surface-600" />
          </button>
        ))}
      </div>
    </div>
  );
};
