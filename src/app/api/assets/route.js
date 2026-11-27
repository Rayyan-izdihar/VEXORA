import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function GET(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status') || '';

  const where = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(a.asset_code ILIKE $${params.length} OR a.name ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    where.push(`a.status = $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const { rows } = await query(
    `SELECT a.*, c.name AS category_name, l.name AS location_name
     FROM assets a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN locations l ON l.id = a.location_id
     ${whereSql}
     ORDER BY a.created_at DESC
     LIMIT 100`,
    params
  );

  return NextResponse.json({ assets: rows });
}

export async function POST(request) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const assetCode = String(body.asset_code || '').trim().toUpperCase();
    const name = String(body.name || '').trim();
    const categoryId = body.category_id;
    const locationId = body.location_id || null;
    const condition = body.condition || 'good';
    const status = body.status || 'available';
    const acquisitionDate = body.acquisition_date || null;
    const description = body.description ? String(body.description).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!assetCode) {
      return NextResponse.json({ error: 'Isi kode aset terlebih dahulu.' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'Isi nama aset terlebih dahulu.' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Pilih kategori aset.' }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO assets (asset_code, name, description, category_id, location_id, condition, status, acquisition_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [assetCode, name, description, categoryId, locationId, condition, status, acquisitionDate, notes]
    );

    return NextResponse.json({ asset: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'Kode aset tersebut sudah dipakai aset lain.' },
        { status: 409 }
      );
    }
    console.error('Create asset error:', err);
    return NextResponse.json(
      { error: 'Perubahan belum tersimpan. Periksa input lalu coba lagi.' },
      { status: 500 }
    );
  }
}
