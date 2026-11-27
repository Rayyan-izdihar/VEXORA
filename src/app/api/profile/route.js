import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  requireApiUser,
  verifyPassword,
  hashPassword,
  setSessionCookie,
} from '@/lib/auth';

export async function PATCH(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const currentPassword = String(body?.current_password || '');
    const newPassword = String(body?.new_password || '');

    if (!name) {
      return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
    }

    let passwordHash = null;
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Kata sandi baru minimal 6 karakter.' },
          { status: 400 }
        );
      }
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Masukkan kata sandi saat ini untuk mengubah kata sandi.' },
          { status: 400 }
        );
      }

      const { rows: userRows } = await query(
        `SELECT password_hash FROM users WHERE id = $1 LIMIT 1`,
        [auth.user.id]
      );
      const valid = userRows[0] && (await verifyPassword(currentPassword, userRows[0].password_hash));
      if (!valid) {
        return NextResponse.json(
          { error: 'Kata sandi saat ini tidak cocok.' },
          { status: 400 }
        );
      }
      passwordHash = await hashPassword(newPassword);
    }

    const { rows } = passwordHash
      ? await query(
          `UPDATE users SET name = $1, password_hash = $2 WHERE id = $3
           RETURNING id, name, email, role`,
          [name, passwordHash, auth.user.id]
        )
      : await query(
          `UPDATE users SET name = $1 WHERE id = $2
           RETURNING id, name, email, role`,
          [name, auth.user.id]
        );

    const updatedUser = rows[0];
    await setSessionCookie(updatedUser);

    return NextResponse.json({ user: updatedUser });
  } catch (err) {
    console.error('Profile update error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
