import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { EmailCard } from './components/EmailCard';
import { EmptyState } from './components/EmptyState';
import { InboxList } from './components/InboxList';
import { MessageDetail } from './components/MessageDetail';
import { QRCodeModal } from './components/QRCodeModal';
import { LoginView } from './components/LoginView';
import { SavedMessages } from './components/SavedMessages';
import { StatsView } from './components/StatsView';
import { InboxSelector } from './components/InboxSelector';
import { ForwardSettingsModal } from './components/ForwardSettingsModal';
import { RulesModal } from './components/RulesModal';
import { SupportModal } from './components/SupportModal';
import { OnboardingModal } from './components/OnboardingModal';
import { Toast } from './components/Toast';
import { useInbox } from './hooks/useInbox';
import { api, MessageDetail as IMessageDetail, LoginResponse, SavedMessage } from './services/api';
import { AlertCircle, RefreshCw, Mail, Inbox as InboxIcon, Bookmark, BarChart3 } from 'lucide-react';

const SESSION_TOKEN_KEY = 'tempmail_session_token';
const SESSION_USER_KEY = 'tempmail_session_user';
const ONBOARDED_KEY = 'airinbox_onboarded_v1';

type ActiveTab = 'inbox' | 'saved' | 'stats';

export function App() {
  const [isDark, setIsDark] = useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [username, setUsername] = useState<string | null>(null);

  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<IMessageDetail | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  // Modals
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Saved messages
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  const sessionToken = typeof window !== 'undefined' ? localStorage.getItem(SESSION_TOKEN_KEY) || '' : '';

  const {
    inboxes,
    inbox,
    messages,
    domains,
    selectedDomain,
    setSelectedDomain,
    isLoading,
    error,
    toastMessage,
    isConnected,
    createNewInbox,
    selectInbox,
    renameInbox,
    updateInboxState,
    refreshMessages,
    deleteInbox,
    setMessages,
  } = useInbox(sessionToken);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Session verification
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

  // First time onboarding check
  useEffect(() => {
    if (isAuthenticated) {
      const hasOnboarded = localStorage.getItem(ONBOARDED_KEY);
      if (!hasOnboarded) {
        setIsOnboardingModalOpen(true);
      }
    }
  }, [isAuthenticated]);

  const handleCloseOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setIsOnboardingModalOpen(false);
  };

  // Fetch saved messages when tab changes
  useEffect(() => {
    if (activeTab === 'saved' && sessionToken) {
      setIsLoadingSaved(true);
      api
        .getSavedMessages(sessionToken)
        .then(setSavedMessages)
        .catch(() => setSavedMessages([]))
        .finally(() => setIsLoadingSaved(false));
    }
  }, [activeTab, sessionToken]);

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
    } catch {
      // ignore
    } finally {
      setIsLoadingMessage(false);
    }
  };

  const handleBackToList = () => {
    setSelectedMessageId(null);
    setSelectedMessageDetail(null);
  };

  const handleSendTest = async () => {
    if (!inbox) return;
    try {
      await api.sendTestEmail(inbox.access_token);
    } catch {
      // ignore
    }
  };

  const handleSaveToggled = (messageId: string, saved: boolean) => {
    if (selectedMessageDetail && String(selectedMessageDetail.id) === messageId) {
      setSelectedMessageDetail({ ...selectedMessageDetail, is_saved: saved });
    }
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, is_saved: saved } : m)),
    );
  };

  const handleToggleSaveFromList = async (msgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inbox) return;
    try {
      const result = await api.toggleSaveMessage(inbox.access_token, msgId, sessionToken);
      handleSaveToggled(msgId, result.saved);
    } catch {
      // ignore
    }
  };

  // Auth checking loading view
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
        <div className="flex items-center gap-2 text-xs text-surface-500 font-mono">
          <div className="w-3.5 h-3.5 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
          Iniciando AirInbox…
        </div>
      </div>
    );
  }

  // Login view
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
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6 space-y-4">
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-fail-DEFAULT/10 border border-fail-DEFAULT/20 text-fail-light dark:text-fail-dark text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => createNewInbox()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-fail-DEFAULT text-white hover:bg-fail-light text-xs font-medium"
            >
              <RefreshCw className="w-3 h-3" />
              Reintentar
            </button>
          </div>
        )}

        {/* Multi-inbox selector */}
        {inboxes.length > 0 && (
          <InboxSelector
            inboxes={inboxes}
            activeInbox={inbox}
            onSelectInbox={selectInbox}
            onNewInbox={() => createNewInbox()}
            onRenameInbox={renameInbox}
            onDeleteInbox={deleteInbox}
            isLoading={isLoading}
          />
        )}

        {/* Active email card */}
        <EmailCard
          inbox={inbox}
          domains={domains}
          selectedDomain={selectedDomain}
          onSelectDomain={setSelectedDomain}
          onGenerateNew={createNewInbox}
          onRefresh={refreshMessages}
          onDelete={() => deleteInbox()}
          onOpenQR={() => setIsQRModalOpen(true)}
          onOpenForward={() => setIsForwardModalOpen(true)}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onSendTest={handleSendTest}
          isLoading={isLoading}
        />

        {/* Main navigation tabs */}
        <div className="flex items-center gap-1 border-b border-surface-200 dark:border-surface-800">
          <button
            onClick={() => { setActiveTab('inbox'); handleBackToList(); }}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'inbox'
                ? 'border-accent-600 text-accent-700 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <InboxIcon className="h-4 w-4" />
            <span>Bandeja</span>
            {messages.length > 0 && (
              <span className="font-mono text-2xs bg-surface-100 dark:bg-surface-800 px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-accent-600 text-accent-700 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>Guardados</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-accent-600 text-accent-700 dark:text-accent-400'
                : 'border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-surface-100'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Estadísticas</span>
          </button>
        </div>

        {/* Tab content view */}
        {activeTab === 'inbox' && (
          <>
            {messages.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className={`lg:col-span-5 ${selectedMessageId ? 'hidden lg:block' : ''}`}>
                  <InboxList
                    messages={messages}
                    selectedMessageId={selectedMessageId}
                    onSelectMessage={handleSelectMessage}
                    onToggleSave={handleToggleSaveFromList}
                  />
                </div>
                <div className={`lg:col-span-7 ${!selectedMessageId ? 'hidden lg:block' : ''}`}>
                  {selectedMessageId ? (
                    <MessageDetail
                      token={inbox?.access_token || ''}
                      sessionToken={sessionToken}
                      message={selectedMessageDetail}
                      isLoading={isLoadingMessage}
                      onBack={handleBackToList}
                      onSaveToggled={handleSaveToggled}
                    />
                  ) : (
                    <div className="border border-surface-200 dark:border-surface-800 rounded-xl p-8 text-center bg-surface-0 dark:bg-surface-900 min-h-[280px] flex flex-col items-center justify-center">
                      <Mail className="w-8 h-8 text-surface-300 dark:text-surface-600 mb-2" />
                      <p className="text-xs text-surface-500">
                        Selecciona un mensaje de la lista para leer su contenido completo
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'saved' && (
          <SavedMessages messages={savedMessages} isLoading={isLoadingSaved} />
        )}

        {activeTab === 'stats' && (
          <StatsView sessionToken={sessionToken} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-4 mt-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-2xs text-surface-400 font-mono gap-2">
          <span>AirInbox — Correo temporal y filtros de privacidad</span>
          <span>correos.abadgroup.tech</span>
        </div>
      </footer>

      {/* Modals */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        emailAddress={inbox?.email_address || ''}
        onClose={() => setIsQRModalOpen(false)}
      />

      <ForwardSettingsModal
        isOpen={isForwardModalOpen}
        inbox={inbox}
        onClose={() => setIsForwardModalOpen(false)}
        onUpdated={updateInboxState}
      />

      <RulesModal
        isOpen={isRulesModalOpen}
        inbox={inbox}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        sessionToken={sessionToken}
        onClose={() => setIsSupportModalOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={handleCloseOnboarding}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
