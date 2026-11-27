import { NextResponse } from 'next/server';
import { query, withTransaction, isValidUuid } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

const VALID_CONDITIONS = ['good', 'needs_attention', 'damaged'];
const VALID_STATUSES = ['available', 'borrowed', 'maintenance', 'inactive'];

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const assetCode = String(body.asset_code || '').trim().toUpperCase();
    const name = String(body.name || '').trim();
    const categoryId = body.category_id;
    const locationId = body.location_id || null;
    const condition = body.condition;
    const status = body.status;
    const acquisitionDate = body.acquisition_date || null;
    const description = body.description ? String(body.description).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!assetCode || !name || !categoryId) {
      return NextResponse.json(
        { error: 'Kode aset, nama aset, dan kategori wajib diisi.' },
        { status: 400 }
      );
    }
    if (!isValidUuid(categoryId)) {
      return NextResponse.json({ error: 'Kategori tidak valid.' }, { status: 400 });
    }
    if (locationId !== null && !isValidUuid(locationId)) {
      return NextResponse.json({ error: 'Lokasi tidak valid.' }, { status: 400 });
    }
    if (!VALID_CONDITIONS.includes(condition)) {
      return NextResponse.json({ error: 'Kondisi aset tidak valid.' }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status operasional aset tidak valid.' }, { status: 400 });
    }

    const result = await withTransaction(async (client) => {
      const { rows: currentRows } = await client.query(
        `SELECT id, status FROM assets WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const current = currentRows[0];
      if (!current) {
        return { error: 'Aset tidak ditemukan.', status: 404 };
      }

        const { rows: activeLoanRows } = await client.query(
          `SELECT 1 FROM loan_items WHERE asset_id = $1 AND item_status = 'borrowed' LIMIT 1`,
          [id]
        );
        const hasActiveLoan = activeLoanRows.length > 0;

        if ((current.status === 'borrowed' || hasActiveLoan) && status !== 'borrowed') {
          return {
            error: 'Status aset sedang dipinjam dan tidak dapat diubah manual. Catat pengembalian terlebih dahulu.',
            status: 409,
          };
        }
        if (status === 'borrowed' && current.status !== 'borrowed') {
          return {
            error: 'Status Dipinjam dikelola otomatis oleh transaksi peminjaman.',
            status: 400,
          };
        }

        const { rows } = await client.query(
          `UPDATE assets
         SET asset_code = $1,
             name = $2,
             description = $3,
             category_id = $4,
             location_id = $5,
             condition = $6,
             status = $7,
             acquisition_date = $8,
             notes = $9,
             updated_at = NOW()
         WHERE id = $10
         RETURNING *`,
          [assetCode, name, description, categoryId, locationId, condition, status, acquisitionDate, notes, id]
        );

        return { asset: rows[0], status: 200 };
      });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ asset: result.asset });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'Kode aset tersebut sudah dipakai aset lain.' },
        { status: 409 }
      );
    }
    if (err.code === '23503') {
      return NextResponse.json(
        { error: 'Kategori atau lokasi tidak ditemukan.' },
        { status: 400 }
      );
    }
    if (err.code === '22P02') {
      return NextResponse.json({ error: 'Format data tidak valid.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui aset.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
  }

  try {
    const { rowCount } = await query(`DELETE FROM assets WHERE id = $1`, [id]);
    if (rowCount === 0) {
      return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === '23503') {
      return NextResponse.json(
        { error: 'Aset tidak bisa dihapus karena sudah memiliki riwayat transaksi atau pemeliharaan. Ubah status ke Nonaktif.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Gagal menghapus aset.' }, { status: 500 });
  }
}
