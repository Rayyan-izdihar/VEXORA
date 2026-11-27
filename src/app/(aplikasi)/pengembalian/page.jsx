import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ReturnClient } from '@/components/app/ReturnClient';

export const dynamic = 'force-dynamic';

export default async function PengembalianPage() {
  await requireUser(['administrator', 'laboran']);

  const [pendingRes, historyRes] = await Promise.all([
    query(`
      SELECT li.id, l.loan_code, l.expected_return_date,
             a.asset_code, a.name AS asset_name,
             u.name AS borrower_name
      FROM loan_items li
      JOIN loans l ON l.id = li.loan_id
      JOIN assets a ON a.id = li.asset_id
      JOIN users u ON u.id = l.borrower_id
      WHERE li.item_status = 'borrowed'
      ORDER BY l.expected_return_date ASC
    `),
    query(`
      SELECT rr.id, rr.return_date, rr.condition_after,
             a.asset_code, a.name AS asset_name,
             ub.name AS borrower_name,
             ur.name AS receiver_name
      FROM return_records rr
      JOIN loan_items li ON li.id = rr.loan_item_id
      JOIN loans l ON l.id = li.loan_id
      JOIN assets a ON a.id = li.asset_id
      JOIN users ub ON ub.id = l.borrower_id
      LEFT JOIN users ur ON ur.id = rr.received_by
      ORDER BY rr.return_date DESC
      LIMIT 50
    `),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Pengembalian</h1>
        <p className="text-sm text-ink-600">
          Catat pengembalian per item dan perbarui kondisi aset secara otomatis
        </p>
      </div>
      <ReturnClient pendingItems={pendingRes.rows} historyRecords={historyRes.rows} />
    </div>
  );
}
