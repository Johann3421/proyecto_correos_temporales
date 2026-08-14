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
  const [isDark, setIsDark] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<IMessageDetail | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

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

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Session verification on mount
  useEffect(() => {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    const savedUser = localStorage.getItem(SESSION_USER_KEY);
    if (!token) {
      setAuthChecking(false);
      return;
    }

    api
      .verifySession(token)
      .then((res) => {
        if (res.valid) {
          setIsAuthenticated(true);
          setUsername(res.username || savedUser || 'user');
        } else {
          localStorage.removeItem(SESSION_TOKEN_KEY);
          localStorage.removeItem(SESSION_USER_KEY);
        }
      })
      .catch(() => {
        setIsAuthenticated(true);
        setUsername(savedUser || 'user');
      })
      .finally(() => setAuthChecking(false));
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
      try { await api.logout(token); } catch { /* ignore */ }
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
    try {
      const detail = await api.getMessageDetail(inbox.access_token, msgId);
      setSelectedMessageDetail(detail);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_read: true } : m)),
      );
    } catch { /* ignore */ }
    finally { setIsLoadingMessage(false); }
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
  };

  // Auth checking spinner
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex items-center gap-2 text-xs text-surface-500">
          <div className="w-3.5 h-3.5 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
          Verificando sesión…
        </div>
      </div>
    );
  }

  // Login screen — full page, no header
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100">
      <Header
        isConnected={isConnected}
        isDark={isDark}
        username={username}
        onToggleTheme={() => setIsDark((d) => !d)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 text-fail-light dark:text-fail-dark text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => generateNewInbox()}
              className="flex items-center gap-1 px-2 py-1 rounded bg-fail-DEFAULT text-white hover:bg-fail-light text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          </div>
        )}

        {/* Email Card */}
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

        {/* Workspace */}
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Inbox list */}
            <div className={`lg:col-span-5 ${selectedMessageId ? 'hidden lg:block' : ''}`}>
              <InboxList
                messages={messages}
                selectedMessageId={selectedMessageId}
                onSelectMessage={handleSelectMessage}
              />
            </div>

            {/* Message reader */}
            <div className={`lg:col-span-7 ${!selectedMessageId ? 'hidden lg:block' : ''}`}>
              {selectedMessageId ? (
                <MessageDetail
                  token={inbox?.access_token || ''}
                  message={selectedMessageDetail}
                  isLoading={isLoadingMessage}
                  onBack={handleBackToList}
                />
              ) : (
                <div className="border border-surface-200 dark:border-surface-800 rounded-md p-8 text-center bg-surface-0 dark:bg-surface-900 min-h-[260px] flex flex-col items-center justify-center">
                  <Mail className="w-6 h-6 text-surface-300 dark:text-surface-600 mb-2" />
                  <p className="text-xs text-surface-500">
                    Selecciona un mensaje de la lista
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-3">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-2xs text-surface-400 font-mono">
          <span>tempmail — correo temporal</span>
          <span>correos.abadgroup.tech</span>
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
