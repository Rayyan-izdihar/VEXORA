import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from './db';

const COOKIE_NAME = 'limms_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

function getSecret() {
  return process.env.AUTH_SECRET || 'limms-dev-secret-change-in-production-2026';
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function sign(dataB64) {
  return crypto
    .createHmac('sha256', getSecret())
    .update(dataB64)
    .digest('base64url');
}

export function createSessionToken(user) {
  const payload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const dataB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = sign(dataB64);
  return `${dataB64}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [dataB64, sig] = parts;
  const expectedSig = sign(dataB64);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf8'));
    if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user) {
  const token = createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    secure: process.env.NODE_ENV === 'production',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Mengambil user aktif dari cookie sesi (tanpa password_hash).
 * Mengembalikan null bila tidak ada sesi atau akun dinonaktifkan.
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = verifySessionToken(token);
    if (!payload) return null;

    const { rows } = await query(
      `SELECT id, name, email, role, is_active, created_at
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [payload.sub]
    );
    const user = rows[0];
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

/**
 * Guard untuk Server Component halaman aplikasi.
 */
export async function requireUser(allowedRoles = null) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/masuk');
  }
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    redirect('/dashboard?error=forbidden');
  }
  return user;
}

/**
 * Guard untuk API Route Handler.
 */
export async function requireApiUser(allowedRoles = null) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: 'Sesi tidak valid. Silakan masuk kembali.', status: 401 };
  }
  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user.role)) {
    return { error: 'Anda tidak punya akses untuk tindakan ini.', status: 403 };
  }
  return { user };
}
