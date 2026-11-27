'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        dismiss(id);
      }, 5000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="no-print fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none"
      >
        {toasts.map((t) => {
          const Icon =
            t.type === 'error'
              ? AlertCircle
              : t.type === 'info'
                ? Info
                : CheckCircle2;
          const iconColor =
            t.type === 'error'
              ? 'text-red-400'
              : t.type === 'info'
                ? 'text-blue-300'
                : 'text-lime-400';

          return (
            <div
              key={t.id}
              role="status"
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink-900 text-white px-4 py-3 text-sm font-medium shadow-[var(--shadow-pop)]"
            >
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} aria-hidden="true" />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Tutup notifikasi"
                className="p-1 rounded-full text-ink-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
