import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { DamageClient } from '@/components/app/DamageClient';

export const dynamic = 'force-dynamic';

export default async function KerusakanPage({ searchParams }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const sp = await searchParams;
  const preselectedAssetId = sp?.asset || '';

  const [reportsRes, assetsRes] = await Promise.all([
    query(
      `SELECT d.*, a.asset_code, a.name AS asset_name, u.name AS reporter_name
       FROM damage_reports d
       JOIN assets a ON a.id = d.asset_id
       LEFT JOIN users u ON u.id = d.reported_by
       ${isStaff ? '' : 'WHERE d.reported_by = $1'}
       ORDER BY d.reported_at DESC`,
      isStaff ? [] : [user.id]
    ),
    query(`SELECT id, asset_code, name FROM assets ORDER BY asset_code ASC`),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
          Laporan kerusakan
        </h1>
        <p className="text-sm text-ink-600">
          Catat kerusakan peralatan dan pantau status penanganannya
        </p>
      </div>
      <DamageClient
        reports={reportsRes.rows}
        assets={assetsRes.rows}
        isStaff={isStaff}
        preselectedAssetId={preselectedAssetId}
      />
    </div>
  );
}
