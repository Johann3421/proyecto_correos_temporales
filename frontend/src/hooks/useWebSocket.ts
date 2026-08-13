import { useEffect, useRef, useState, useCallback } from 'react';

interface UseWebSocketOptions {
  token: string | null;
  onMessage?: (data: any) => void;
}

export function useWebSocket({ token, onMessage }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const connect = useCallback(() => {
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev mode proxy ws://localhost:3000/ws -> ws://localhost:8000/ws
    const wsUrl = `${protocol}//${host}/ws/inbox/${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (onMessage) {
          onMessage(payload);
        }
      } catch (e) {
        // ignore non-json
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
      // Try reconnecting after 3 seconds if token still active
      reconnectTimeoutRef.current = setTimeout(() => {
        if (token) connect();
      }, 3000);
    };

    socket.onerror = () => {
      socket.close();
    };
  }, [token, onMessage]);

  useEffect(() => {
    connect();

    // Ping interval to prevent idle disconnects
    const pingInterval = setInterval(() => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send('ping');
      }
    }, 25000);

    return () => {
      clearInterval(pingInterval);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected };
}
