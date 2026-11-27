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
    const resolutionNotes = body.resolution_notes ? String(body.resolution_notes).trim() : null;
    const assetCondition = body.asset_condition || null;

    if (!['reported', 'reviewed', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Status laporan tidak valid.' }, { status: 400 });
    }

    const updated = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `SELECT * FROM damage_reports WHERE id = $1 FOR UPDATE`,
        [id]
      );
      const current = rows[0];
      if (!current) return null;

      const resolvedAt = status === 'resolved' ? new Date().toISOString() : current.resolved_at;
      const { rows: updatedRows } = await client.query(
        `UPDATE damage_reports
         SET status = $1,
             resolution_notes = COALESCE($2, resolution_notes),
             resolved_at = $3,
             updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [status, resolutionNotes, resolvedAt, id]
      );

      if (assetCondition && ['good', 'needs_attention', 'damaged'].includes(assetCondition)) {
        await client.query(
          `UPDATE assets SET condition = $1, updated_at = NOW() WHERE id = $2`,
          [assetCondition, current.asset_id]
        );
      }

      return updatedRows[0];
    });

    if (!updated) {
      return NextResponse.json({ error: 'Laporan tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ report: updated });
  } catch (err) {
    console.error('Update damage report error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui laporan.' }, { status: 500 });
  }
}
