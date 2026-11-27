import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function ArrowPill({ href, children, className = '', dark = false }) {
  const baseClass = dark
    ? 'bg-ink-900 text-white border-ink-700 hover:bg-ink-700'
    : 'bg-white text-ink-900 border-line-200 hover:bg-cream-100';

  const content = (
    <>
      <span className="font-semibold text-sm">{children}</span>
      <span className="w-7 h-7 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </>
  );

  const classes = `group inline-flex items-center gap-3 h-11 pl-5 pr-2 rounded-full border transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-lime-500 focus-visible:ring-offset-2 ${baseClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
