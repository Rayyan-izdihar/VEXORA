import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const assetId = body.asset_id;
    const title = String(body.title || '').trim();
    const description = body.description ? String(body.description).trim() : null;
    const scheduledAt = body.scheduled_at;
    const assignedTo = body.assigned_to || auth.user.id;
    const reminderDays = Number(body.reminder_days ?? 1);

    if (!assetId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Aset, judul pekerjaan, dan waktu jadwal wajib diisi.' },
        { status: 400 }
      );
    }

    const schedule = await withTransaction(async (client) => {
      const { rows: assetRows } = await client.query(
        `SELECT asset_code, name FROM assets WHERE id = $1`,
        [assetId]
      );
      if (assetRows.length === 0) {
        throw new Error('ASSET_NOT_FOUND');
      }
      const asset = assetRows[0];

      const { rows } = await client.query(
        `INSERT INTO maintenance_schedules (asset_id, title, description, scheduled_at, status, assigned_to, reminder_days)
         VALUES ($1, $2, $3, $4, 'scheduled', $5, $6)
         RETURNING *`,
        [assetId, title, description, scheduledAt, assignedTo, reminderDays]
      );
      const created = rows[0];

      const scheduledDate = new Date(scheduledAt);
      const reminderDate = new Date(scheduledDate.getTime() - reminderDays * 86400000);

      await client.query(
        `INSERT INTO notifications (user_id, maintenance_schedule_id, title, message, scheduled_for, sent_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [
          assignedTo,
          created.id,
          `Jadwal pemeliharaan: ${title}`,
          `${asset.asset_code} (${asset.name}) dijadwalkan pada ${scheduledDate.toLocaleDateString('id-ID')}.`,
          reminderDate.toISOString(),
        ]
      );

      return created;
    });

    return NextResponse.json({ schedule }, { status: 201 });
  } catch (err) {
    if (err.message === 'ASSET_NOT_FOUND') {
      return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
    }
    console.error('Create maintenance error:', err);
    return NextResponse.json({ error: 'Gagal membuat jadwal pemeliharaan.' }, { status: 500 });
  }
}
