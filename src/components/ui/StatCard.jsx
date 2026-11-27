import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/format';

export function StatCard({
  label,
  value,
  subtext,
  tone = 'default', // 'default' | 'lime' | 'dark'
  href,
  actionLabel = 'Tinjau',
}) {
  const toneClasses =
    tone === 'lime'
      ? 'bg-lime-400 text-ink-900 border-transparent'
      : tone === 'dark'
        ? 'bg-ink-900 text-white border-transparent'
        : 'bg-white text-ink-900 border-line-200';

  const labelColor =
    tone === 'dark' ? 'text-[#C9CCBD]' : tone === 'lime' ? 'text-ink-700' : 'text-ink-600';

  return (
    <div className={`rounded-[20px] border p-5 flex flex-col justify-between gap-3 ${toneClasses}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`text-sm font-medium ${labelColor}`}>{label}</span>
        {href && (
          <Link
            href={href}
            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 transition-colors ${
              tone === 'dark'
                ? 'bg-lime-400 text-ink-900 hover:bg-lime-500'
                : tone === 'lime'
                  ? 'bg-ink-900 text-white hover:bg-ink-700'
                  : 'bg-cream-100 text-ink-900 hover:bg-line-200'
            }`}
          >
            {actionLabel}
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div>
        <div className="text-[40px] leading-none font-semibold tracking-tight tabular-nums">
          {formatNumber(value)}
        </div>
        {subtext && <p className={`mt-2 text-xs ${labelColor}`}>{subtext}</p>}
      </div>
    </div>
  );
}
