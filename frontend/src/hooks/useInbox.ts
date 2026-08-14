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

  const domainsReadyRef = useRef(false);
  const initStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

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
      } catch {
        setError('Error al generar la bandeja de entrada');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDomain],
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
      // Toast will be handled by App component via custom event
      window.dispatchEvent(new CustomEvent('new-message', { detail: newMsg }));
    }
  }, []);

  const { isConnected } = useWebSocket({
    token: inbox ? inbox.access_token : null,
    onMessage: handleWsMessage,
  });

  // Countdown timer
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!inbox || inbox.remaining_seconds <= 0) return;

    timerRef.current = setInterval(() => {
      setInbox((prev) => {
        if (!prev) return null;
        const newSecs = prev.remaining_seconds - 1;
        if (newSecs <= 0) {
          window.dispatchEvent(new CustomEvent('inbox-expired'));
          return { ...prev, remaining_seconds: 0, is_active: false };
        }
        return { ...prev, remaining_seconds: newSecs };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inbox?.access_token, inbox?.expires_at]);

  const refreshMessages = useCallback(async () => {
    if (!inbox) return;
    try {
      const msgs = await api.getMessages(inbox.access_token);
      setMessages(msgs);
    } catch {
      // ignore
    }
  }, [inbox]);

  const extendTime = useCallback(
    async (minutes: number = 10) => {
      if (!inbox) return;
      try {
        const updated = await api.extendInbox(inbox.access_token, minutes);
        setInbox(updated);
      } catch {
        // Error will be handled by caller
        throw new Error('No se pudo extender el tiempo');
      }
    },
    [inbox],
  );

  const deleteInbox = useCallback(async () => {
    if (!inbox) return;
    try {
      await api.deleteInbox(inbox.access_token);
      localStorage.removeItem(STORAGE_KEY);
      initStartedRef.current = false;
      await generateNewInbox(selectedDomain);
    } catch {
      throw new Error('Error al eliminar bandeja');
    }
  }, [inbox, selectedDomain, generateNewInbox]);

  return {
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
  };
}