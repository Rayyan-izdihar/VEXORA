'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Power, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function AssetDetailActions({ asset }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [toggleOpen, setToggleOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConflict, setDeleteConflict] = useState('');
  const [loading, setLoading] = useState(false);

  const isBorrowed = asset.status === 'borrowed';
  const isInactive = asset.status === 'inactive';

  async function handleToggleStatus() {
    setLoading(true);
    try {
      const nextStatus = isInactive ? 'available' : 'inactive';
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asset_code: asset.asset_code,
          name: asset.name,
          category_id: asset.category_id,
          location_id: asset.location_id || null,
          condition: asset.condition,
          status: nextStatus,
          acquisition_date: asset.acquisition_date || null,
          image_url: asset.image_url || null,
          description: asset.description || null,
          notes: asset.notes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memperbarui status aset.', 'error');
        setLoading(false);
        return;
      }
      showToast(nextStatus === 'inactive' ? 'Aset dinonaktifkan' : 'Aset diaktifkan kembali');
      setToggleOpen(false);
      setDeleteOpen(false);
      setDeleteConflict('');
      setLoading(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setLoading(false);
    }
  }

  async function handleDelete() {
    setLoading(true);
    setDeleteConflict('');
    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          setDeleteConflict(
            data.error ||
              'Aset tidak bisa dihapus karena memiliki riwayat transaksi. Anda dapat menonaktifkannya.'
          );
        } else {
          showToast(data.error || 'Gagal menghapus aset.', 'error');
          setDeleteOpen(false);
        }
        setLoading(false);
        return;
      }
      showToast('Aset berhasil dihapus');
      setDeleteOpen(false);
      setLoading(false);
      router.push('/aset');
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setLoading(false);
    }
  }

  return (
    <>
      <div className="pt-3 border-t border-white/15 space-y-2.5">
        <button
          type="button"
          disabled={isBorrowed}
          onClick={() => setToggleOpen(true)}
          className="w-full h-11 px-4 rounded-full bg-white/10 text-white font-medium text-sm flex items-center gap-2.5 hover:bg-white/20 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <Power className="w-4 h-4 text-lime-400" />
          {isInactive ? 'Aktifkan kembali aset' : 'Nonaktifkan aset'}
        </button>

        <button
          type="button"
          disabled={isBorrowed}
          onClick={() => {
            setDeleteConflict('');
            setDeleteOpen(true);
          }}
          className="w-full h-11 px-4 rounded-full bg-status-danger-bg/15 text-red-200 font-medium text-sm flex items-center gap-2.5 hover:bg-status-danger-bg/25 disabled:opacity-45 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4 text-red-300" />
          Hapus aset
        </button>

        {isBorrowed && (
          <p className="text-xs text-[#C9CCBD] px-1">
            Aset sedang dipinjam sehingga tidak dapat dinonaktifkan atau dihapus.
          </p>
        )}
      </div>

      <Modal
        open={toggleOpen}
        onClose={() => setToggleOpen(false)}
        title={
          isInactive
            ? `Aktifkan kembali ${asset.asset_code}?`
            : `Nonaktifkan aset ${asset.asset_code}?`
        }
        description={
          isInactive
            ? 'Aset akan berstatus Tersedia dan dapat dipinjam kembali.'
            : 'Aset yang dinonaktifkan tidak dapat dipinjam atau dijadwalkan pemeliharaan, tetapi seluruh riwayatnya tetap tersimpan.'
        }
        confirmLabel={isInactive ? 'Aktifkan' : 'Nonaktifkan'}
        confirmVariant={isInactive ? 'primary' : 'danger'}
        loading={loading}
        onConfirm={handleToggleStatus}
      />

      <Modal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteConflict('');
        }}
        title={`Hapus aset ${asset.asset_code}?`}
        description={
          deleteConflict
            ? deleteConflict
            : `Aset "${asset.name}" akan dihapus permanen dari inventaris. Tindakan ini tidak dapat dibatalkan.`
        }
        cancelLabel={deleteConflict ? 'Tutup' : 'Batal'}
        confirmLabel={deleteConflict ? undefined : 'Ya, hapus aset'}
        confirmVariant="danger"
        loading={loading}
        onConfirm={deleteConflict ? undefined : handleDelete}
      >
        {deleteConflict && !isInactive && (
          <div className="pt-2">
            <Button
              variant="dark"
              className="w-full"
              loading={loading}
              onClick={handleToggleStatus}
            >
              Nonaktifkan aset saja
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
