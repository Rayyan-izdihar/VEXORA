import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!name || !email || password.length < 6) {
      return NextResponse.json(
        { error: 'Nama, email, dan kata sandi (minimal 6 karakter) wajib diisi.' },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Format email tidak valid.' }, { status: 400 });
    }

    const { rows: existing } = await query(
      `SELECT 1 FROM users WHERE LOWER(email) = $1 LIMIT 1`,
      [email]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email tersebut sudah terdaftar.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role, is_active)
       VALUES ($1, $2, $3, 'peminjam', TRUE)
       RETURNING id, name, email, role`,
      [name, email, passwordHash]
    );

    const user = rows[0];
    await setSessionCookie(user);

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json({ error: 'Email tersebut sudah terdaftar.' }, { status: 409 });
    }
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan akun. Periksa koneksi basis data atau coba lagi.' },
      { status: 500 }
    );
  }
}
