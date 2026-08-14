import React, { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="w-5 h-5 text-success-DEFAULT" />,
  error: <AlertCircle className="w-5 h-5 text-error-DEFAULT" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning-DEFAULT" />,
  info: <Info className="w-5 h-5 text-info-DEFAULT" />,
};

const bgColors = {
  success: 'bg-success-light dark:bg-success-dark/20 border-success-dark/30',
  error: 'bg-error-light dark:bg-error-dark/20 border-error-dark/30',
  warning: 'bg-warning-light dark:bg-warning-dark/20 border-warning-dark/30',
  info: 'bg-info-light dark:bg-info-dark/20 border-info-dark/30',
};

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none"
      role="region"
      aria-label="Notificaciones"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 200);
      }, toast.duration ?? 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  const type = toast.type ?? 'info';

  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-strong animate-slide-up',
        'min-w-[280px] max-w-md',
        bgColors[type],
        isExiting && 'animate-fade-out'
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
      <p className={clsx(
        'flex-1 text-body-sm leading-relaxed',
        type === 'success' ? 'text-success-dark dark:text-success-light' :
        type === 'error' ? 'text-error-dark dark:text-error-light' :
        type === 'warning' ? 'text-warning-dark dark:text-warning-light' :
        'text-info-dark dark:text-info-light'
      )}>
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 200);
        }}
        className={clsx(
          'flex-shrink-0 p-1 rounded-lg transition-colors',
          type === 'success' ? 'hover:bg-success-dark/10 text-success-dark' :
          type === 'error' ? 'hover:bg-error-dark/10 text-error-dark' :
          type === 'warning' ? 'hover:bg-warning-dark/10 text-warning-dark' :
          'hover:bg-info-dark/10 text-info-dark'
        )}
        aria-label="Cerrar notificación"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = React.useCallback((message: string, type?: Toast['type'], duration?: number) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id;
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = React.useCallback((message: string, duration?: number) => addToast(message, 'success', duration), [addToast]);
  const error = React.useCallback((message: string, duration?: number) => addToast(message, 'error', duration), [addToast]);
  const warning = React.useCallback((message: string, duration?: number) => addToast(message, 'warning', duration), [addToast]);
  const info = React.useCallback((message: string, duration?: number) => addToast(message, 'info', duration), [addToast]);

  return { toasts, addToast, dismiss, success, error, warning, info };
}