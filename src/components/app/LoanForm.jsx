'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Check, AlertCircle } from 'lucide-react';
import { Input, Textarea } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ASSET_STATUSES } from '@/lib/status';
import { toLocalDateInputValue } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function LoanForm({ assets = [], borrowers = [], isStaff, currentUserId, preselectedAssetId = '' }) {
  const router = useRouter();
  const { showToast } = useToast();

  const today = toLocalDateInputValue();
  const [borrowerId, setBorrowerId] = useState(isStaff ? borrowers[0]?.id || currentUserId : currentUserId);
  const [selectedIds, setSelectedIds] = useState(() => {
    if (!preselectedAssetId) return [];
    const found = assets.find((a) => a.id === preselectedAssetId && a.status === 'available');
    return found ? [found.id] : [];
  });
  const [searchAsset, setSearchAsset] = useState('');
  const [loanDate, setLoanDate] = useState(today);
  const [expectedReturnDate, setExpectedReturnDate] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [directBorrow, setDirectBorrow] = useState(isStaff);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredAssets = assets.filter((a) => {
    const q = searchAsset.toLowerCase();
    return (
      a.asset_code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.category_name && a.category_name.toLowerCase().includes(q))
    );
  });

  function toggleAsset(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (selectedIds.length === 0) {
      setError('Pilih minimal satu aset yang tersedia.');
      return;
    }
    if (expectedReturnDate < loanDate) {
      setError('Tanggal kembali harus sama dengan atau setelah tanggal pinjam.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrower_id: borrowerId,
          asset_ids: selectedIds,
          loan_date: loanDate,
          expected_return_date: expectedReturnDate,
          purpose,
          direct_borrow: isStaff ? directBorrow : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan peminjaman.');
        if (Array.isArray(data.conflictAssetIds) && data.conflictAssetIds.length > 0) {
          setSelectedIds((prev) => prev.filter((id) => !data.conflictAssetIds.includes(id)));
        }
        setLoading(false);
        return;
      }

      showToast(directBorrow && isStaff ? 'Peminjaman dicatat' : 'Pengajuan peminjaman dikirim');
      router.push(`/peminjaman/${data.loan.id}`);
      router.refresh();
    } catch {
      setError('Perubahan belum tersimpan. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-8 rounded-[28px] bg-cream-100 p-6 sm:p-8 space-y-6">
        {error && (
          <div
            role="alert"
            className="rounded-[12px] bg-status-danger-bg text-status-danger-fg px-4 py-3 text-sm font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isStaff && (
          <Combobox
            id="borrower_id"
            label="1. Peminjam"
            required
            value={borrowerId}
            onChange={setBorrowerId}
            options={borrowers.map((u) => ({
              value: u.id,
              label: u.name,
              sublabel: u.email,
            }))}
          />
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink-900">
              {isStaff ? '2.' : '1.'} Pilih aset ({selectedIds.length} dipilih)
            </span>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchAsset}
                onChange={(e) => setSearchAsset(e.target.value)}
                placeholder="Cari aset..."
                className="w-full h-9 pl-9 pr-3 rounded-full bg-white border border-line-200 text-sm focus:outline-none focus:border-ink-900"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-[16px] bg-white border border-line-200 divide-y divide-line-200">
            {filteredAssets.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-ink-600">
                Tidak ada aset yang cocok.
              </div>
            ) : (
              filteredAssets.map((a) => {
                const available = a.status === 'available';
                const checked = selectedIds.includes(a.id);
                return (
                  <label
                    key={a.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 ${
                      available
                        ? 'cursor-pointer hover:bg-cream-50'
                        : 'opacity-55 cursor-not-allowed bg-cream-50'
                    } ${checked ? 'bg-lime-100/70' : ''}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        disabled={!available}
                        checked={checked}
                        onChange={() => toggleAsset(a.id)}
                        className="sr-only"
                      />
                      <span
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                          checked
                            ? 'bg-ink-900 border-ink-900 text-lime-400'
                            : 'border-line-200 bg-white'
                        }`}
                      >
                        {checked && <Check className="w-3.5 h-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-ink-900 truncate">
                          <span className="tabular-nums mr-2 text-ink-600">{a.asset_code}</span>
                          {a.name}
                        </div>
                        <div className="text-xs text-ink-600">{a.category_name}</div>
                      </div>
                    </div>
                    <Badge map={ASSET_STATUSES} value={a.status} />
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tanggal pinjam"
            name="loan_date"
            type="date"
            required
            value={loanDate}
            onChange={(e) => setLoanDate(e.target.value)}
          />
          <Input
            label="Rencana kembali"
            name="expected_return_date"
            type="date"
            required
            min={loanDate}
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
          />
        </div>

        <Textarea
          label="Keperluan peminjaman"
          name="purpose"
          placeholder="Contoh: Praktikum Jaringan Komputer Modul 4..."
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />

        {
                isStaff && (
                  <label className="flex items-center gap-3 text-sm text-ink-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={directBorrow}
                      onChange={(e) => setDirectBorrow(e.target.checked)}
                      className="w-4 h-4 accent-ink-900"
                    />
                    <span>Langsung serahkan aset sekarang (status langsung Dipinjam)</span>
                  </label>
                )
              }
      </div>

          {/* Ringkasan Sticky */}
          <div className="lg:col-span-4 rounded-[20px] bg-white border border-line-200 p-6 space-y-4 sticky top-20">
            <h2 className="text-lg font-semibold text-ink-900">Ringkasan</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-600">Aset dipilih</dt>
                <dd className="font-semibold tabular-nums">{selectedIds.length} unit</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Tanggal pinjam</dt>
                <dd className="font-semibold tabular-nums">{loanDate}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-600">Rencana kembali</dt>
                <dd className="font-semibold tabular-nums">{expectedReturnDate}</dd>
              </div>
            </dl>

            <div className="pt-3 border-t border-line-200 flex flex-col gap-2.5">
              <Button type="submit" variant="primary" loading={loading} className="w-full">
                {isStaff && directBorrow ? 'Catat peminjaman' : 'Ajukan peminjaman'}
              </Button>
              <Link href="/peminjaman" className="w-full">
                <Button variant="secondary" className="w-full">
                  Batal
                </Button>
              </Link>
            </div>
          </div>
        </form>
        );
}
