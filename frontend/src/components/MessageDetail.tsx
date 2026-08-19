import React, { useState } from 'react';
import { ArrowLeft, Paperclip, Download, FileText, Code, Copy, Check, Bookmark, FileCode, Printer, Filter } from 'lucide-react';
import { MessageDetail as IMessageDetail, api } from '../services/api';
import { sanitizeHtmlContent } from '../utils/sanitize';
import { formatFileSize } from '../utils/formatters';

interface MessageDetailProps {
  token: string;
  sessionToken: string;
  message: IMessageDetail | null;
  isLoading: boolean;
  onBack: () => void;
  onSaveToggled: (messageId: string, saved: boolean) => void;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  token,
  sessionToken,
  message,
  isLoading,
  onBack,
  onSaveToggled,
}) => {
  const [activeTab, setActiveTab] = useState<'html' | 'text'>('html');
  const [copiedFrom, setCopiedFrom] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="p-5 border border-surface-200 dark:border-surface-800 rounded-xl bg-surface-0 dark:bg-surface-900 animate-pulse space-y-3">
        <div className="h-3 bg-surface-200 dark:bg-surface-800 rounded w-1/4" />
        <div className="h-5 bg-surface-200 dark:bg-surface-800 rounded w-3/4" />
        <div className="h-32 bg-surface-100 dark:bg-surface-900 rounded" />
      </div>
    );
  }

  if (!message) return null;

  const sanitizedHtml = sanitizeHtmlContent(message.body_html);
  const hasHtml = Boolean(sanitizedHtml.trim());

  const handleCopyFrom = () => {
    navigator.clipboard.writeText(message.from_address);
    setCopiedFrom(true);
    setTimeout(() => setCopiedFrom(false), 2000);
  };

  const handleToggleSave = async () => {
    setIsSaving(true);
    try {
      const result = await api.toggleSaveMessage(token, String(message.id), sessionToken);
      onSaveToggled(String(message.id), result.saved);
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  const emlExportUrl = api.getExportEmlUrl(token, String(message.id));
  const htmlExportUrl = api.getExportHtmlUrl(token, String(message.id));

  return (
    <article className="border border-surface-200 dark:border-surface-800 rounded-xl bg-surface-0 dark:bg-surface-900 overflow-hidden shadow-sm">
      {/* Meta header */}
      <div className="p-4 sm:p-5 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-2xs font-medium text-accent-700 dark:text-accent-400 hover:underline lg:hidden"
          >
            <ArrowLeft className="h-3 w-3" />
            Volver
          </button>

          <div className="flex items-center gap-1.5 ml-auto">
            {/* Export .eml */}
            <a
              href={emlExportUrl}
              download
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-surface-200 dark:border-surface-700 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Descargar correo original (.eml)"
            >
              <FileCode className="h-3.5 w-3.5 text-accent-600" />
              <span className="hidden sm:inline">.eml</span>
            </a>

            {/* Export HTML / Print */}
            <a
              href={htmlExportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-surface-200 dark:border-surface-700 text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              title="Ver versión imprimible / Exportar PDF"
            >
              <Printer className="h-3.5 w-3.5 text-accent-600" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </a>

            {/* Save / Bookmark button */}
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${
                message.is_saved
                  ? 'bg-accent-600 text-white hover:bg-accent-700'
                  : 'border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700'
              } disabled:opacity-40`}
              title={message.is_saved ? 'Guardado en historial permanente' : 'Guardar este correo en mi historial'}
            >
              <Bookmark className={`h-3.5 w-3.5 ${message.is_saved ? 'fill-current' : ''}`} />
              <span>{message.is_saved ? 'Guardado ✓' : 'Guardar'}</span>
            </button>
          </div>
        </div>

        <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-50 mb-2 text-balance leading-snug">
          {message.subject || '(Sin asunto)'}
        </h2>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-surface-500">
          <button
            onClick={handleCopyFrom}
            className="flex items-center gap-1 font-mono hover:text-surface-900 dark:hover:text-surface-100 transition-colors"
            title="Copiar remitente"
          >
            {copiedFrom ? <Check className="h-3 w-3 text-ok-DEFAULT" /> : <Copy className="h-3 w-3" />}
            <span>{message.from_address}</span>
          </button>
          <span>{new Date(message.received_at).toLocaleString('es-ES')}</span>
          <span className="font-mono text-2xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded">
            {message.raw_size_kb} KB
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5">
        {hasHtml && message.body_text && (
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() => setActiveTab('html')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'html'
                  ? 'bg-accent-700 text-white'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <Code className="h-3 w-3" />
              HTML
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'text'
                  ? 'bg-accent-700 text-white'
                  : 'text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <FileText className="h-3 w-3" />
              Texto plano
            </button>
          </div>
        )}

        <div className="min-h-[200px] rounded-lg p-4 bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 overflow-x-auto">
          {activeTab === 'html' && hasHtml ? (
            <div className="email-body" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-xs text-surface-800 dark:text-surface-100 leading-relaxed">
              {message.body_text || message.body_html || '(Mensaje sin contenido)'}
            </pre>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-800">
            <h4 className="text-2xs font-mono uppercase tracking-wider text-surface-500 mb-2 flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              Adjuntos ({message.attachments.length})
            </h4>
            <div className="space-y-1.5">
              {message.attachments.map((att) => {
                const downloadUrl = api.getAttachmentUrl(token, att.id);
                return (
                  <a
                    key={att.id}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-surface-200 dark:border-surface-800 hover:border-accent-400 dark:hover:border-accent-600 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-surface-400 shrink-0" />
                      <span className="text-xs font-medium text-surface-900 dark:text-surface-50 truncate">
                        {att.filename}
                      </span>
                      <span className="text-2xs text-surface-400 font-mono shrink-0">
                        {formatFileSize(att.size_bytes)}
                      </span>
                    </div>
                    <Download className="h-3.5 w-3.5 text-surface-400 group-hover:text-accent-600 transition-colors shrink-0" />
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
