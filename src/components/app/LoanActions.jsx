'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';

export function LoanActions({ loanId, status, isStaff, isOwner }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingAction, setLoadingAction] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);

  async function runTransition(action, successMsg) {
    setLoadingAction(action);
    try {
      const res = await fetch(`/api/loans/${loanId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memproses aksi.', 'error');
        setLoadingAction('');
        setConfirmModal(null);
        return;
      }
      showToast(successMsg);
      setLoadingAction('');
      setConfirmModal(null);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setLoadingAction('');
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {isStaff && status === 'pending' && (
        <>
          <Button
            variant="secondary"
            loading={loadingAction === 'approve'}
            onClick={() => runTransition('approve', 'Peminjaman disetujui')}
          >
            Setujui
          </Button>
          <Button
            variant="primary"
            loading={loadingAction === 'handover'}
            onClick={() => runTransition('handover', 'Aset diserahkan ke peminjam')}
          >
            Setujui &amp; Serahkan
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              setConfirmModal({
                action: 'reject',
                title: 'Tolak pengajuan peminjaman?',
                desc: 'Pengajuan ini akan ditandai Ditolak dan tidak dapat dilanjutkan.',
                label: 'Tolak',
                msg: 'Pengajuan ditolak',
              })
            }
          >
            Tolak
          </Button>
        </>
      )}

      {isStaff && status === 'approved' && (
        <Button
          variant="primary"
          loading={loadingAction === 'handover'}
          onClick={() => runTransition('handover', 'Aset diserahkan ke peminjam')}
        >
          Serahkan aset
        </Button>
      )}

      {(isStaff || isOwner) && ['pending', 'approved'].includes(status) && (
        <Button
          variant="ghost"
          onClick={() =>
            setConfirmModal({
              action: 'cancel',
              title: 'Batalkan peminjaman?',
              desc: 'Transaksi akan dibatalkan.',
              label: 'Ya, batalkan',
              msg: 'Peminjaman dibatalkan',
            })
          }
        >
          Batalkan
        </Button>
      )}

      <Modal
        open={Boolean(confirmModal)}
        onClose={() => setConfirmModal(null)}
        title={confirmModal?.title}
        description={confirmModal?.desc}
        confirmLabel={confirmModal?.label}
        loading={Boolean(loadingAction)}
        onConfirm={() => runTransition(confirmModal.action, confirmModal.msg)}
      />
    </div>
  );
}
