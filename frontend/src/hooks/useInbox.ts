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

  // Track whether initial domain fetch is done to avoid race on first inbox creation
  const domainsReadyRef = useRef(false);
  const initStartedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Create new inbox — accepts a domain override to avoid stale closure
  const generateNewInbox = useCallback(
    async (domainOverride?: string, customPrefix?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const domainToUse =
          domainOverride || selectedDomain || 'tempmail.local';
        const data = await api.createInbox(domainToUse, customPrefix);
        setInbox(data);
        setMessages([]);
        localStorage.setItem(STORAGE_KEY, data.access_token);
        triggerToast('¡Nuevo correo generado!');
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
  const handleWsMessage = useCallback(
    (payload: any) => {
      if (payload.type === 'NEW_MESSAGE' && payload.message) {
        const newMsg: MessageSummary = payload.message;
        setMessages((prev) => [newMsg, ...prev.filter((m) => m.id !== newMsg.id)]);
        playNotificationSound();
        triggerToast('📬 ¡Tienes un mensaje nuevo!');
      }
    },
    [triggerToast],
  );

  const { isConnected } = useWebSocket({
    token: inbox ? inbox.access_token : null,
    onMessage: handleWsMessage,
  });

  // Countdown timer — resets when inbox changes
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!inbox || inbox.remaining_seconds <= 0) return;

    timerRef.current = setInterval(() => {
      setInbox((prev) => {
        if (!prev) return null;
        const newSecs = prev.remaining_seconds - 1;
        if (newSecs <= 0) {
          triggerToast('⚠️ Tu correo ha expirado');
          return { ...prev, remaining_seconds: 0, is_active: false };
        }
        return { ...prev, remaining_seconds: newSecs };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inbox?.access_token, inbox?.expires_at, triggerToast]);

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

  const extendTime = useCallback(
    async (minutes: number = 10) => {
      if (!inbox) return;
      try {
        const updated = await api.extendInbox(inbox.access_token, minutes);
        setInbox(updated);
        triggerToast(
          `Tiempo extendido (+${minutes >= 60 ? `${minutes / 60}h` : `${minutes} min`})`,
        );
      } catch {
        triggerToast('No se pudo extender el tiempo');
      }
    },
    [inbox, triggerToast],
  );

  const deleteInbox = useCallback(async () => {
    if (!inbox) return;
    try {
      await api.deleteInbox(inbox.access_token);
      localStorage.removeItem(STORAGE_KEY);
      initStartedRef.current = false; // allow re-init
      await generateNewInbox(selectedDomain);
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
    extendTime,
    deleteInbox,
    setMessages,
  };
}
