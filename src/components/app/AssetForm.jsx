'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { Button } from '@/components/ui/Button';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useToast } from '@/components/ui/Toast';

export function AssetForm({ initialData = null, categories = [], locations = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const isEdit = Boolean(initialData?.id);
  const isBorrowed = isEdit && initialData?.status === 'borrowed';

  const [assetCode, setAssetCode] = useState(initialData?.asset_code || '');
  const [name, setName] = useState(initialData?.name || '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [locationId, setLocationId] = useState(initialData?.location_id || '');
  const [condition, setCondition] = useState(initialData?.condition || 'good');
  const [status, setStatus] = useState(initialData?.status || 'available');
  const [acquisitionDate, setAcquisitionDate] = useState(
    initialData?.acquisition_date ? String(initialData.acquisition_date).slice(0, 10) : ''
  );
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isEdit ? `/api/assets/${initialData.id}` : '/api/assets';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_code: assetCode,
          name,
          category_id: categoryId,
          location_id: locationId || null,
          condition,
          status,
          acquisition_date: acquisitionDate || null,
          image_url: imageUrl || null,
          description,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal menyimpan aset.');
        setLoading(false);
        return;
      }
      showToast('Aset disimpan');
      router.push(`/aset/${data.asset.id}`);
      router.refresh();
    } catch {
      setError('Perubahan belum tersimpan. Coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-[720px] rounded-[28px] bg-cream-100 p-6 sm:p-8 space-y-6"
    >
      {error && (
        <div
          role="alert"
          className="rounded-[12px] bg-status-danger-bg text-status-danger-fg px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Kode aset"
          name="asset_code"
          required
          placeholder="Contoh: LAB-0011"
          value={assetCode}
          onChange={(e) => setAssetCode(e.target.value)}
        />
        <Input
          label="Nama aset"
          name="name"
          required
          placeholder="Contoh: Proyektor Epson EB-X500"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <Combobox
            id="category_id"
            label="Kategori"
            required
            placeholder="Pilih kategori..."
            value={categoryId}
            onChange={setCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Link
            href="/referensi"
            className="inline-block mt-1.5 text-xs font-semibold text-ink-700 underline"
          >
            Kelola / tambah kategori baru
          </Link>
        </div>

        <Combobox
          id="location_id"
          label="Lokasi"
          placeholder="Pilih lokasi (opsional)..."
          value={locationId}
          onChange={setLocationId}
          options={locations.map((l) => ({ value: l.id, label: l.name }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-ink-900">
            Kondisi <span className="text-status-danger-fg">*</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'good', label: 'Baik' },
              { value: 'needs_attention', label: 'Perhatian' },
              { value: 'damaged', label: 'Rusak' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={`h-11 rounded-[12px] text-xs sm:text-sm font-semibold border transition-colors ${condition === opt.value
                    ? 'bg-ink-900 text-white border-ink-900'
                    : 'bg-white text-ink-700 border-line-200 hover:bg-cream-50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Select
          label="Status operasional"
          name="status"
          required
          disabled={isBorrowed}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          helper={
            isBorrowed
              ? 'Status Dipinjam dikelola otomatis oleh transaksi peminjaman. Catat pengembalian untuk mengubah status.'
        : isEdit
        ? 'Status Dipinjam dikelola otomatis oleh transaksi peminjaman.'
        : 'Bawaan aset baru adalah Tersedia.'
          }
        >
        <option value="available">Tersedia</option>
          <option value="borrowed" disabled>
            Dipinjam
          </option>
          <option value="maintenance">Pemeliharaan</option>
          <option value="inactive">Nonaktif</option>
        </Select>
      </div>

      <Input
        label="Tanggal perolehan"
        name="acquisition_date"
        type="date"
        value={acquisitionDate}
        onChange={(e) => setAcquisitionDate(e.target.value)}
      />

      <ImageUpload
        label="Foto kondisi aset (opsional)"
        value={imageUrl}
        onChange={setImageUrl}
        helper="Unggah foto fisik perangkat untuk memudahkan verifikasi kondisi."
      />

      <Textarea
        label="Deskripsi"
        name="description"
        placeholder="Spesifikasi singkat, merek, atau kelengkapan..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <Textarea
        label="Catatan"
        name="notes"
        placeholder="Catatan tambahan (opsional)..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-line-200">
        <Link href={isEdit ? `/aset/${initialData.id}` : '/aset'}>
          <Button variant="secondary">Batal</Button>
        </Link>
        <Button type="submit" variant="primary" loading={loading}>
          Simpan aset
        </Button>
      </div>
    </form>
  );
}
