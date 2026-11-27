import { NextResponse } from 'next/server';
import { withTransaction, isValidUuid } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { notifyUsers, notifyStaff } from '@/lib/notifications';

export async function POST(request, { params }) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const user = auth.user;
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Transaksi peminjaman tidak ditemukan.' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const action = body.action; // 'approve' | 'reject' | 'handover' | 'cancel'

    if (!['approve', 'reject', 'handover', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
    }

    if (['approve', 'reject', 'handover'].includes(action) && !isStaff) {
      return NextResponse.json(
        { error: 'Hanya laboran atau administrator yang dapat memproses aksi ini.' },
        { status: 403 }
      );
    }

    const result = await withTransaction(async (client) => {
      const { rows: loanRows } = await client.query(
        `SELECT * FROM loans WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const loan = loanRows[0];
      if (!loan) return { error: 'Transaksi peminjaman tidak ditemukan.', status: 404 };

      if (action === 'cancel' && !isStaff && loan.borrower_id !== user.id) {
        return { error: 'Anda tidak berhak membatalkan peminjaman ini.', status: 403 };
      }

      if (action === 'approve') {
        if (loan.status !== 'pending') {
          return { error: 'Hanya pengajuan berstatus Menunggu yang dapat disetujui.', status: 400 };
        }

        const { rows: itemRows } = await client.query(
          `SELECT asset_id FROM loan_items WHERE loan_id = $1 ORDER BY asset_id ASC`,
          [id]
        );
        const assetIds = itemRows.map((i) => i.asset_id);
        if (assetIds.length === 0) {
          return { error: 'Transaksi peminjaman tidak memiliki aset.', status: 400 };
        }

        await client.query(
          `SELECT id FROM assets WHERE id = ANY($1::uuid[]) ORDER BY id ASC FOR UPDATE`,
          [assetIds]
        );

        const { rows: conflicts } = await client.query(
          `SELECT a.asset_code, a.name, l.loan_code, l.loan_date, l.expected_return_date
           FROM loan_items li
           JOIN loans l ON l.id = li.loan_id
           JOIN assets a ON a.id = li.asset_id
           WHERE li.asset_id = ANY($1::uuid[])
             AND l.id != $2
             AND l.status IN ('approved', 'borrowed', 'overdue')
             AND li.item_status IN ('approved', 'borrowed')
             AND l.loan_date <= $3::date
             AND GREATEST(
               l.expected_return_date,
               CASE WHEN l.status IN ('borrowed', 'overdue') THEN (NOW() AT TIME ZONE 'Asia/Makassar')::date ELSE l.expected_return_date END
             ) >= $4::date`,
          [assetIds, id, loan.expected_return_date, loan.loan_date]
        );

        if (conflicts.length > 0) {
          const names = [...new Set(conflicts.map((c) => `${c.name} (${c.asset_code})`))].join(', ');
          return {
            error: `Tidak dapat menyetujui: jadwal bentrok dengan transaksi lain untuk ${names}.`,
            status: 409,
          };
        }

        await client.query(`UPDATE loans SET status = 'approved', updated_at = NOW() WHERE id = $1`, [id]);
        await client.query(
          `UPDATE loan_items SET item_status = 'approved' WHERE loan_id = $1 AND item_status = 'requested'`,
          [id]
        );
        if (loan.borrower_id !== user.id) {
          await notifyUsers(client, {
            userIds: [loan.borrower_id],
            title: 'Peminjaman disetujui',
            message: `Pengajuan ${loan.loan_code} telah disetujui untuk jadwal ${formatDate(loan.loan_date)} – ${formatDate(loan.expected_return_date)}.`,
            linkUrl: `/peminjaman/${id}`,
            loanId: id,
          });
        }
        return { status: 200, ok: true };
      }

      if (action === 'reject') {
        if (loan.status !== 'pending') {
          return { error: 'Hanya pengajuan berstatus Menunggu yang dapat ditolak.', status: 400 };
        }
        await client.query(`UPDATE loans SET status = 'rejected', updated_at = NOW() WHERE id = $1`, [id]);
        await client.query(
          `UPDATE loan_items SET item_status = 'rejected' WHERE loan_id = $1`,
          [id]
        );
        if (loan.borrower_id !== user.id) {
          await notifyUsers(client, {
            userIds: [loan.borrower_id],
            title: 'Peminjaman ditolak',
            message: `Pengajuan peminjaman ${loan.loan_code} ditolak oleh petugas laboratorium.`,
            linkUrl: `/peminjaman/${id}`,
            loanId: id,
          });
        }
        return { status: 200, ok: true };
      }

      if (action === 'cancel') {
        if (!['pending', 'approved'].includes(loan.status)) {
          return { error: 'Peminjaman yang sudah diserahkan tidak dapat dibatalkan.', status: 400 };
        }
        await client.query(`UPDATE loans SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id]);
        await client.query(
          `UPDATE loan_items SET item_status = 'cancelled' WHERE loan_id = $1`,
          [id]
        );
        if (!isStaff) {
          await notifyStaff(client, {
            title: 'Pengajuan peminjaman dibatalkan',
            message: `${user.name} membatalkan pengajuan peminjaman ${loan.loan_code}.`,
            linkUrl: `/peminjaman/${id}`,
            loanId: id,
            excludeUserId: user.id,
          });
        } else if (loan.borrower_id !== user.id) {
          await notifyUsers(client, {
            userIds: [loan.borrower_id],
            title: 'Peminjaman dibatalkan',
            message: `Transaksi peminjaman ${loan.loan_code} dibatalkan oleh petugas laboratorium.`,
            linkUrl: `/peminjaman/${id}`,
            loanId: id,
          });
        }
        return { status: 200, ok: true };
      }

      if (action === 'handover') {
        if (!['pending', 'approved'].includes(loan.status)) {
          return { error: 'Peminjaman ini tidak dalam tahap siap diserahkan.', status: 400 };
        }

        const { rows: items } = await client.query(
          `SELECT li.id, li.asset_id
           FROM loan_items li
           WHERE li.loan_id = $1
           ORDER BY li.asset_id ASC`,
          [id]
        );
        const assetIds = items.map((i) => i.asset_id);
        if (assetIds.length === 0) {
          return { error: 'Transaksi peminjaman tidak memiliki aset.', status: 400 };
        }

        const { rows: lockedAssets } = await client.query(
          `SELECT id, asset_code, name, condition, status
           FROM assets
           WHERE id = ANY($1::uuid[])
           ORDER BY id ASC
           FOR UPDATE`,
          [assetIds]
        );

        if (lockedAssets.length !== assetIds.length) {
          return { error: 'Sebagian aset pada transaksi ini tidak ditemukan.', status: 404 };
        }

        const unavailable = lockedAssets.filter((a) => a.status !== 'available');
        if (unavailable.length > 0) {
          const names = unavailable.map((a) => `${a.name} (${a.asset_code})`).join(', ');
          return {
            error: `Tidak dapat menyerahkan: ${names} baru saja dipinjam orang lain atau tidak tersedia.`,
            status: 409,
          };
        }

        const { rows: handoverConflicts } = await client.query(
          `SELECT a.asset_code, a.name
           FROM loan_items li
           JOIN loans l ON l.id = li.loan_id
           JOIN assets a ON a.id = li.asset_id
           WHERE li.asset_id = ANY($1::uuid[])
             AND l.id != $2
             AND l.status IN ('approved', 'borrowed', 'overdue')
             AND li.item_status IN ('approved', 'borrowed')
             AND l.loan_date <= $3::date
             AND GREATEST(
               l.expected_return_date,
               CASE WHEN l.status IN ('borrowed', 'overdue') THEN (NOW() AT TIME ZONE 'Asia/Makassar')::date ELSE l.expected_return_date END
             ) >= $4::date`,
          [assetIds, id, loan.expected_return_date, loan.loan_date]
        );
        if (handoverConflicts.length > 0) {
          const names = [...new Set(handoverConflicts.map((c) => `${c.name} (${c.asset_code})`))].join(', ');
          return {
            error: `Tidak dapat menyerahkan: jadwal bentrok dengan transaksi lain untuk ${names}.`,
            status: 409,
          };
        }

        await client.query(
          `UPDATE assets SET status = 'borrowed', updated_at = NOW() WHERE id = ANY($1::uuid[])`,
          [assetIds]
        );
        await client.query(
          `UPDATE loan_items li
           SET item_status = 'borrowed',
               condition_before = a.condition
           FROM assets a
           WHERE li.asset_id = a.id AND li.loan_id = $1`,
          [id]
        );
        await client.query(
          `UPDATE loans SET status = 'borrowed', updated_at = NOW() WHERE id = $1`,
          [id]
        );
        if (loan.borrower_id !== user.id) {
          await notifyUsers(client, {
            userIds: [loan.borrower_id],
            title: 'Aset telah diserahkan',
            message: `Peralatan untuk transaksi ${loan.loan_code} telah diserahkan. Rencana kembali ${formatDate(loan.expected_return_date)}.`,
            linkUrl: `/peminjaman/${id}`,
            loanId: id,
          });
        }
        return { status: 200, ok: true };
      }
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Loan transition error:', err);
    return NextResponse.json({ error: 'Gagal memproses perubahan status.' }, { status: 500 });
  }
}
