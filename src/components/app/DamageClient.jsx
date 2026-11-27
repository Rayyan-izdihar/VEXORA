'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle, Search, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Combobox } from '@/components/ui/Combobox';
import { Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImageUpload, UploadedImage } from '@/components/ui/ImageUpload';
import { DAMAGE_STATUSES } from '@/lib/status';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function DamageClient({ reports = [], assets = [], isStaff, preselectedAssetId = '' }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [createOpen, setCreateOpen] = useState(Boolean(preselectedAssetId));
  const [assetId, setAssetId] = useState(preselectedAssetId);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [nextStatus, setNextStatus] = useState('reviewed');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assetCondition, setAssetCondition] = useState('');
  const [updating, setUpdating] = useState(false);

  const filteredReports = reports.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      const match =
        r.asset_code?.toLowerCase().includes(q) ||
        r.asset_name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.reporter_name?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const hasFilters = Boolean(searchQ.trim() || statusFilter !== 'all');

  async function handleCreate(e) {
    e.preventDefault();
    if (!assetId || description.trim().length < 10) {
      showToast('Pilih aset dan isi deskripsi minimal 10 karakter.', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/damage-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_id: assetId,
          description,
          image_url: imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal mengirim laporan.', 'error');
        setSaving(false);
        return;
      }
      showToast('Laporan terkirim');
      setCreateOpen(false);
      setAssetId('');
      setDescription('');
      setImageUrl('');
      setSaving(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setSaving(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    if (!selectedReport) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/damage-reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          resolution_notes: resolutionNotes,
          asset_condition: assetCondition || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memperbarui laporan.', 'error');
        setUpdating(false);
        return;
      }
      showToast('Laporan kerusakan diperbarui');
      setSelectedReport(null);
      setUpdating(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setUpdating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cari aset, pelapor, gejala..."
              aria-label="Cari laporan kerusakan"
              className="w-full h-10 pl-10 pr-3 rounded-full border border-line-200 bg-white text-sm focus:outline-none focus:border-ink-900"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status laporan"
            className="h-10 px-3.5 rounded-full border border-line-200 bg-white text-sm"
          >
            <option value="all">Semua status</option>
            <option value="reported">Dilaporkan</option>
            <option value="reviewed">Ditinjau</option>
            <option value="in_progress">Ditangani</option>
            <option value="resolved">Selesai</option>
          </select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQ('');
                setStatusFilter('all');
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <Button variant="primary" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" />
          Laporkan kerusakan
        </Button>
      </div>

      {filteredReports.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={AlertTriangle}
            title="Tidak ada laporan yang cocok"
            description="Coba ubah kata kunci atau filter status laporan."
            actionLabel="Reset filter"
            onAction={() => {
              setSearchQ('');
              setStatusFilter('all');
            }}
          />
        ) : (
          <EmptyState
            icon={AlertTriangle}
            title="Belum ada laporan kerusakan"
            description="Jika ada peralatan yang bermasalah atau rusak, laporkan segera di sini."
            actionLabel="Laporkan kerusakan"
            onAction={() => setCreateOpen(true)}
          />
        )
      ) : (
        <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Aset</th>
                  <th className="py-3.5 px-4">Deskripsi kerusakan</th>
                  <th className="py-3.5 px-4">Foto</th>
                  <th className="py-3.5 px-4">Pelapor</th>
                  <th className="py-3.5 px-4">Waktu lapor</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {filteredReports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      if (!isStaff) return;
                      setSelectedReport(r);
                      setNextStatus(r.status);
                      setResolutionNotes(r.resolution_notes || '');
                      setAssetCondition('');
                    }}
                    className={`h-14 ${isStaff ? 'hover:bg-cream-50 cursor-pointer' : ''}`}
                  >
                    <td className="px-5">
                      <span className="font-semibold tabular-nums text-ink-600 mr-2">
                        {r.asset_code}
                      </span>
                      <span className="font-medium text-ink-900">{r.asset_name}</span>
                    </td>
                    <td className="px-4 max-w-md">
                      <p className="line-clamp-2 text-ink-900">{r.description}</p>
                    </td>
                    <td className="px-4">
                      {r.image_url ? (
                        <a
                          href={r.image_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-700 underline hover:text-ink-900"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Lihat
                        </a>
                      ) : (
                        <span className="text-ink-400">-</span>
                      )}
                    </td>
                    <td className="px-4 text-ink-600">{r.reporter_name || '-'}</td>
                    <td className="px-4 text-ink-600 tabular-nums">{formatDateTime(r.reported_at)}</td>
                    <td className="px-5">
                      <Badge map={DAMAGE_STATUSES} value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Laporkan kerusakan"
        subtitle="Jelaskan gejala atau kerusakan yang ditemukan pada peralatan"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Combobox
            id="dmg-asset"
            label="Aset"
            required
            value={assetId}
            onChange={setAssetId}
            options={assets.map((a) => ({
              value: a.id,
              label: `${a.asset_code} — ${a.name}`,
            }))}
          />
          <Textarea
            label="Deskripsi kerusakan"
            name="description"
            required
            rows={4}
            placeholder="Minimal 10 karakter..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            helper={`${description.trim().length} / minimal 10 karakter`}
          />
          <ImageUpload
            label="Foto bukti kerusakan (opsional)"
            value={imageUrl}
            onChange={setImageUrl}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Kirim laporan
            </Button>
          </div>
        </form>
      </Drawer>

      <Drawer
        open={Boolean(selectedReport)}
        onClose={() => setSelectedReport(null)}
        title="Tindak lanjuti laporan"
        subtitle={selectedReport ? `${selectedReport.asset_code} · ${selectedReport.asset_name}` : ''}
      >
        {selectedReport && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="rounded-[12px] bg-cream-100 p-4 text-sm text-ink-900">
              {selectedReport.description}
            </div>
            {selectedReport.image_url && (
              <div className="rounded-[12px] border border-line-200 bg-white p-2.5 space-y-2">
                <UploadedImage
                  src={selectedReport.image_url}
                  alt="Foto bukti kerusakan"
                  className="w-full max-h-56 object-contain rounded-[8px]"
                />
                <a
                  href={selectedReport.image_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs font-semibold text-ink-700 underline"
                >
                  Buka ukuran penuh
                </a>
              </div>
            )}
            <Select
              label="Status penanganan"
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
            >
              <option value="reported">Dilaporkan</option>
              <option value="reviewed">Ditinjau</option>
              <option value="in_progress">Ditangani</option>
              <option value="resolved">Selesai</option>
            </Select>
            <Select
              label="Perbarui kondisi aset (opsional)"
              value={assetCondition}
              onChange={(e) => setAssetCondition(e.target.value)}
            >
              <option value="">Tidak mengubah kondisi aset</option>
              <option value="good">Baik</option>
              <option value="needs_attention">Perlu perhatian</option>
              <option value="damaged">Rusak</option>
            </Select>
            <Textarea
              label="Catatan penyelesaian"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedReport(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={updating}>
                Simpan perubahan
              </Button>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  );
}
