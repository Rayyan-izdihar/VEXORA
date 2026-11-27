import { NextResponse } from 'next/server';
import { withTransaction } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;

  try {
    const body = await request.json();
    const status = body.status;
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Status pemeliharaan tidak valid.' }, { status: 400 });
    }

    const updated = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT * FROM maintenance_schedules WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const current = rows[0];
      if (!current) return null;

      const completedAt = status === 'completed' ? new Date().toISOString() : current.completed_at;
      const { rows: updatedRows } = await client.query(
        `UPDATE maintenance_schedules
         SET status = $1,
             notes = COALESCE($2, notes),
             completed_at = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, notes, completedAt, id]
      );

      if (status === 'in_progress') {
        await client.query(
          `UPDATE assets SET status = 'maintenance', updated_at = NOW()
           WHERE id = $1 AND status = 'available'`,
          [current.asset_id]
        );
      } else if (status === 'completed' || status === 'cancelled') {
        await client.query(
          `UPDATE assets SET status = 'available', updated_at = NOW()
           WHERE id = $1 AND status = 'maintenance'`,
          [current.asset_id]
        );
      }

      return updatedRows[0];
    });

    if (!updated) {
      return NextResponse.json({ error: 'Jadwal tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ schedule: updated });
  } catch (err) {
    console.error('Update maintenance error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui jadwal.' }, { status: 500 });
  }
}
