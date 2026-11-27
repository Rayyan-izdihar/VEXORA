import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { AssetForm } from '@/components/app/AssetForm';

export const dynamic = 'force-dynamic';

export default async function AsetBaruPage() {
  await requireUser(['administrator', 'laboran']);

  const [catRes, locRes] = await Promise.all([
    query(`SELECT id, name FROM categories ORDER BY name ASC`),
    query(`SELECT id, name FROM locations ORDER BY name ASC`),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Daftarkan aset baru</h1>
        <p className="text-sm text-ink-600">Tambahkan peralatan laboratorium ke daftar inventaris</p>
      </div>
      <AssetForm categories={catRes.rows} locations={locRes.rows} />
    </div>
  );
}
