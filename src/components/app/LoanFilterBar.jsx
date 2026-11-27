'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

function buildLoanListUrl(tab, nextQ) {
  const params = new URLSearchParams();
  if (tab && tab !== 'all') params.set('tab', tab);
  if (nextQ?.trim()) params.set('q', nextQ.trim());
  const qs = params.toString();
  return qs ? `/peminjaman?${qs}` : '/peminjaman';
}

export function LoanFilterBar({ initialQ = '', tab = 'all' }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [prevInitialQ, setPrevInitialQ] = useState(initialQ);

  if (prevInitialQ !== initialQ) {
    setPrevInitialQ(initialQ);
    if (initialQ === '' || q.trim() === prevInitialQ) {
      setQ(initialQ);
    }
  }

  useEffect(() => {
    if (q.trim() === initialQ) return;
    const timer = setTimeout(() => {
      router.replace(buildLoanListUrl(tab, q));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, initialQ, tab, router]);

  return (
    <div className="relative w-full sm:w-80">
      <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cari kode pinjam, peminjam, atau keperluan..."
        aria-label="Cari transaksi peminjaman"
        className="w-full h-10 pl-10 pr-9 rounded-full bg-white border border-line-200 text-sm focus:outline-none focus:border-ink-900"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ('');
            router.replace(buildLoanListUrl(tab, ''));
          }}
          aria-label="Hapus pencarian"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-ink-400 hover:text-ink-900 hover:bg-cream-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
