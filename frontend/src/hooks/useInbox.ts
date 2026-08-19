import { useState, useEffect, useCallback, useRef } from 'react';
import { api, InboxData, MessageSummary } from '../services/api';
import { useWebSocket } from './useWebSocket';
import { playNotificationSound } from '../utils/formatters';

const STORAGE_KEY = 'airinbox_access_token';

export function useInbox(sessionToken?: string) {
  const [inboxes, setInboxes] = useState<InboxData[]>([]);
  const [activeInbox, setActiveInbox] = useState<InboxData | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const prevSessionRef = useRef<string | undefined>(sessionToken);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Fetch available domains on mount
  useEffect(() => {
    api
      .getDomains()
      .then((list) => {
        const resolved = list.length > 0 ? list : ['correos.abadgroup.tech', 'abadgroup.tech'];
        setDomains(resolved);
        setSelectedDomain(resolved[0]);
      })
      .catch(() => {
        setDomains(['correos.abadgroup.tech', 'abadgroup.tech']);
        setSelectedDomain('correos.abadgroup.tech');
      });
  }, []);

  // Fetch messages for a specific inbox
  const fetchInboxMessages = useCallback(async (token: string) => {
    try {
      const msgs = await api.getMessages(token);
      setMessages(msgs);
    } catch {
      // silent
    }
  }, []);

  // Load user's inboxes
  const loadUserInboxes = useCallback(async (preferredToken?: string) => {
    if (!sessionToken) return;
    try {
      const list = await api.listUserInboxes(sessionToken);
      setInboxes(list);

      if (list.length > 0) {
        const target = list.find((i) => i.access_token === preferredToken) || list[0];
        setActiveInbox(target);
        localStorage.setItem(STORAGE_KEY, target.access_token);
        await fetchInboxMessages(target.access_token);
      }
    } catch {
      // silent
    }
  }, [sessionToken, fetchInboxMessages]);

  // Handle initialization and session changes
  useEffect(() => {
    if (!selectedDomain) return;

    // Detect if user switched accounts
    const isNewSession = prevSessionRef.current !== sessionToken;
    prevSessionRef.current = sessionToken;

    const savedToken = localStorage.getItem(STORAGE_KEY);

    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (sessionToken) {
          const list = await api.listUserInboxes(sessionToken);
          setInboxes(list);
          if (list.length > 0) {
            const target = (!isNewSession && savedToken) 
              ? (list.find((i) => i.access_token === savedToken) || list[0])
              : list[0];
            setActiveInbox(target);
            localStorage.setItem(STORAGE_KEY, target.access_token);
            await fetchInboxMessages(target.access_token);
          } else {
            // Create first inbox for this user session
            const newInbox = await api.createInbox(selectedDomain, undefined, undefined, sessionToken);
            setInboxes([newInbox]);
            setActiveInbox(newInbox);
            localStorage.setItem(STORAGE_KEY, newInbox.access_token);
            setMessages([]);
          }
        } else if (savedToken) {
          try {
            const status = await api.getInboxStatus(savedToken);
            setInboxes([status]);
            setActiveInbox(status);
            await fetchInboxMessages(status.access_token);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
            const newInbox = await api.createInbox(selectedDomain);
            setInboxes([newInbox]);
            setActiveInbox(newInbox);
            localStorage.setItem(STORAGE_KEY, newInbox.access_token);
            setMessages([]);
          }
        } else {
          const newInbox = await api.createInbox(selectedDomain);
          setInboxes([newInbox]);
          setActiveInbox(newInbox);
          localStorage.setItem(STORAGE_KEY, newInbox.access_token);
          setMessages([]);
        }
      } catch {
        try {
          const newInbox = await api.createInbox(selectedDomain, undefined, undefined, sessionToken);
          setInboxes([newInbox]);
          setActiveInbox(newInbox);
          localStorage.setItem(STORAGE_KEY, newInbox.access_token);
          setMessages([]);
        } catch {
          setError('Error al conectar con la bandeja de entrada');
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [selectedDomain, sessionToken, fetchInboxMessages]);

  // Create new / additional inbox
  const createNewInbox = useCallback(
    async (domainOverride?: string, customPrefix?: string, label?: string, useSubdomain?: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const domainToUse = domainOverride || selectedDomain || 'correos.abadgroup.tech';
        const data = await api.createInbox(domainToUse, customPrefix, label, sessionToken, useSubdomain);
        setInboxes((prev) => [data, ...prev.filter((i) => i.id !== data.id)]);
        setActiveInbox(data);
        setMessages([]);
        localStorage.setItem(STORAGE_KEY, data.access_token);
        triggerToast('Buzón listo para usar');
      } catch {
        setError('No se pudo generar la nueva bandeja');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDomain, sessionToken, triggerToast],
  );

  // Select another active inbox
  const selectInbox = useCallback(async (inboxToSelect: InboxData) => {
    setActiveInbox(inboxToSelect);
    localStorage.setItem(STORAGE_KEY, inboxToSelect.access_token);
    setIsLoading(true);
    try {
      await fetchInboxMessages(inboxToSelect.access_token);
    } finally {
      setIsLoading(false);
    }
  }, [fetchInboxMessages]);

  // Rename inbox
  const renameInbox = useCallback(async (token: string, newLabel: string) => {
    try {
      const updated = await api.renameInbox(token, newLabel);
      setInboxes((prev) => prev.map((i) => (i.access_token === token ? { ...i, label: updated.label } : i)));
      setActiveInbox((prev) => (prev?.access_token === token ? { ...prev, label: updated.label } : prev));
      triggerToast('Buzón renombrado');
    } catch {
      triggerToast('No se pudo renombrar');
    }
  }, [triggerToast]);

  // Update inbox in state (e.g. from forwarding modal)
  const updateInboxState = useCallback((updated: InboxData) => {
    setInboxes((prev) => prev.map((i) => (i.access_token === updated.access_token ? updated : i)));
    setActiveInbox((prev) => (prev?.access_token === updated.access_token ? updated : prev));
  }, []);

  // Delete inbox
  const deleteInbox = useCallback(
    async (tokenToDelete?: string) => {
      const token = tokenToDelete || activeInbox?.access_token;
      if (!token) return;
      setIsLoading(true);
      try {
        await api.deleteInbox(token);
        const remaining = inboxes.filter((i) => i.access_token !== token);
        setInboxes(remaining);

        if (remaining.length > 0) {
          const next = remaining[0];
          setActiveInbox(next);
          localStorage.setItem(STORAGE_KEY, next.access_token);
          await fetchInboxMessages(next.access_token);
        } else {
          const replacement = await api.createInbox(selectedDomain, undefined, undefined, sessionToken);
          setInboxes([replacement]);
          setActiveInbox(replacement);
          localStorage.setItem(STORAGE_KEY, replacement.access_token);
          setMessages([]);
        }
        triggerToast('Buzón eliminado');
      } catch {
        triggerToast('Error al eliminar buzón');
      } finally {
        setIsLoading(false);
      }
    },
    [activeInbox, inboxes, selectedDomain, sessionToken, fetchInboxMessages, triggerToast],
  );

  // Live WebSocket message handler
  const handleWsMessage = useCallback(
    (payload: any) => {
      if (payload.type === 'NEW_MESSAGE' && payload.message) {
        const newMsg: MessageSummary = payload.message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [newMsg, ...prev];
        });
        playNotificationSound();

        const ruleTag = payload.message.matched_rules?.length
          ? ` (Regla: ${payload.message.matched_rules.join(', ')})`
          : '';
        triggerToast(`Tienes correo nuevo${ruleTag}`);

        if (activeInbox) {
          setInboxes((prev) =>
            prev.map((i) =>
              i.id === activeInbox.id ? { ...i, total_messages: (i.total_messages || 0) + 1 } : i,
            ),
          );
        }
      }
    },
    [activeInbox, triggerToast],
  );

  const { isConnected } = useWebSocket({
    token: activeInbox ? activeInbox.access_token : null,
    onMessage: handleWsMessage,
  });

  // Real-time automatic background polling (every 4 seconds) + focus sync
  useEffect(() => {
    if (!activeInbox || !activeInbox.access_token || !activeInbox.is_active) return;

    const token = activeInbox.access_token;

    const autoSync = async () => {
      try {
        const msgs = await api.getMessages(token);
        setMessages((prev) => {
          const currentIds = new Set(prev.map((m) => m.id));
          const hasNew = msgs.some((m) => !currentIds.has(m.id));
          if (hasNew) {
            playNotificationSound();
            triggerToast('Tienes correo nuevo');
            return msgs;
          }
          return prev.length !== msgs.length ? msgs : prev;
        });
      } catch {
        // silent
      }
    };

    // Poll every 4 seconds for instant delivery guarantee
    const pollInterval = setInterval(autoSync, 4000);

    const handleFocusSync = () => {
      autoSync();
    };

    window.addEventListener('focus', handleFocusSync);
    window.addEventListener('visibilitychange', handleFocusSync);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocusSync);
      window.removeEventListener('visibilitychange', handleFocusSync);
    };
  }, [activeInbox?.access_token, activeInbox?.is_active, triggerToast]);

  const refreshMessages = useCallback(async () => {
    if (!activeInbox) return;
    try {
      await fetchInboxMessages(activeInbox.access_token);
      triggerToast('Bandeja sincronizada');
    } catch {
      // silent
    }
  }, [activeInbox, fetchInboxMessages, triggerToast]);

  return {
    inboxes,
    inbox: activeInbox,
    activeInbox,
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
  };
}
