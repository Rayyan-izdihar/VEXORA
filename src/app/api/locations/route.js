import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function GET() {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { rows } = await query(`
    SELECT l.*, COUNT(a.id)::int AS asset_count
    FROM locations l
    LEFT JOIN assets a ON a.location_id = l.id
    GROUP BY l.id
    ORDER BY l.name ASC
  `);
  return NextResponse.json({ locations: rows });
}

export async function POST(request) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const description = body.description ? String(body.description).trim() : null;
    if (!name) {
      return NextResponse.json({ error: 'Nama lokasi wajib diisi.' }, { status: 400 });
    }
    const { rows } = await query(
      `INSERT INTO locations (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );
    return NextResponse.json({ location: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Nama lokasi sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal menyimpan lokasi.' }, { status: 500 });
  }
}
