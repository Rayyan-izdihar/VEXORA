import { NextResponse } from 'next/server';
import { withTransaction, isValidUuid } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function PATCH(request, { params }) {
  const auth = await requireApiUser(['administrator', 'laboran']);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  if (!isValidUuid(id)) {
    return NextResponse.json({ error: 'Jadwal tidak ditemukan.' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const status = body.status;
    const hasNotes = body.notes !== undefined;
    const notes = hasNotes ? (String(body.notes || '').trim() || null) : undefined;

    if (!['scheduled', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Status pemeliharaan tidak valid.' }, { status: 400 });
    }

      const result = await withTransaction(async (client) => {
        const { rows } = await client.query(
          `SELECT * FROM maintenance_schedules WHERE id = $1 FOR UPDATE`,
          [id]
        );
        const current = rows[0];
        if (!current) return { error: 'Jadwal tidak ditemukan.', status: 404 };

        if (status === 'in_progress') {
          const { rows: assetRows } = await client.query(
            `SELECT status FROM assets WHERE id = $1 FOR UPDATE`,
            [current.asset_id]
          );
          if (assetRows[0]?.status === 'borrowed') {
            return {
              error: 'Aset sedang dipinjam dan belum dikembalikan. Pemeliharaan belum dapat dimulai.',
              status: 409,
            };
          }
          await client.query(
            `UPDATE assets SET status = 'maintenance', updated_at = NOW()
           WHERE id = $1 AND status = 'available'`,
            [current.asset_id]
          );
        }

        const completedAt =
          status === 'completed' ? (current.completed_at || new Date().toISOString()) : null;
        const nextNotes = hasNotes ? notes : current.notes;

        const { rows: updatedRows } = await client.query(
          `UPDATE maintenance_schedules
         SET status = $1,
             notes = $2,
             completed_at = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
          [status, nextNotes, completedAt, id]
        );

          if (status === 'completed' || status === 'cancelled') {
            await client.query(
              `UPDATE assets SET status = 'available', updated_at = NOW()
           WHERE id = $1
             AND status = 'maintenance'
             AND NOT EXISTS(
                SELECT 1 FROM maintenance_schedules
               WHERE asset_id = $1 AND id != $2 AND status = 'in_progress'
              )`,
          [current.asset_id, id]
        );
      }

      return { schedule: updatedRows[0], status: 200 };
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ schedule: result.schedule });
  } catch (err) {
    console.error('Update maintenance error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui jadwal.' }, { status: 500 });
  }
}
