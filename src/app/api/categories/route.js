import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await query(`
    SELECT c.*, COUNT(a.id)::int AS asset_count
    FROM categories c
    LEFT JOIN assets a ON a.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  return NextResponse.json({ categories: rows });
}

export async function POST(request) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const description = body.description ? String(body.description).trim() : null;
    if (!name) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi.' }, { status: 400 });
    }
    const { rows } = await query(
      `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    return NextResponse.json({ category: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Nama kategori sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menyimpan kategori.' }, { status: 500 });
  }
}
