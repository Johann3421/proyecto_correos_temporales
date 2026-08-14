import React, { useState } from 'react';
import { ArrowLeft, Paperclip, Download, FileText, Code, Copy, Check } from 'lucide-react';
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
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [copiedSubject, setCopiedSubject] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-stone-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 shadow-soft animate-pulse space-y-4">
        <div className="h-4 bg-stone-200 dark:bg-ink-800 rounded w-1/4" />
        <div className="h-6 bg-stone-200 dark:bg-ink-800 rounded w-3/4" />
        <div className="h-40 bg-paper-100 dark:bg-ink-950 rounded-xl" />
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = sanitizeHtmlContent(message.body_html);
  const hasHtml = Boolean(sanitizedHtml.trim());

  const handleCopySubject = () => {
    navigator.clipboard.writeText(message.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  return (
    <article className="rounded-2xl border border-stone-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 overflow-hidden shadow-soft">
      {/* Header */}
      <div className="p-5 border-b border-stone-200 dark:border-ink-800 bg-paper-100 dark:bg-ink-950">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-clay-600 dark:text-clay-400 hover:underline mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a la lista</span>
        </button>

        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-ink-900 dark:text-paper-50 text-balance">
            {message.subject || '(Sin asunto)'}
          </h2>
          <button
            onClick={handleCopySubject}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-stone-200 dark:border-ink-800 hover:bg-paper-100 dark:hover:bg-ink-800 text-stone-600 dark:text-stone-400 transition-colors"
            title="Copiar asunto"
          >
            {copiedSubject ? <Check className="h-3.5 w-3.5 text-olive-600" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs border-t border-stone-200 dark:border-ink-800 pt-3">
          <div className="text-stone-500 dark:text-stone-400">
            De:{' '}
            <span className="font-mono font-semibold text-ink-800 dark:text-paper-100 break-all">
              {message.from_address}
            </span>
          </div>
          <div className="sm:text-right text-stone-500 dark:text-stone-400">
            <span>{new Date(message.received_at).toLocaleString('es-ES')}</span>
            <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-stone-200 dark:bg-ink-800 text-ink-700 dark:text-paper-100">
              {message.raw_size_kb} KB
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {hasHtml && message.body_text && (
          <div className="flex items-center gap-1 mb-4 border-b border-stone-200 dark:border-ink-800 pb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'html'
                  ? 'bg-clay-600 text-paper-50'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              HTML
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-clay-600 text-paper-50'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Texto
            </button>
          </div>
        )}

        <div className="min-h-[220px] rounded-xl p-4 sm:p-5 bg-white dark:bg-ink-950 border border-stone-200 dark:border-ink-800 overflow-x-auto">
          {activeTab === 'html' && hasHtml ? (
            <div className="email-body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-ink-800 dark:text-paper-100 leading-relaxed">
              {message.body_text || message.body_html || '(Mensaje sin contenido de texto)'}
            </pre>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-200 dark:border-ink-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-clay-600 dark:text-clay-400" />
              <span>Adjuntos ({message.attachments.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.attachments.map((att) => {
                const downloadUrl = api.getAttachmentUrl(token, att.id);
                return (
                  <a
                    key={att.id}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-paper-100 dark:bg-ink-950 border border-stone-200 dark:border-ink-800 hover:border-clay-400 dark:hover:border-clay-600 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="h-4 w-4 text-clay-600 dark:text-clay-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink-900 dark:text-paper-50 truncate">
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                          {formatFileSize(att.size_bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-clay-600 text-paper-50 group-hover:bg-clay-700 transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
