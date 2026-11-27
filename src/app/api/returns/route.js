import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const loanItemId = body.loan_item_id;
    const returnDate = body.return_date || new Date().toISOString();
    const conditionAfter = body.condition_after || 'good';
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!loanItemId) {
      return NextResponse.json({ error: 'Item pinjaman wajib dipilih.' }, { status: 400 });
    }
    if (!['good', 'needs_attention', 'damaged'].includes(conditionAfter)) {
      return NextResponse.json({ error: 'Kondisi pengembalian tidak valid.' }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const { rows: itemRows } = await client.query(
        `SELECT li.*, a.id AS asset_id
         FROM loan_items li
         JOIN assets a ON a.id = li.asset_id
         WHERE li.id = $1
         FOR UPDATE OF li, a`,
        [loanItemId]
      );
      const item = itemRows[0];
      if (!item) {
        return { error: 'Item peminjaman tidak ditemukan.', status: 404 };
      }
      if (item.item_status === 'returned') {
        return { error: 'Item ini sudah pernah dicatat dikembalikan.', status: 409 };
      }
      if (item.item_status !== 'borrowed') {
        return { error: 'Hanya item berstatus Dipinjam yang bisa dikembalikan.', status: 400 };
      }

      await client.query(
        `INSERT INTO return_records (loan_item_id, received_by, return_date, condition_after, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [loanItemId, auth.user.id, returnDate, conditionAfter, notes]
      );

      await client.query(
        `UPDATE loan_items SET item_status = 'returned' WHERE id = $1`,
        [loanItemId]
      );

      const nextAssetStatus = conditionAfter === 'damaged' ? 'maintenance' : 'available';
      await client.query(
        `UPDATE assets
         SET condition = $1, status = $2, updated_at = NOW()
         WHERE id = $3`,
        [conditionAfter, nextAssetStatus, item.asset_id]
      );

      const { rows: remaining } = await client.query(
        `SELECT COUNT(*)::int AS cnt
         FROM loan_items
         WHERE loan_id = $1 AND item_status != 'returned'`,
        [item.loan_id]
      );

      if ((remaining[0]?.cnt ?? 0) === 0) {
        await client.query(
          `UPDATE loans SET status = 'completed', updated_at = NOW() WHERE id = $1`,
          [item.loan_id]
        );
      }

      return { status: 201, assetId: item.asset_id, conditionAfter };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(
      { ok: true, assetId: result.assetId, conditionAfter: result.conditionAfter },
      { status: 201 }
    );
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'Item ini sudah dicatat dikembalikan sebelumnya.' },
        { status: 409 }
      );
    }
    console.error('Return error:', err);
    return NextResponse.json({ error: 'Gagal mencatat pengembalian.' }, { status: 500 });
  }
}
