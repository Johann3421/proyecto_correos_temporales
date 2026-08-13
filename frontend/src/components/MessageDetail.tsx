import React, { useState } from 'react';
import { ArrowLeft, Paperclip, Download, ShieldCheck, FileText, Code } from 'lucide-react';
import { MessageDetail as IMessageDetail, api } from '../services/api';
import { sanitizeHtmlContent } from '../utils/sanitize';
import { formatFileSize } from '../utils/formatters';

interface MessageDetailProps {
  token: string;
  message: IMessageDetail | null;
  isLoading: boolean;
  onBack: () => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  token,
  message,
  isLoading,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');

  if (isLoading) {
    return (
      <div className="p-8 bg-white dark:bg-obsidian-850 rounded-3xl border border-slate-200 dark:border-obsidian-700 animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-obsidian-750 rounded w-1/4" />
        <div className="h-8 bg-slate-200 dark:bg-obsidian-750 rounded w-3/4" />
        <div className="h-40 bg-slate-100 dark:bg-obsidian-900 rounded-2xl" />
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = sanitizeHtmlContent(message.body_html);
  const showHtmlTab = Boolean(sanitizedHtml.trim());

  return (
    <div className="bg-white dark:bg-obsidian-850 rounded-3xl border border-slate-200 dark:border-obsidian-700/80 overflow-hidden shadow-xl shadow-obsidian-950/5 animate-fade-in">
      {/* Header Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-obsidian-750 bg-slate-50/50 dark:bg-obsidian-900/40">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la lista</span>
        </button>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mb-3">
          {message.subject || '(Sin asunto)'}
        </h2>

        {/* Sender metadata info card */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100/70 dark:bg-obsidian-800/70 border border-slate-200/70 dark:border-obsidian-700/50 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-medium">De: </span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{message.from_address}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <span>{new Date(message.received_at).toLocaleString("es-ES")}</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-obsidian-700 text-slate-700 dark:text-slate-300 font-mono text-[10px]">
              {message.raw_size_kb} KB
            </span>
          </div>
        </div>
      </div>

      {/* View Tabs & Content */}
      <div className="p-4 sm:p-6">
        {/* Tab Selection if both HTML and Text exist */}
        {showHtmlTab && message.body_text && (
          <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-obsidian-750 pb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'html'
                  ? 'bg-brand-500 text-obsidian-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Formato HTML</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'text'
                  ? 'bg-brand-500 text-obsidian-950 shadow-md shadow-brand-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-obsidian-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Texto Plano</span>
            </button>
          </div>
        )}

        {/* Email Body Renderer */}
        <div className="min-h-[220px] rounded-2xl p-4 sm:p-6 bg-slate-50/50 dark:bg-obsidian-900/50 border border-slate-200/60 dark:border-obsidian-750">
          {activeTab === 'html' && showHtmlTab ? (
            <div
              className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {message.body_text || message.body_html || '(Mensaje sin contenido)'}
            </pre>
          )}
        </div>

        {/* Attachments Section */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-obsidian-750">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-brand-500" />
              <span>Archivos Adjuntos ({message.attachments.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.attachments.map((att) => {
                const downloadUrl = api.getAttachmentUrl(token, att.id);

                return (
                  <a
                    key={att.id}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 hover:border-brand-500/50 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {formatFileSize(att.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-obsidian-700 text-slate-600 dark:text-slate-300 group-hover:bg-brand-500 group-hover:text-obsidian-950 transition-colors">
                      <Download className="w-4 h-4" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
