import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { MaintenanceClient } from '@/components/app/MaintenanceClient';

export const dynamic = 'force-dynamic';

export default async function PemeliharaanPage({ searchParams }) {
  await requireUser(['administrator', 'laboran']);
  const sp = await searchParams;
  const preselectedAssetId = sp?.asset || '';

  const [schedRes, assetsRes, staffRes] = await Promise.all([
    query(`
      SELECT m.*, a.asset_code, a.name AS asset_name, u.name AS assigned_name
      FROM maintenance_schedules m
      JOIN assets a ON a.id = m.asset_id
      LEFT JOIN users u ON u.id = m.assigned_to
      ORDER BY m.scheduled_at ASC
    `),
    query(`SELECT id, asset_code, name FROM assets WHERE status != 'inactive' ORDER BY asset_code ASC`),
    query(`SELECT id, name FROM users WHERE role IN ('administrator', 'laboran') AND is_active = TRUE ORDER BY name ASC`),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Pemeliharaan</h1>
        <p className="text-sm text-ink-600">
          Kelola jadwal perawatan berkala aset laboratorium dan pengingat otomatis
        </p>
      </div>
      <MaintenanceClient
        schedules={schedRes.rows}
        assets={assetsRes.rows}
        staffUsers={staffRes.rows}
        preselectedAssetId={preselectedAssetId}
      />
    </div>
  );
}
