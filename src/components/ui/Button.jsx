'use client';

import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-lime-400 text-ink-900 hover:bg-lime-500 font-semibold',
  dark:
    'bg-ink-900 text-white hover:bg-ink-700 font-semibold',
  secondary:
    'bg-transparent border-[1.5px] border-ink-900 text-ink-900 hover:bg-cream-100 font-semibold',
  ghost:
    'bg-transparent text-ink-700 hover:bg-cream-100 font-medium',
  danger:
    'bg-status-danger-fg text-white hover:opacity-90 font-semibold',
  icon:
    'bg-white border border-line-200 text-ink-700 hover:bg-cream-100',
};

const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-[52px] px-6 text-base',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  const isDisabled = disabled || loading;
  const sizeClass = variant === 'icon' ? SIZES.icon : SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-lime-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-45 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
}
