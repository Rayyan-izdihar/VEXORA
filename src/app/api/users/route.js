import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser, hashPassword } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireApiUser(['administrator']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role || 'peminjam';

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi (minimal 6 karakter) wajib diisi.' },
        { status: 400 }
      );
    }
    if (!['administrator', 'laboran', 'peminjam'].includes(role)) {
      return NextResponse.json({ error: 'Peran tidak valid.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, $4, TRUE)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, passwordHash, role]
    );

    return NextResponse.json({ user: rows[0] }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Email tersebut sudah terdaftar.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal membuat pengguna.' }, { status: 500 });
  }
}
