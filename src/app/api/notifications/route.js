import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  if (body.mark_all) {
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [auth.user.id]
    );
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await query(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [body.id, auth.user.id]
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Parameter tidak valid.' }, { status: 400 });
}
