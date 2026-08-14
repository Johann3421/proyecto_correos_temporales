import React, { useState } from 'react';
import { clsx } from 'clsx';
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
  const [copiedAttachment, setCopiedAttachment] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-charcoal-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-soft dark:shadow-medium animate-pulse p-8 space-y-4">
        <div className="h-6 bg-charcoal-200 dark:bg-ink-700 rounded w-1/4" />
        <div className="h-8 bg-charcoal-200 dark:bg-ink-700 rounded w-3/4" />
        <div className="h-48 bg-charcoal-100 dark:bg-ink-800 rounded-xl" />
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = sanitizeHtmlContent(message.body_html);
  const showHtmlTab = Boolean(sanitizedHtml.trim());

  return (
    <div className="rounded-2xl border border-charcoal-200 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-soft dark:shadow-medium overflow-hidden animate-slide-up">
      <div className="p-4 sm:p-6 border-b border-charcoal-200 dark:border-ink-800 bg-charcoal-50/50 dark:bg-ink-800/50">
        <button
          onClick={onBack}
          className="btn-ghost btn-sm mb-4 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Volver</span>
        </button>

        <h2 className="text-heading-lg text-charcoal-900 dark:text-charcoal-100 mb-4 text-balance">
          {message.subject || '(Sin asunto)'}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800 text-caption">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-500 dark:text-charcoal-400 font-medium">De:</span>
            <span className="font-semibold text-charcoal-900 dark:text-charcoal-100 break-all">{message.from_address}</span>
          </div>

          <div className="flex items-center gap-3 text-charcoal-500 dark:text-charcoal-400 font-medium">
            <span>{new Date(message.received_at).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            <span className="px-2 py-0.5 rounded bg-charcoal-100 dark:bg-ink-700 text-charcoal-600 dark:text-charcoal-300 font-mono text-[10px]">
              {message.raw_size_kb} KB
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {showHtmlTab && message.body_text && (
          <div className="flex gap-2 mb-4 border-b border-charcoal-200 dark:border-ink-800 pb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={clsx(
                'btn-sm transition-all',
                activeTab === 'html'
                  ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800'
                  : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-ink-800'
              )}
            >
              <Code className="w-3.5 h-3.5" aria-hidden="true" />
              <span>HTML</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={clsx(
                'btn-sm transition-all',
                activeTab === 'text'
                  ? 'bg-sage-100 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800'
                  : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-ink-800'
              )}
            >
              <FileText className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Texto</span>
            </button>
          </div>
        )}

        <div className="min-h-[280px] rounded-xl p-4 sm:p-6 bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800">
          {activeTab === 'html' && showHtmlTab ? (
            <div
              className="prose dark:prose-invert max-w-none text-body-sm text-charcoal-800 dark:text-charcoal-200 overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-body-sm text-charcoal-800 dark:text-charcoal-200 leading-relaxed font-mono">
              {message.body_text || message.body_html || '(Mensaje sin contenido)'}
            </pre>
          )}
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-charcoal-200 dark:border-ink-800">
            <h4 className="text-overline text-charcoal-500 dark:text-charcoal-400 mb-3 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-sage-600 dark:text-sage-400" aria-hidden="true" />
              <span>Archivos adjuntos ({message.attachments.length})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.attachments.map((att) => {
                const downloadUrl = api.getAttachmentUrl(token, att.id);
                const isCopied = copiedAttachment === att.id;

                const handleCopyUrl = (e: React.MouseEvent) => {
                  e.preventDefault();
                  navigator.clipboard.writeText(downloadUrl);
                  setCopiedAttachment(att.id);
                  setTimeout(() => setCopiedAttachment(null), 2000);
                };

                return (
                  <a
                    key={att.id}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl bg-charcoal-50 dark:bg-ink-800 border border-charcoal-200 dark:border-ink-800 hover:border-sage-300 dark:hover:border-sage-700 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-charcoal-900 dark:text-charcoal-100 truncate">
                          {att.filename}
                        </p>
                        <p className="text-caption text-charcoal-500 dark:text-charcoal-400 font-mono">
                          {formatFileSize(att.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleCopyUrl}
                        className={clsx(
                          'btn-ghost btn-icon p-2 rounded-lg transition-colors',
                          isCopied ? 'bg-success-light dark:bg-success-dark/20 text-success-DEFAULT' : 'text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300'
                        )}
                        title={isCopied ? '¡Enlace copiado!' : 'Copiar enlace'}
                        aria-label={isCopied ? 'Enlace copiado al portapapeles' : 'Copiar enlace de descarga'}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 animate-bounce" aria-hidden="true" />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-icon p-2"
                        aria-label={`Descargar ${att.filename}`}
                      >
                        <Download className="w-4 h-4" aria-hidden="true" />
                      </a>
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