import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const user = auth.user;
  const isStaff = user.role === 'administrator' || user.role === 'laboran';

  try {
    const body = await request.json();
    const assetIds = Array.isArray(body.asset_ids) ? [...new Set(body.asset_ids)] : [];
    const loanDate = String(body.loan_date || '').slice(0, 10);
    const expectedReturnDate = String(body.expected_return_date || '').slice(0, 10);
    const purpose = body.purpose ? String(body.purpose).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const borrowerId = isStaff && body.borrower_id ? body.borrower_id : user.id;
    const directBorrow = isStaff && body.direct_borrow === true;

    if (assetIds.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal satu aset.' }, { status: 400 });
    }
    if (!loanDate || !expectedReturnDate) {
      return NextResponse.json(
        { error: 'Tanggal pinjam dan rencana kembali wajib diisi.' },
        { status: 400 }
      );
    }
    if (expectedReturnDate < loanDate) {
      return NextResponse.json(
        { error: 'Tanggal kembali harus sama dengan atau setelah tanggal pinjam.' },
        { status: 400 }
      );
    }

    const result = await withTransaction(async (client) => {
      // Lock selected assets in deterministic order to prevent deadlocks
      const { rows: lockedAssets } = await client.query(
        `SELECT id, asset_code, name, condition, status
         FROM assets
         WHERE id = ANY($1::uuid[])
         ORDER BY id ASC
         FOR UPDATE`,
        [assetIds]
      );

      if (lockedAssets.length !== assetIds.length) {
        return { error: 'Sebagian aset tidak ditemukan.', status: 404 };
      }

      const unavailable = lockedAssets.filter((a) => a.status !== 'available');
      if (unavailable.length > 0) {
        const names = unavailable.map((a) => `${a.name} (${a.asset_code})`).join(', ');
        return {
          error: `${names} baru saja dipinjam orang lain atau sedang tidak tersedia. Pilih aset lain.`,
          conflictAssetIds: unavailable.map((a) => a.id),
          status: 409,
        };
      }

      const loanCode = `LN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const loanStatus = directBorrow ? 'borrowed' : 'pending';
      const itemStatus = directBorrow ? 'borrowed' : 'requested';

      const { rows: loanRows } = await client.query(
        `INSERT INTO loans (loan_code, borrower_id, created_by, loan_date, expected_return_date, status, purpose, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [loanCode, borrowerId, user.id, loanDate, expectedReturnDate, loanStatus, purpose, notes]
      );
      const loan = loanRows[0];

      for (const asset of lockedAssets) {
        await client.query(
          `INSERT INTO loan_items (loan_id, asset_id, item_status, condition_before)
           VALUES ($1, $2, $3, $4)`,
          [loan.id, asset.id, itemStatus, asset.condition]
        );
      }

      if (directBorrow) {
        await client.query(
          `UPDATE assets SET status = 'borrowed', updated_at = NOW()
           WHERE id = ANY($1::uuid[])`,
          [assetIds]
        );
      }

      return { loan, status: 201 };
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, conflictAssetIds: result.conflictAssetIds || [] },
        { status: result.status }
      );
    }

    return NextResponse.json({ loan: result.loan }, { status: 201 });
  } catch (err) {
    console.error('Create loan error:', err);
    return NextResponse.json(
      { error: 'Perubahan belum tersimpan. Coba lagi.' },
      { status: 500 }
    );
  }
}
