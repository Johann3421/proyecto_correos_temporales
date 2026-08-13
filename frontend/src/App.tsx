import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { ExpirationTimer } from './components/ExpirationTimer';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { Toast } from './components/Toast';
import { useInbox } from './hooks/useInbox';
import { api, MessageDetail as IMessageDetail } from './services/api';
import { AlertTriangle, RefreshCw, MailWarning } from 'lucide-react';

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Respect OS preference on first load
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

  // Load message detail when selecting
  const handleSelectMessage = async (msgId: string) => {
    if (!inbox) return;
    setSelectedMessageId(msgId);
    setIsLoadingMessage(true);
    setMessageError(null);
    try {
      const detail = await api.getMessageDetail(inbox.access_token, msgId);
      setSelectedMessageDetail(detail);
      // Mark as read in the local list state
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_read: true } : m)),
      );
    } catch {
      setMessageError('No se pudo cargar el mensaje. Intenta de nuevo.');
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
    setMessageError(null);
  };

  const isExpired = inbox && !inbox.is_active && inbox.remaining_seconds <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-obsidian-900 text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-obsidian-950 transition-colors">
      {/* Sticky Top Header */}
      <Header
        isConnected={isConnected}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Global API error state */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => generateNewInbox()}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 transition-colors text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Hero Email Card */}
        <EmailCard
          inbox={inbox}
          domains={domains}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          onGenerateNew={generateNewInbox}
          onRefresh={refreshMessages}
          onDelete={deleteInbox}
          onOpenQR={() => setIsQRModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Expiration Timer */}
        {inbox && inbox.remaining_seconds > 0 && (
          <ExpirationTimer
            remainingSeconds={inbox.remaining_seconds}
            createdAt={inbox.created_at}
            expiresAt={inbox.expires_at}
            onExtendTime={extendTime}
          />
        )}

        {/* Expired Banner */}
        {isExpired && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <div className="flex items-center gap-3">
              <MailWarning className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Tu correo temporal ha expirado</p>
                <p className="text-xs opacity-80">Ya no recibirás nuevos mensajes en esta dirección.</p>
              </div>
            </div>
            <button
              onClick={() => generateNewInbox()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-obsidian-950 font-bold text-sm hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/25 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generar nuevo correo</span>
            </button>
          </div>
        )}

        {/* Inbox / Message Detail View */}
        <div className="w-full">
          {/* Message error */}
          {messageError && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-sm font-medium mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{messageError}</span>
              <button
                onClick={handleBackToList}
                className="ml-auto text-xs font-bold underline underline-offset-2"
              >
                Volver
              </button>
            </div>
          )}

          {selectedMessageId ? (
            <MessageDetail
              token={inbox?.access_token || ''}
              message={selectedMessageDetail}
              isLoading={isLoadingMessage}
              onBack={handleBackToList}
            />
          ) : messages.length === 0 ? (
            <EmptyState />
          ) : (
            <InboxList
              messages={messages}
              selectedMessageId={selectedMessageId}
              onSelectMessage={handleSelectMessage}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-obsidian-800 py-6 text-center text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AirInbox — Correos temporales seguros y desechables.</p>
          <p>Potenciado por FastAPI, React &amp; WebSockets</p>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Micro-interaction Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
