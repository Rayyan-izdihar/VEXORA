import { NextResponse } from 'next/server';
import { withTransaction, isValidUuid, isValidUploadUrl } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';
import { notifyStaff } from '@/lib/notifications';

export async function POST(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const assetId = body.asset_id;
    const description = String(body.description || '').trim();
    const imageUrl = body.image_url ? String(body.image_url).trim() : null;

    if (!assetId || !isValidUuid(assetId)) {
      return NextResponse.json({ error: 'Pilih aset yang mengalami kerusakan.' }, { status: 400 });
    }
    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Deskripsi kerusakan minimal 10 karakter.' },
        { status: 400 }
      );
    }
    if (!isValidUploadUrl(imageUrl)) {
      return NextResponse.json({ error: 'URL foto bukti kerusakan tidak valid.' }, { status: 400 });
    }

    const report = await withTransaction(async (client) => {
      const { rows: assetRows } = await client.query(
        `SELECT asset_code, name FROM assets WHERE id = $1 LIMIT 1`,
        [assetId]
      );
      const asset = assetRows[0];
      if (!asset) return null;

      const { rows } = await client.query(
        `INSERT INTO damage_reports (asset_id, reported_by, description, image_url, status)
         VALUES ($1, $2, $3, $4, 'reported')
         RETURNING *`,
        [assetId, auth.user.id, description, imageUrl]
      );
      const created = rows[0];

      await notifyStaff(client, {
        title: 'Laporan kerusakan baru',
        message: `${auth.user.name} melaporkan kerusakan pada ${asset.asset_code} (${asset.name}).`,
        linkUrl: '/kerusakan',
        damageReportId: created.id,
        excludeUserId: auth.user.id,
      });

      return created;
    });

    if (!report) {
      return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ report }, { status: 201 });
  } catch (err) {
    if (err.code === '23503') {
      return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
    }
    console.error('Create damage report error:', err);
    return NextResponse.json({ error: 'Gagal mengirim laporan kerusakan.' }, { status: 500 });
  }
}
