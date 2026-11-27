import { NextResponse } from 'next/server';
import { query, isValidUuid } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const assetId = body.asset_id;
    const description = String(body.description || '').trim();

      if (!assetId || !isValidUuid(assetId)) {
        return NextResponse.json({ error: 'Pilih aset yang mengalami kerusakan.' }, { status: 400 });
      }
      if (description.length < 10) {
        return NextResponse.json(
          { error: 'Deskripsi kerusakan minimal 10 karakter.' },
          { status: 400 }
        );
      }

      const { rows } = await query(
        `INSERT INTO damage_reports (asset_id, reported_by, description, status)
       VALUES ($1, $2, $3, 'reported')
       RETURNING *`,
        [assetId, auth.user.id, description]
      );

      return NextResponse.json({ report: rows[0] }, { status: 201 });
    } catch (err) {
      if (err.code === '23503') {
        return NextResponse.json({ error: 'Aset tidak ditemukan.' }, { status: 404 });
      }
      console.error('Create damage report error:', err);
      return NextResponse.json({ error: 'Gagal mengirim laporan kerusakan.' }, { status: 500 });
    }
  }
