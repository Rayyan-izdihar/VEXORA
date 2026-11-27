import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const description = body.description ? String(body.description).trim() : null;
    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }
    const { rows } = await query(
      `UPDATE categories SET name = $1, description = $2, updated_at = NOW() WHERE id = $3 RETURNING *`,
      [name, description, id]
    );
    if (rows.length === 0) return NextResponse.json({ error: 'Kategori tidak ditemukan.' }, { status: 404 });
    return NextResponse.json({ category: rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Nama kategori sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui kategori.' }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  try {
    const { rows: used } = await query(
      `SELECT COUNT(*)::int AS cnt FROM assets WHERE category_id = $1`,
      [id]
    );
    if ((used[0]?.cnt ?? 0) > 0) {
      return NextResponse.json(
        {
          error: `Kategori ini masih dipakai ${used[0].cnt} aset. Pindahkan asetnya dulu sebelum menghapus.`,
        },
        { status: 409 }
      );
    }
    await query(`DELETE FROM categories WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.code === '23503') {
      return NextResponse.json(
        { error: 'Kategori masih dipakai aset dan tidak dapat dihapus.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Gagal menghapus kategori.' }, { status: 500 });
  }
}
