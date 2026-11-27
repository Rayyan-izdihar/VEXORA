import Link from 'next/link';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) {
  return (
    <div className="rounded-[20px] bg-white border border-line-200 px-6 py-12 text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-lime-400 text-ink-900 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
      {description && <p className="mt-1.5 text-sm text-ink-600 max-w-md">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-5">
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <div className="mt-5">
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
