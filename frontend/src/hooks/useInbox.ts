import { useState, useEffect, useCallback, useRef } from 'react';
import { api, InboxData, MessageSummary } from '../services/api';
import { useWebSocket } from './useWebSocket';
import { playNotificationSound } from '../utils/formatters';

const STORAGE_KEY = 'airinbox_access_token';

export function useInbox() {
  const [inbox, setInbox] = useState<InboxData | null>(null);
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const domainsReadyRef = useRef(false);
  const initStartedRef = useRef(false);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Create new inbox
  const generateNewInbox = useCallback(
    async (domainOverride?: string, customPrefix?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const domainToUse = domainOverride || selectedDomain || 'tempmail.local';
        const data = await api.createInbox(domainToUse, customPrefix);
        setInbox(data);
        setMessages([]);
        localStorage.setItem(STORAGE_KEY, data.access_token);
        triggerToast('Nuevo correo generado');
      } catch {
        setError('Error al generar la bandeja de entrada');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDomain, triggerToast],
  );

  // Step 1: Fetch available domains
  useEffect(() => {
    api
      .getDomains()
      .then((list) => {
        const resolved = list.length > 0 ? list : ['tempmail.local'];
        setDomains(resolved);
        setSelectedDomain(resolved[0]);
        domainsReadyRef.current = true;
      })
      .catch(() => {
        setDomains(['tempmail.local']);
        setSelectedDomain('tempmail.local');
        domainsReadyRef.current = true;
      });
  }, []);

  // Step 2: Initialize inbox once domains are ready AND selectedDomain is set
  useEffect(() => {
    if (!selectedDomain || initStartedRef.current) return;
    initStartedRef.current = true;

    const savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      setIsLoading(true);
      api
        .getInboxStatus(savedToken)
        .then((data) => {
          setInbox(data);
          return api.getMessages(savedToken);
        })
        .then((msgs) => {
          setMessages(msgs);
        })
        .catch(() => {
          localStorage.removeItem(STORAGE_KEY);
          generateNewInbox(selectedDomain);
        })
        .finally(() => setIsLoading(false));
    } else {
      generateNewInbox(selectedDomain);
    }
  }, [selectedDomain, generateNewInbox]);

  // Handle live WebSocket events
  const handleWsMessage = useCallback((payload: any) => {
    if (payload.type === 'NEW_MESSAGE' && payload.message) {
      const newMsg: MessageSummary = payload.message;
      setMessages((prev) => [newMsg, ...prev.filter((m) => m.id !== newMsg.id)]);
      playNotificationSound();
      triggerToast('Has recibido un mensaje nuevo');
    }
  }, [triggerToast]);

  const { isConnected } = useWebSocket({
    token: inbox ? inbox.access_token : null,
    onMessage: handleWsMessage,
  });

  // Fallback background polling & tab-focus sync
  useEffect(() => {
    if (!inbox || !inbox.access_token || !inbox.is_active) return;

    const token = inbox.access_token;

    const silentSync = async () => {
      try {
        const msgs = await api.getMessages(token);
        setMessages((prev) => {
          const currentIds = new Set(prev.map((m) => m.id));
          const hasNew = msgs.some((m) => !currentIds.has(m.id));
          if (hasNew) {
            playNotificationSound();
            triggerToast('Has recibido un mensaje nuevo');
            return msgs;
          }
          return prev.length !== msgs.length ? msgs : prev;
        });
      } catch {
        // silent fail on network blip
      }
    };

    // Poll every 10 seconds as a fallback to WebSocket
    const pollInterval = setInterval(silentSync, 10000);

    // Sync immediately when user refocuses or switches back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        silentSync();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [inbox?.access_token, inbox?.is_active, triggerToast]);

  const refreshMessages = useCallback(async () => {
    if (!inbox) return;
    try {
      const msgs = await api.getMessages(inbox.access_token);
      setMessages(msgs);
      triggerToast('Bandeja actualizada');
    } catch {
      // ignore
    }
  }, [inbox, triggerToast]);

  const deleteInbox = useCallback(async () => {
    if (!inbox) return;
    try {
      await api.deleteInbox(inbox.access_token);
      localStorage.removeItem(STORAGE_KEY);
      initStartedRef.current = false;
      await generateNewInbox(selectedDomain);
      triggerToast('Bandeja eliminada');
    } catch {
      triggerToast('Error al eliminar bandeja');
    }
  }, [inbox, selectedDomain, generateNewInbox, triggerToast]);

  return {
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
    deleteInbox,
    setMessages,
  };
}
