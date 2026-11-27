import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Isi email dan kata sandi terlebih dahulu.' },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `SELECT id, name, email, password_hash, role, is_active
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak cocok. Periksa lagi, lalu coba masuk kembali.' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Akun ini dinonaktifkan. Hubungi administrator.' },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak cocok. Periksa lagi, lalu coba masuk kembali.' },
        { status: 401 }
      );
    }

    await setSessionCookie(user);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Gagal memproses login. Periksa koneksi basis data atau coba lagi.' },
      { status: 500 }
    );
  }
}
