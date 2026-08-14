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
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [copiedSubject, setCopiedSubject] = useState(false);

  if (isLoading) {
    return (
      <div className="p-8 glass-card rounded-3xl animate-pulse space-y-4">
        <div className="h-6 bg-black/[0.06] dark:bg-white/[0.08] rounded-xl w-1/4" />
        <div className="h-10 bg-black/[0.06] dark:bg-white/[0.08] rounded-2xl w-3/4" />
        <div className="h-48 bg-black/[0.04] dark:bg-white/[0.04] rounded-3xl" />
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = sanitizeHtmlContent(message.body_html);
  const showHtmlTab = Boolean(sanitizedHtml.trim());

  const handleCopySubject = () => {
    navigator.clipboard.writeText(message.subject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  return (
    <article aria-label="Detalle del mensaje" className="glass-card rounded-3xl overflow-hidden shadow-glass dark:shadow-glass-dark animate-fade-in">
      {/* Top Action Header */}
      <div className="p-5 sm:p-6 border-b border-black/[0.05] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-apple-blue dark:text-apple-blueDark hover:opacity-80 transition-opacity mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la bandeja</span>
        </button>

        <div className="flex items-start justify-between gap-3 mb-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-studio-900 dark:text-white tracking-tight">
            {message.subject || '(Sin asunto)'}
          </h2>

          <button
            onClick={handleCopySubject}
            className="p-2 rounded-xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] text-studio-600 dark:text-studio-300 transition-colors shrink-0"
            title="Copiar asunto"
          >
            {copiedSubject ? <Check className="w-4 h-4 text-apple-green" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Sender Metadata Box */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-studio-400 font-medium">De:</span>
            <span className="font-bold text-studio-900 dark:text-white font-mono">{message.from_address}</span>
          </div>

          <div className="flex items-center gap-3 text-studio-500 font-medium">
            <span>{new Date(message.received_at).toLocaleString('es-ES')}</span>
            <span className="px-2 py-0.5 rounded-lg glass-pill font-mono text-[10px]">
              {message.raw_size_kb} KB
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6">
        {/* Toggle between HTML & Plain Text if available */}
        {showHtmlTab && message.body_text && (
          <div className="flex items-center gap-2 mb-4 border-b border-black/[0.05] dark:border-white/[0.08] pb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'html'
                  ? 'bg-apple-blue text-white shadow-glow-blue/30 shadow-md'
                  : 'glass-pill text-studio-600 dark:text-studio-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Vista HTML</span>
            </button>

            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'text'
                  ? 'bg-apple-blue text-white shadow-glow-blue/30 shadow-md'
                  : 'glass-pill text-studio-600 dark:text-studio-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Texto Plano</span>
            </button>
          </div>
        )}

        {/* Rendered Body */}
        <div className="min-h-[240px] rounded-2xl p-5 sm:p-6 bg-white/70 dark:bg-black/40 border border-black/[0.06] dark:border-white/[0.06] overflow-x-auto shadow-inner">
          {activeTab === 'html' && showHtmlTab ? (
            <div
              className="prose dark:prose-invert max-w-none text-sm text-studio-900 dark:text-studio-100"
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-sans text-sm text-studio-800 dark:text-studio-200 leading-relaxed">
              {message.body_text || message.body_html || '(Mensaje sin contenido de texto)'}
            </pre>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-black/[0.05] dark:border-white/[0.08]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-studio-500 mb-3 flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-apple-blue" />
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
                    className="flex items-center justify-between p-3.5 rounded-2xl glass-pill hover:bg-black/[0.08] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-apple-blue/10 text-apple-blue flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-studio-900 dark:text-white truncate">
                          {att.filename}
                        </p>
                        <p className="text-[11px] text-studio-400 font-mono">
                          {formatFileSize(att.size_bytes)}
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-apple-blue text-white group-hover:scale-105 transition-transform shadow-sm">
                      <Download className="w-4 h-4" />
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