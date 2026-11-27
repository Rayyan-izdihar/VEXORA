import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, totalItems, buildHref }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-ink-600">
      <span className="tabular-nums">
        Halaman <strong className="text-ink-900">{page}</strong> dari{' '}
        <strong className="text-ink-900">{totalPages}</strong> ({totalItems} data)
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="h-9 px-3.5 rounded-full border border-line-200 bg-white text-ink-900 inline-flex items-center gap-1 hover:bg-cream-100 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </Link>
        ) : (
          <span className="h-9 px-3.5 rounded-full border border-line-200 bg-cream-100 text-ink-400 inline-flex items-center gap-1 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="h-9 px-3.5 rounded-full border border-line-200 bg-white text-ink-900 inline-flex items-center gap-1 hover:bg-cream-100 font-medium"
          >
            Berikutnya
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <span className="h-9 px-3.5 rounded-full border border-line-200 bg-cream-100 text-ink-400 inline-flex items-center gap-1 cursor-not-allowed">
            Berikutnya
            <ChevronRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
}
