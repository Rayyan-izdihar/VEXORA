export function Card({ variant = 'data', className = '', children, ...props }) {
  const styles = {
    dark: 'bg-ink-900 text-white rounded-[28px] p-7',
    lime: 'bg-lime-400 text-ink-900 rounded-[28px] p-7',
    cream: 'bg-cream-100 text-ink-900 rounded-[28px] p-7',
    data: 'bg-white text-ink-900 border border-line-200 rounded-[20px] p-6',
  };

  return (
    <div className={`${styles[variant] || styles.data} ${className}`} {...props}>
      {children}
    </div>
  );
}
