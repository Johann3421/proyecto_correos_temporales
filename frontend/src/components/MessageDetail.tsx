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
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-36 bg-slate-100 dark:bg-slate-950 rounded" />
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
    <article aria-label="Detalle del mensaje" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-cobalt-600 dark:text-cobalt-400 hover:underline mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la lista</span>
        </button>

        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            {message.subject || '(Sin asunto)'}
          </h2>

          <button
            onClick={handleCopySubject}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors shrink-0"
            title="Copiar asunto"
          >
            {copiedSubject ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* RFC Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
          <div>
            <span className="text-slate-500">De: </span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{message.from_address}</span>
          </div>
          <div className="sm:text-right text-slate-500">
            <span>{new Date(message.received_at).toLocaleString('es-ES')}</span>
            <span className="ml-2 font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {message.raw_size_kb} KB
            </span>
          </div>
        </div>
      </div>

      {/* Content Tabs & Body */}
      <div className="p-4 sm:p-5">
        {/* Toggle HTML / Plain text */}
        {hasHtml && message.body_text && (
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeTab === 'html'
                  ? 'bg-cobalt-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Formato HTML</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                activeTab === 'text'
                  ? 'bg-cobalt-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Texto Plano</span>
            </button>
          </div>
        )}

        {/* Email Body */}
        <div className="min-h-[220px] rounded-lg p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          {activeTab === 'html' && hasHtml ? (
            <div
              className="prose dark:prose-invert max-w-none text-sm text-slate-900 dark:text-slate-100"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {message.body_text || message.body_html || '(Mensaje sin contenido de texto)'}
            </pre>
          )}
        </div>

        {/* Attachments Section */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-cobalt-600" />
              <span>Archivos adjuntos ({message.attachments.length})</span>
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
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-cobalt-500 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText className="w-4 h-4 text-cobalt-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {formatFileSize(att.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="p-1.5 rounded bg-cobalt-600 text-white group-hover:bg-cobalt-700 transition-colors">
                      <Download className="w-3.5 h-3.5" />
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