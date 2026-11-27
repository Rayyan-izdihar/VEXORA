'use client';

import { useEffect, useRef } from 'react';
import { Button } from './Button';

export function Modal({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  confirmVariant = 'danger',
  onConfirm,
  loading = false,
  children,
}) {
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const loadingRef = useRef(loading);

  useEffect(() => {
    onCloseRef.current = onClose;
    loadingRef.current = loading;
  });

  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement;
    dialogRef.current?.focus();

    function handleKey(e) {
      if (e.key === 'Escape' && !loadingRef.current) onCloseRef.current?.();
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
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div
      className="fixed inset-0 bg-ink-900/45"
      onClick={() => !loading && onClose()}
      aria-hidden="true"
    />
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="relative z-10 w-full max-w-md rounded-[28px] bg-white p-7 shadow-[var(--shadow-pop)] focus:outline-none"
    >
      <h3 className="text-xl font-semibold text-ink-900 tracking-tight">{title}</h3>
      {description && <p className="mt-2 text-sm text-ink-600 leading-relaxed">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        {onConfirm && (
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        )}
      </div>
    </div>
  </div>
);
}
