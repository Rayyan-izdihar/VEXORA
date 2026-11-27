'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Drawer({ open, onClose, title, subtitle, children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    panelRef.current?.focus();

    function handleKey(e) {
      if (e.key === 'Escape') onCloseRef.current?.();
    }
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      if (prevActive && typeof prevActive.focus === 'function') {
        prevActive.focus();
      }
    };
}, [open]);

if (!open) return null;

return (
  <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
    <div
      className="fixed inset-0 bg-ink-900/40 backdrop-blur-[1px]"
      onClick={onClose}
      aria-hidden="true"
    />
    <div
      ref={panelRef}
      tabIndex={-1}
      className="relative z-10 w-full max-w-[480px] h-full bg-cream-50 border-l border-line-200 shadow-[var(--shadow-pop)] flex flex-col focus:outline-none"
    >
      <div className="px-6 py-5 bg-white border-b border-line-200 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-ink-900 tracking-tight">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup panel"
          className="w-9 h-9 rounded-full border border-line-200 flex items-center justify-center text-ink-700 hover:bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);
}
