import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { query, isValidUuid } from '@/lib/db';
import { AssetForm } from '@/components/app/AssetForm';

export const dynamic = 'force-dynamic';

export default async function UbahAsetPage({ params }) {
  await requireUser(['administrator', 'laboran']);
  const { id } = await params;
  if (!isValidUuid(id)) notFound();

  const [assetRes, catRes, locRes] = await Promise.all([
    query(
      `SELECT *, TO_CHAR(acquisition_date, 'YYYY-MM-DD') AS acquisition_date_ymd
       FROM assets
       WHERE id = $1
       LIMIT 1`,
      [id]
    ),
    query(`SELECT id, name FROM categories ORDER BY name ASC`),
    query(`SELECT id, name FROM locations ORDER BY name ASC`),
  ]);

  const asset = assetRes.rows[0];
  if (!asset) notFound();

  const initialAsset = {
    ...asset,
    acquisition_date: asset.acquisition_date_ymd || null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
          Ubah aset {asset.asset_code}
        </h1>
        <p className="text-sm text-ink-600">Perbarui data, lokasi, atau kondisi aset</p>
      </div>
      <AssetForm initialData={initialAsset} categories={catRes.rows} locations={locRes.rows} />
    </div>
  );
}
