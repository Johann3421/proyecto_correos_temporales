import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { ExpirationTimer } from './components/ExpirationTimer';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { DynamicIsland } from './components/DynamicIsland';
import { Toast } from './components/Toast';
import { useInbox } from './hooks/useInbox';
import { api, MessageDetail as IMessageDetail } from './services/api';
import { AlertTriangle, RefreshCw, MailWarning } from 'lucide-react';

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

  const isExpired = inbox && !inbox.is_active && inbox.remaining_seconds <= 0;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 pb-28">
      {/* Top Glass Navigation Bar */}
      <Header
        isConnected={isConnected}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-apple-red/10 border border-apple-red/30 text-apple-red text-xs sm:text-sm font-semibold animate-shake">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => generateNewInbox()}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-apple-red text-white hover:opacity-90 transition-opacity text-xs font-bold shadow-sm"
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

        {/* Expired Notification Banner */}
        {isExpired && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl glass-card border-apple-amber/30 text-apple-amber">
            <div className="flex items-center gap-3">
              <MailWarning className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">Esta bandeja temporal ha expirado</p>
                <p className="text-xs opacity-85">Los nuevos correos ya no se recibirán en esta dirección.</p>
              </div>
            </div>
            <button
              onClick={() => generateNewInbox()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-apple-amber text-white font-bold text-xs sm:text-sm hover:opacity-90 transition-opacity shadow-md shadow-apple-amber/30 shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Generar nueva bandeja</span>
            </button>
          </div>
        )}

        {/* Message Area: Split / List / Reader View */}
        <div className="w-full">
          {messageError && (
            <div className="flex items-center gap-3 p-4 rounded-3xl bg-apple-red/10 border border-apple-red/30 text-apple-red text-xs sm:text-sm font-semibold mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{messageError}</span>
              <button
                onClick={handleBackToList}
                className="ml-auto text-xs font-bold underline underline-offset-2"
              >
                Volver a la lista
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

      {/* Dynamic Island Floating Quick Bar */}
      {inbox && (
        <DynamicIsland
          emailAddress={inbox.email_address}
          remainingSeconds={inbox.remaining_seconds}
          onGenerateNew={() => generateNewInbox()}
          onOpenQR={() => setIsQRModalOpen(true)}
          isLoading={isLoading}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-black/[0.05] dark:border-white/[0.08] py-6 text-center text-xs text-studio-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AirInbox — Correos temporales privados y desechables.</p>
          <p>Diseño Apple Studio &amp; Glassmorphism</p>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Top Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;