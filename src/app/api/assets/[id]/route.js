import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

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

    const { rows } = await query(
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

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ asset: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'Kode aset tersebut sudah dipakai aset lain.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Gagal memperbarui aset.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

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
