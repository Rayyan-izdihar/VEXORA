'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export function ReferensiClient({ initialCategories, initialLocations }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [tab, setTab] = useState('categories'); // 'categories' | 'locations'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const rows = tab === 'categories' ? initialCategories : initialLocations;
  const endpointBase = tab === 'categories' ? '/api/categories' : '/api/locations';
  const singular = tab === 'categories' ? 'kategori' : 'lokasi';

  function openNew() {
    setEditing(null);
    setName('');
    setDescription('');
    setFormError('');
    setDrawerOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setName(row.name);
    setDescription(row.description || '');
    setFormError('');
    setDrawerOpen(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const res = await fetch(editing ? `${endpointBase}/${editing.id}` : endpointBase, {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || `Gagal menyimpan ${singular}.`);
        setSaving(false);
        return;
      }
      showToast(`${singular === 'kategori' ? 'Kategori' : 'Lokasi'} disimpan`);
      setDrawerOpen(false);
      setSaving(false);
      router.refresh();
    } catch {
      setFormError('Terjadi kesalahan jaringan.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${endpointBase}/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || `Gagal menghapus ${singular}.`, 'error');
        setDeleting(false);
        setDeleteTarget(null);
        return;
      }
      showToast(`${singular === 'kategori' ? 'Kategori' : 'Lokasi'} dihapus`);
      setDeleting(false);
      setDeleteTarget(null);
      router.refresh();
    } catch {
      showToast('Gagal menghapus data.', 'error');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full bg-cream-100 p-1">
          <button
            type="button"
            onClick={() => setTab('categories')}
            className={`h-9 px-5 rounded-full text-sm font-semibold transition-colors ${tab === 'categories' ? 'bg-ink-900 text-white' : 'text-ink-700 hover:text-ink-900'
              }`}
          >
            Kategori ({initialCategories.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('locations')}
            className={`h-9 px-5 rounded-full text-sm font-semibold transition-colors ${tab === 'locations' ? 'bg-ink-900 text-white' : 'text-ink-700 hover:text-ink-900'
              }`}
          >
            Lokasi ({initialLocations.length})
          </button>
        </div>

        <Button variant="primary" onClick={openNew}>
          <Plus className="w-4 h-4" />
          Tambah {singular}
        </Button>
      </div>

      <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
            <tr className="text-left">
              <th className="py-3.5 px-5">Nama</th>
              <th className="py-3.5 px-4">Deskripsi</th>
              <th className="py-3.5 px-4 text-right">Jumlah aset</th>
              <th className="py-3.5 px-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-ink-600">
                        Belum ada data {singular}.
                      </td>
                    </tr>
                  ) : (
              rows.map((r) => (
                  <tr key={r.id} className="h-14 hover:bg-cream-50">
                    <td className="px-5 font-semibold text-ink-900">{r.name}</td>
                    <td className="px-4 text-ink-600">{r.description || '-'}</td>
                    <td className="px-4 text-right tabular-nums font-medium">{r.asset_count}</td>
                    <td className="px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(r)}
                          aria-label={`Ubah ${r.name}`}
                          className="w-8 h-8 rounded-full border border-line-200 inline-flex items-center justify-center text-ink-700 hover:bg-cream-100"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(r)}
                          aria-label={`Hapus ${r.name}`}
                          className="w-8 h-8 rounded-full border border-line-200 inline-flex items-center justify-center text-status-danger-fg hover:bg-status-danger-bg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
            )}
                </tbody>
              </table>
      </div>

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title={editing ? `Ubah ${singular}` : `Tambah ${singular}`}
          >
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="rounded-[12px] bg-status-danger-bg text-status-danger-fg px-4 py-3 text-sm font-medium">
                  {formError}
                </div>
              )}
              <Input
                label={`Nama ${singular}`}
                name="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Textarea
                label="Deskripsi"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  Simpan
                </Button>
              </div>
            </form>
          </Drawer>

          <Modal
            open={Boolean(deleteTarget)}
            onClose={() => setDeleteTarget(null)}
            title={`Hapus ${singular} ${deleteTarget?.name}?`}
            description={
              deleteTarget?.asset_count > 0
                ? `${singular === 'kategori' ? 'Kategori' : 'Lokasi'} ini masih dipakai ${deleteTarget.asset_count} aset. Pindahkan asetnya dulu sebelum menghapus.`
                : 'Tindakan ini tidak bisa dibatalkan.'
            }
            cancelLabel={deleteTarget?.asset_count > 0 ? 'Tutup' : 'Batal'}
            confirmLabel="Hapus"
            loading={deleting}
            onConfirm={deleteTarget?.asset_count > 0 ? undefined : handleDelete}
          />
      </div>
      );
}
