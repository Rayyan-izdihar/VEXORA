import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/auth';

const FILENAME_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

const MIME_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(_request, { params }) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { filename } = await params;
  if (!filename || !FILENAME_REGEX.test(filename)) {
    return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const contentType = MIME_MAP[ext] || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    if (err?.code === 'ENOENT') {
      return NextResponse.json({ error: 'File tidak ditemukan.' }, { status: 404 });
    }
    console.error('Read upload error:', err);
    return NextResponse.json({ error: 'Gagal memuat gambar.' }, { status: 500 });
  }
}
