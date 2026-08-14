import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { ExpirationTimer } from './components/ExpirationTimer';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { ToastContainer, useToast } from './components/ui/Toast';
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
    isConnected,
    generateNewInbox,
    refreshMessages,
    extendTime,
    deleteInbox,
    setMessages,
  } = useInbox();

  const { toasts, dismiss, success, error: showError, warning, info } = useToast();

  // Dark mode handler
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handle global error
  useEffect(() => {
    if (error) {
      showError(error, 5000);
    }
  }, [error, showError]);

  // Handle custom events from useInbox hook
  useEffect(() => {
    const handleNewMessage = (e: CustomEvent) => {
      info('���� ¡Nuevo mensaje recibido!', 4000);
    };

    const handleInboxExpired = () => {
      warning('������ Tu correo ha expirado', 5000);
    };

    window.addEventListener('new-message', handleNewMessage as EventListener);
    window.addEventListener('inbox-expired', handleInboxExpired as EventListener);

    return () => {
      window.removeEventListener('new-message', handleNewMessage as EventListener);
      window.removeEventListener('inbox-expired', handleInboxExpired as EventListener);
    };
  }, [info, warning]);

  // Load message detail when selecting
  const handleSelectMessage = useCallback(async (msgId: string) => {
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
      setMessageError('No se pudo cargar el mensaje. Intenta de nuevo.');
    } finally {
      setIsLoadingMessage(false);
    }
  }, [inbox, setMessages]);

  const handleBackToList = useCallback(() => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
    setMessageError(null);
  }, []);

  // Wrapped handlers with toast feedback
  const handleGenerateNew = useCallback(async (domain?: string) => {
    await generateNewInbox(domain);
    success('��� Nuevo correo generado');
  }, [generateNewInbox, success]);

  const handleRefresh = useCallback(async () => {
    await refreshMessages();
    info('Bandeja actualizada');
  }, [refreshMessages, info]);

  const handleExtend = useCallback(async (minutes: number) => {
    try {
      await extendTime(minutes);
      success(`Tiempo extendido (+${minutes >= 60 ? `${minutes / 60}h` : `${minutes} min`})`);
    } catch {
      showError('No se pudo extender el tiempo');
    }
  }, [extendTime, success, showError]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteInbox();
      success('Bandeja eliminada, generando nueva...');
    } catch {
      showError('Error al eliminar bandeja');
    }
  }, [deleteInbox, success, showError]);

  const isExpired = inbox && !inbox.is_active && inbox.remaining_seconds <= 0;

  return (
    <div className="min-h-screen flex flex-col bg-clay-50 dark:bg-ink-950 text-charcoal-900 dark:text-charcoal-100 transition-colors duration-normal ease-out-expo">
      <Header
        isConnected={isConnected}
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Email Card */}
        <EmailCard
          inbox={inbox}
          domains={domains}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          onGenerateNew={handleGenerateNew}
          onRefresh={handleRefresh}
          onDelete={handleDelete}
          onOpenQR={() => setIsQRModalOpen(true)}
          isLoading={isLoading}
        />

        {/* Expiration Timer */}
        {inbox && inbox.remaining_seconds > 0 && (
          <ExpirationTimer
            remainingSeconds={inbox.remaining_seconds}
            createdAt={inbox.created_at}
            expiresAt={inbox.expires_at}
            onExtendTime={handleExtend}
          />
        )}

        {/* Expired Banner */}
        {isExpired && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-warning-light dark:bg-warning-dark/20 border border-warning-dark/30 text-warning-dark dark:text-warning-light animate-slide-up">
            <div className="flex items-center gap-3">
              <MailWarning className="w-6 h-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold text-body-sm">Tu correo temporal ha expirado</p>
                <p className="text-caption opacity-80">Ya no recibirás nuevos mensajes en esta dirección.</p>
              </div>
            </div>
            <button
              onClick={() => handleGenerateNew()}
              className="btn-warning btn-sm shrink-0 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              <span>Generar nuevo correo</span>
            </button>
          </div>
        )}

        {/* Inbox / Message Detail View */}
        <div className="w-full">
          {/* Message error */}
          {messageError && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-error-light dark:bg-error-dark/20 border border-error-dark/30 text-error-dark dark:text-error-light text-body-sm font-medium mb-4 animate-slide-down">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="flex-1">{messageError}</span>
              <button
                onClick={handleBackToList}
                className="shrink-0 text-caption font-medium underline underline-offset-2 hover:no-underline"
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
      <footer className="w-full border-t border-charcoal-200 dark:border-ink-800 py-6 text-center text-caption text-charcoal-500 dark:text-charcoal-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TempMail — Correos temporales simples y privados.</p>
          <p>FastAPI + React + WebSockets</p>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

export default App;