import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ReferensiClient } from '@/components/app/ReferensiClient';

export const dynamic = 'force-dynamic';

export default async function ReferensiPage() {
  await requireUser(['administrator', 'laboran']);

  const [catRes, locRes] = await Promise.all([
    query(`
      SELECT c.*, COUNT(a.id)::int AS asset_count
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `),
    query(`
      SELECT l.*, COUNT(a.id)::int AS asset_count
      FROM locations l
      LEFT JOIN assets a ON a.location_id = l.id
      GROUP BY l.id
      ORDER BY l.name ASC
    `),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
          Kategori &amp; Lokasi
        </h1>
        <p className="text-sm text-ink-600">
          Kelola data referensi pengelompokan dan penempatan aset laboratorium
        </p>
      </div>
      <ReferensiClient initialCategories={catRes.rows} initialLocations={locRes.rows} />
    </div>
  );
}
