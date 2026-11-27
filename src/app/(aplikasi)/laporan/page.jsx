import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ReportClient } from '@/components/app/ReportClient';

export const dynamic = 'force-dynamic';

export default async function LaporanPage() {
  await requireUser(['administrator', 'laboran']);

  const [assetsRes, maintRes, damageRes, loansRes, categoriesRes] = await Promise.all([
    query(`
      SELECT a.id, a.asset_code, a.name, a.condition, a.status, a.created_at,
             TO_CHAR(a.acquisition_date, 'YYYY-MM-DD') AS acquisition_date,
             c.name AS category_name, l.name AS location_name
      FROM assets a
      JOIN categories c ON c.id = a.category_id
      LEFT JOIN locations l ON l.id = a.location_id
      ORDER BY a.asset_code ASC
    `),
    query(`
      SELECT m.*, a.asset_code, a.name AS asset_name, c.name AS category_name
      FROM maintenance_schedules m
      JOIN assets a ON a.id = m.asset_id
      JOIN categories c ON c.id = a.category_id
      ORDER BY m.scheduled_at DESC
    `),
    query(`
      SELECT d.*, a.asset_code, a.name AS asset_name, c.name AS category_name, u.name AS reporter_name
      FROM damage_reports d
      JOIN assets a ON a.id = d.asset_id
      JOIN categories c ON c.id = a.category_id
      LEFT JOIN users u ON u.id = d.reported_by
      ORDER BY d.reported_at DESC
    `),
    query(`
      SELECT l.id, l.loan_code, l.status,
             TO_CHAR(l.loan_date, 'YYYY-MM-DD') AS loan_date,
             TO_CHAR(l.expected_return_date, 'YYYY-MM-DD') AS expected_return_date,
             u.name AS borrower_name
      FROM loans l
      JOIN users u ON u.id = l.borrower_id
      ORDER BY l.created_at DESC
    `),
    query(`SELECT id, name FROM categories ORDER BY name ASC`),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Laporan aset</h1>
        <p className="text-sm text-ink-600">
          Laporan operasional inventaris, pemeliharaan, kerusakan, dan peminjaman
        </p>
      </div>
      <ReportClient
        assets={assetsRes.rows}
        maintenance={maintRes.rows}
        damages={damageRes.rows}
        loans={loansRes.rows}
        categories={categoriesRes.rows}
      />
    </div>
  );
}
