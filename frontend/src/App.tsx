import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { Toast } from './components/Toast';
import { useInbox } from './hooks/useInbox';
import { api, MessageDetail as IMessageDetail } from './services/api';
import { AlertCircle, RefreshCw, Mailbox, Clock } from 'lucide-react';

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<IMessageDetail | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const {
    inbox,
    messages,
    domains,
    selectedDomain,
    setSelectedDomain,
    isLoading,
    error,
    toastMessage,
    isConnected,
    generateNewInbox,
    refreshMessages,
    extendTime,
    deleteInbox,
    setMessages,
  } = useInbox();

  // Dark mode handler
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Load message detail
  const handleSelectMessage = async (msgId: string) => {
    if (!inbox) return;
    setSelectedMessageId(msgId);
    setIsLoadingMessage(true);
    setMessageError(null);
    try {
      const detail = await api.getMessageDetail(inbox.access_token, msgId);
      setSelectedMessageDetail(detail);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_read: true } : m)),
      );
    } catch {
      setMessageError('No se pudo cargar el contenido del mensaje.');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
    setMessageError(null);
  };

  const hasMessages = messages.length > 0;
  const isExpired = inbox && !inbox.is_active && inbox.remaining_seconds <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-paper-100 dark:bg-ink-950 text-ink-900 dark:text-paper-100">
      <Header
        isConnected={isConnected}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Global error banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-brick-50 dark:bg-brick-950/40 border border-brick-200 dark:border-brick-800 text-brick-700 dark:text-brick-300 text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => generateNewInbox()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brick-600 text-white hover:bg-brick-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Hero: email identity */}
        <EmailCard
          inbox={inbox}
          domains={domains}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          onGenerateNew={generateNewInbox}
          onRefresh={refreshMessages}
          onDelete={deleteInbox}
          onOpenQR={() => setIsQRModalOpen(true)}
          onExtendTime={extendTime}
          isLoading={isLoading}
        />

        {/* Expired notice */}
        {isExpired && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Tu correo expiró. Genera uno nuevo para seguir recibiendo mensajes.
            </div>
            <button
              onClick={() => generateNewInbox()}
              className="shrink-0 flex items-center gap-1.5 rounded-lg bg-clay-600 px-4 py-2 text-sm font-semibold text-paper-50 hover:bg-clay-700 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Generar nuevo
            </button>
          </div>
        )}

        {/* Workspace: list + reading pane */}
        {hasMessages ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className={`lg:col-span-5 ${selectedMessageId ? 'hidden lg:block' : 'block'}`}>
              <InboxList
                messages={messages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
              />
            </div>

            <div className={`lg:col-span-7 ${!selectedMessageId ? 'hidden lg:block' : 'block'}`}>
              {selectedMessageId ? (
                <MessageDetail
                  token={inbox?.access_token || ''}
                  message={selectedMessageDetail}
                  isLoading={isLoadingMessage}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="rounded-2xl border border-stone-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-900 p-12 text-center flex flex-col items-center justify-center min-h-[300px] text-stone-400">
                  <Mailbox className="h-8 w-8 mb-3 opacity-60" />
                  <p className="text-sm font-medium text-ink-700 dark:text-stone-300">
                    Selecciona un mensaje para leerlo
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>

      <footer className="w-full border-t border-stone-200 dark:border-ink-800 py-5 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TempMail — correo temporal, simple y privado</span>
          <span className="font-mono text-[11px]">correos.abadgroup.tech</span>
        </div>
      </footer>

      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
