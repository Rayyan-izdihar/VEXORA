import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    const body = await request.json();
    const updates = [];
    const values = [];

    if (body.role !== undefined) {
      if (!['administrator', 'laboran', 'peminjam'].includes(body.role)) {
        return NextResponse.json({ error: 'Peran tidak valid.' }, { status: 400 });
      }
      values.push(body.role);
      updates.push(`role = $${values.length}`);
    }

    if (body.is_active !== undefined) {
      if (id === auth.user.id && body.is_active === false) {
        return NextResponse.json(
          { error: 'Anda tidak dapat menonaktifkan akun Anda sendiri.' },
          { status: 400 }
        );
      }
      values.push(Boolean(body.is_active));
      updates.push(`is_active = $${values.length}`);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Tidak ada perubahan.' }, { status: 400 });
    }

    values.push(id);
    const { rows } = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, name, email, role, is_active, created_at`,
      values
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch {
    return NextResponse.json({ error: 'Gagal memperbarui pengguna.' }, { status: 500 });
  }
}
