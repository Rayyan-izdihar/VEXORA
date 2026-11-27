import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { LoanForm } from '@/components/app/LoanForm';

export const dynamic = 'force-dynamic';

export default async function PeminjamanBaruPage({ searchParams }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const sp = await searchParams;
  const preselectedAssetId = sp?.asset || '';

  const [assetsRes, borrowersRes, bookingsRes] = await Promise.all([
    query(`
      SELECT a.id, a.asset_code, a.name, a.status, c.name AS category_name
      FROM assets a
      JOIN categories c ON c.id = a.category_id
      WHERE a.status != 'inactive'
      ORDER BY (a.status = 'available') DESC, a.asset_code ASC
    `),
    isStaff
      ? query(`SELECT id, name, email FROM users WHERE is_active = TRUE ORDER BY name ASC`)
      : Promise.resolve({ rows: [] }),
    query(`
      SELECT li.asset_id, l.loan_code, l.status,
             TO_CHAR(l.loan_date, 'YYYY-MM-DD') AS loan_date,
             TO_CHAR(l.expected_return_date, 'YYYY-MM-DD') AS expected_return_date
      FROM loan_items li
      JOIN loans l ON l.id = li.loan_id
      WHERE l.status IN ('pending', 'approved', 'borrowed', 'overdue')
        AND li.item_status IN ('requested', 'approved', 'borrowed')
    `),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
          {isStaff ? 'Catat peminjaman' : 'Ajukan peminjaman'}
        </h1>
        <p className="text-sm text-ink-600">
          Tentukan tanggal pinjam lalu pilih aset yang tersedia pada rentang jadwal tersebut
        </p>
      </div>
      <LoanForm
        assets={assetsRes.rows}
        borrowers={borrowersRes.rows}
        activeBookings={bookingsRes.rows}
        isStaff={isStaff}
        currentUserId={user.id}
        preselectedAssetId={preselectedAssetId}
      />
    </div>
  );
}
