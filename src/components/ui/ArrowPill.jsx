import Link from 'next/link';

export function ArrowPill({ href, children, className = '', dark = false }) {
  const baseClass = dark
    ? 'bg-ink-900 text-white border-ink-700 hover:bg-ink-700'
    : 'bg-white text-ink-900 border-line-200 hover:bg-cream-100';

  const content = <span className="font-semibold text-sm">{children}</span>;

  const classes = `group inline-flex items-center justify-center h-11 px-5 rounded-full border transition-colors focus:outline-none focus-visible:ring-[3px] focus-visible:ring-lime-500 focus-visible:ring-offset-2 ${baseClass} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return <span className={classes}>{content}</span>;
}
