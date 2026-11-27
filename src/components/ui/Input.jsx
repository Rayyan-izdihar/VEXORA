'use client';

import { AlertCircle } from 'lucide-react';

export function FieldWrapper({ label, htmlFor, helper, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-900">
          {label}
          {required && <span className="text-status-danger-fg ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="inline-flex items-center gap-1.5 text-[13px] text-status-danger-fg font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : helper ? (
        <p className="text-[13px] text-ink-600">{helper}</p>
      ) : null}
    </div>
  );
}

const baseInputClass =
  'w-full h-12 px-3.5 rounded-[12px] bg-white border text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-lime-400 disabled:bg-cream-100 disabled:text-ink-400';

export function Input({ label, id, helper, error, required, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <FieldWrapper label={label} htmlFor={inputId} helper={helper} error={error} required={required}>
      <input
        id={inputId}
        required={required}
        className={`${baseInputClass} ${error ? 'border-status-danger-fg' : 'border-line-200'} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldWrapper>
  );
}

export function Textarea({ label, id, helper, error, required, rows = 3, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <FieldWrapper label={label} htmlFor={inputId} helper={helper} error={error} required={required}>
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full p-3.5 rounded-[12px] bg-white border text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-lime-400 ${error ? 'border-status-danger-fg' : 'border-line-200'} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FieldWrapper>
  );
}

export function Select({ label, id, helper, error, required, children, className = '', ...props }) {
  const inputId = id || props.name;
  return (
    <FieldWrapper label={label} htmlFor={inputId} helper={helper} error={error} required={required}>
      <select
        id={inputId}
        required={required}
        className={`${baseInputClass} ${error ? 'border-status-danger-fg' : 'border-line-200'} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
