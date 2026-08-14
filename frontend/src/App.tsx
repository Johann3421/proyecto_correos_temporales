import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { LoginView } from './components/LoginView';
import { Toast } from './components/Toast';
import { useInbox } from './hooks/useInbox';
import { api, MessageDetail as IMessageDetail, LoginResponse } from './services/api';
import { AlertCircle, RefreshCw, Mail } from 'lucide-react';

const SESSION_TOKEN_KEY = 'tempmail_session_token';
const SESSION_USER_KEY = 'tempmail_session_user';

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);

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

  // Session verification on mount
  useEffect(() => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const savedUser = localStorage.getItem(SESSION_USER_KEY);
    if (!token) {
      setIsAuthenticated(false);
      setAuthChecking(false);
      return;
    }

    api.verifySession(token)
      .then((res) => {
        if (res.valid) {
          setIsAuthenticated(true);
          setUsername(res.username || savedUser || 'demo');
        } else {
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(SESSION_USER_KEY);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // Fallback: local token exists
        setIsAuthenticated(true);
        setUsername(savedUser || 'demo');
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const handleLoginSuccess = (session: LoginResponse) => {
    localStorage.setItem(SESSION_TOKEN_KEY, session.access_token);
    localStorage.setItem(SESSION_USER_KEY, session.username);
    setUsername(session.username);
    setIsAuthenticated(true);
  };

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem(SESSION_TOKEN_KEY);
    localStorage.removeItem(SESSION_USER_KEY);
    setIsAuthenticated(false);
    setUsername(null);
  }, []);

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

  // If session is verifying on initial load
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="w-4 h-4 border-2 border-cobalt-600 border-t-transparent rounded-full animate-spin" />
          <span>Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <Header
        isConnected={isConnected}
        isDark={isDark}
        username={username}
        onToggleTheme={() => setIsDark((d) => !d)}
        onLogout={isAuthenticated ? handleLogout : undefined}
      />

      {/* Main Content: If not authenticated, show LoginView */}
      {!isAuthenticated ? (
        <main className="flex-1 max-w-md w-full mx-auto px-4 py-8">
          <LoginView onLoginSuccess={handleLoginSuccess} />
        </main>
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
          {/* Global Error Banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => generateNewInbox()}
                className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reintentar</span>
              </button>
            </div>
          )}

          {/* Hero Email Box (Dominant focal point) */}
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

          {/* Split Workspace Layout */}
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Inbox List */}
              <div className={`lg:col-span-5 ${selectedMessageId ? 'hidden lg:block' : 'block'}`}>
                <InboxList
                  messages={messages}
                  selectedMessageId={selectedMessageId}
                  onSelectMessage={handleSelectMessage}
                />
              </div>

              {/* Right Column: Message Detail Pane */}
              <div className={`lg:col-span-7 ${!selectedMessageId ? 'hidden lg:block' : 'block'}`}>
                {selectedMessageId ? (
                  <MessageDetail
                    token={inbox?.access_token || ''}
                    message={selectedMessageDetail}
                    isLoading={isLoadingMessage}
                    onBack={handleBackToList}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px]">
                    <Mail className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Selecciona un mensaje de la lista para leer su contenido
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TempMail — Servicio de correo temporal y desechable</span>
          <span className="font-mono text-[11px]">correos.abadgroup.tech</span>
        </div>
      </footer>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      {/* Toast Feedback */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
