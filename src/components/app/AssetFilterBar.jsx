'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function AssetFilterBar({
  initialQ = '',
  initialKategori = '',
  initialLokasi = '',
  initialKondisi = '',
  initialStatus = '',
  categories = [],
  locations = [],
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [kategori, setKategori] = useState(initialKategori);
  const [lokasi, setLokasi] = useState(initialLokasi);
  const [kondisi, setKondisi] = useState(initialKondisi);
  const [status, setStatus] = useState(initialStatus);
  const isFirstRender = useRef(true);

  function buildUrl(next) {
    const params = new URLSearchParams();
    if (next.q?.trim()) params.set('q', next.q.trim());
    if (next.kategori) params.set('kategori', next.kategori);
    if (next.lokasi) params.set('lokasi', next.lokasi);
    if (next.kondisi) params.set('kondisi', next.kondisi);
    if (next.status) params.set('status', next.status);
    const qs = params.toString();
    return qs ? `/aset?${qs}` : '/aset';
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      router.replace(buildUrl({ q, kategori, lokasi, kondisi, status }));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, kategori, lokasi, kondisi, status, router]);

  const hasFilters = Boolean(q || kategori || lokasi || kondisi || status);

  function handleReset() {
    setQ('');
    setKategori('');
    setLokasi('');
    setKondisi('');
    setStatus('');
    router.replace('/aset');
  }

  return (
    <div className="rounded-[20px] bg-white border border-line-200 p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <input
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kode atau nama..."
          className="lg:col-span-2 h-10 px-3.5 rounded-[12px] border border-line-200 text-sm focus:outline-none focus:border-ink-900"
        />
        <select
          name="kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
          className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
        >
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          name="lokasi"
          value={lokasi}
          onChange={(e) => setLokasi(e.target.value)}
          className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
        >
          <option value="">Semua lokasi</option>
          {locations.map((l) => (
            <option key={l.id} value={l.name}>
              {l.name}
            </option>
          ))}
        </select>
        <select
          name="kondisi"
          value={kondisi}
          onChange={(e) => setKondisi(e.target.value)}
          className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
        >
          <option value="">Semua kondisi</option>
          <option value="good">Baik</option>
          <option value="needs_attention">Perlu perhatian</option>
          <option value="damaged">Rusak</option>
        </select>
        <select
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
        >
          <option value="">Semua status</option>
          <option value="available">Tersedia</option>
          <option value="borrowed">Dipinjam</option>
          <option value="maintenance">Pemeliharaan</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {hasFilters && (
        <div className="flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Reset filter
          </Button>
        </div>
      )}
    </div>
  );
}
