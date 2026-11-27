'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RotateCcw, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Textarea } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { ASSET_CONDITIONS } from '@/lib/status';
import { formatDate, formatDateTime, daysOverdue } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function ReturnClient({ pendingItems = [], historyRecords = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState('pending');
  const [selectedItem, setSelectedItem] = useState(null);
  const [conditionAfter, setConditionAfter] = useState('good');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [problemAssetId, setProblemAssetId] = useState('');

  function openReturnDrawer(item) {
    setSelectedItem(item);
    setConditionAfter('good');
    setNotes('');
    setImageUrl('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedItem) return;
    setSaving(true);
    try {
      const res = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan_item_id: selectedItem.id,
          condition_after: conditionAfter,
          notes,
          image_url: imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal mencatat pengembalian.', 'error');
        setSaving(false);
        return;
      }

      showToast('Pengembalian dicatat');
      if (conditionAfter === 'needs_attention' || conditionAfter === 'damaged') {
        setProblemAssetId(data.assetId);
      }
      setSelectedItem(null);
      setSaving(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {problemAssetId && (
        <div className="rounded-[16px] bg-lime-100 border border-lime-500 px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink-900">
            Aset kembali dengan kondisi bermasalah. Perlu dibuatkan laporan kerusakan?
          </span>
          <div className="flex items-center gap-2">
            <Link href={`/kerusakan?asset=${problemAssetId}`}>
              <Button variant="dark" size="sm">
                Buat laporan kerusakan
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => setProblemAssetId('')}>
              Tutup
            </Button>
          </div>
        </div>
      )}

      <div className="inline-flex rounded-full bg-cream-100 p-1">
        <button
          type="button"
          onClick={() => setTab('pending')}
          className={`h-9 px-5 rounded-full text-sm font-semibold ${
            tab === 'pending' ? 'bg-ink-900 text-white' : 'text-ink-700'
          }`}
        >
          Menunggu dikembalikan ({pendingItems.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`h-9 px-5 rounded-full text-sm font-semibold ${
            tab === 'history' ? 'bg-ink-900 text-white' : 'text-ink-700'
          }`}
        >
          Riwayat ({historyRecords.length})
        </button>
      </div>

      {tab === 'pending' ? (
        pendingItems.length === 0 ? (
          <EmptyState
            icon={RotateCcw}
            title="Tidak ada item yang sedang dipinjam"
            description="Semua peralatan yang dipinjam sudah tercatat kembali."
          />
        ) : (
          <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                  <tr className="text-left">
                    <th className="py-3.5 px-5">Kode pinjam</th>
                    <th className="py-3.5 px-4">Aset</th>
                    <th className="py-3.5 px-4">Peminjam</th>
                    <th className="py-3.5 px-4">Rencana kembali</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-200">
                  {pendingItems.map((item) => {
                    const late = daysOverdue(item.expected_return_date);
                    return (
                      <tr key={item.id} className="h-14 hover:bg-cream-50">
                        <td className="px-5 font-semibold tabular-nums">{item.loan_code}</td>
                        <td className="px-4">
                          <span className="font-semibold tabular-nums text-ink-600 mr-2">
                            {item.asset_code}
                          </span>
                          <span className="font-medium text-ink-900">{item.asset_name}</span>
                        </td>
                        <td className="px-4 text-ink-700">{item.borrower_name}</td>
                        <td className="px-4 tabular-nums">
                          <span className={late > 0 ? 'text-status-danger-fg font-semibold' : 'text-ink-600'}>
                            {formatDate(item.expected_return_date)}
                          </span>
                          {late > 0 && (
                            <span className="block text-xs text-status-danger-fg">
                              Terlambat {late} hari
                            </span>
                          )}
                        </td>
                        <td className="px-5 text-right">
                          <Button variant="primary" size="sm" onClick={() => openReturnDrawer(item)}>
                            Catat pengembalian
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : historyRecords.length === 0 ? (
        <EmptyState
          icon={RotateCcw}
          title="Belum ada riwayat pengembalian"
          description="Catatan pengembalian peralatan akan muncul di sini."
        />
      ) : (
        <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Waktu kembali</th>
                  <th className="py-3.5 px-4">Aset</th>
                  <th className="py-3.5 px-4">Peminjam</th>
                  <th className="py-3.5 px-4">Kondisi kembali</th>
                  <th className="py-3.5 px-4">Bukti foto</th>
                  <th className="py-3.5 px-5">Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {historyRecords.map((r) => (
                  <tr key={r.id} className="h-14 hover:bg-cream-50">
                    <td className="px-5 tabular-nums text-ink-600">{formatDateTime(r.return_date)}</td>
                    <td className="px-4">
                      <span className="font-semibold tabular-nums text-ink-600 mr-2">
                        {r.asset_code}
                      </span>
                      {r.asset_name}
                    </td>
                    <td className="px-4 text-ink-700">{r.borrower_name}</td>
                    <td className="px-4">
                      <Badge map={ASSET_CONDITIONS} value={r.condition_after} />
                    </td>
                    <td className="px-4">
                      {r.image_url ? (
                        <a
                          href={r.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 underline hover:text-ink-900"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Lihat
                        </a>
                      ) : (
                        <span className="text-ink-400">-</span>
                      )}
                    </td>
                    <td className="px-5 text-ink-600">{r.receiver_name || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        title="Catat pengembalian"
        subtitle={
          selectedItem
            ? `${selectedItem.asset_code} · ${selectedItem.asset_name} (${selectedItem.borrower_name})`
            : ''
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink-900">Kondisi saat kembali</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'good', label: 'Baik' },
                { value: 'needs_attention', label: 'Perhatian' },
                { value: 'damaged', label: 'Rusak' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConditionAfter(opt.value)}
                  className={`h-11 rounded-[12px] text-xs sm:text-sm font-semibold border ${
                    conditionAfter === opt.value
                      ? 'bg-ink-900 text-white border-ink-900'
                      : 'bg-white text-ink-700 border-line-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Catatan pengembalian"
            name="notes"
            placeholder="Kelengkapan kabel, tas, atau catatan kondisi..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <ImageUpload
            label={
              conditionAfter === 'good'
                ? 'Foto kondisi kembali (opsional)'
                : 'Foto bukti kondisi bermasalah (disarankan)'
            }
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSelectedItem(null)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Simpan pengembalian
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
