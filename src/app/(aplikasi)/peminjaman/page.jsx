import Link from 'next/link';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate, daysOverdue } from '@/lib/format';
import { LOAN_STATUSES } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoanFilterBar } from '@/components/app/LoanFilterBar';

export const dynamic = 'force-dynamic';

export default async function PeminjamanListPage({ searchParams }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const sp = await searchParams;
  const tab = sp?.tab || 'all';
  const q = (sp?.q || '').trim();

  const where = [];
  const params = [];

  if (!isStaff) {
    params.push(user.id);
    where.push(`l.borrower_id = $${params.length}`);
  }

  if (q) {
    params.push(`%${q}%`);
    where.push(
      `(l.loan_code ILIKE $${params.length} OR u.name ILIKE $${params.length} OR COALESCE(l.purpose, '') ILIKE $${params.length})`
    );
  }

  if (tab === 'pending') {
    where.push(`l.status IN ('pending', 'approved')`);
  } else if (tab === 'active') {
    where.push(`l.status IN ('borrowed', 'overdue')`);
  } else if (tab === 'overdue') {
    where.push(
      `l.status IN ('borrowed', 'overdue') AND l.expected_return_date < (NOW() AT TIME ZONE 'Asia/Makassar')::date`
    );
  } else if (tab === 'completed') {
    where.push(`l.status IN ('completed', 'rejected', 'cancelled')`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

  const { rows: loans } = await query(
    `SELECT l.*, u.name AS borrower_name, COUNT(li.id)::int AS item_count
     FROM loans l
     JOIN users u ON u.id = l.borrower_id
     LEFT JOIN loan_items li ON li.loan_id = l.id
     ${whereSql}
     GROUP BY l.id, u.name
     ORDER BY l.created_at DESC
     LIMIT 100`,
    params
  );

  const tabs = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Menunggu' },
    { key: 'active', label: 'Berjalan' },
    { key: 'overdue', label: 'Terlambat' },
    { key: 'completed', label: 'Selesai' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Peminjaman</h1>
          <p className="text-sm text-ink-600">
            {isStaff
              ? 'Kelola pengajuan dan transaksi peminjaman peralatan laboratorium'
              : 'Daftar pengajuan dan riwayat peminjaman Anda'}
          </p>
        </div>
        <Link href="/peminjaman/baru">
          <Button variant="primary">
            <Plus className="w-4 h-4" />
            {isStaff ? 'Catat peminjaman' : 'Ajukan peminjaman'}
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const qs = new URLSearchParams();
            if (t.key !== 'all') qs.set('tab', t.key);
            if (q) qs.set('q', q);
            const href = qs.toString() ? `/peminjaman?${qs.toString()}` : '/peminjaman';
            return (
              <Link
                key={t.key}
                href={href}
                className={`h-9 px-4 rounded-full text-sm font-semibold inline-flex items-center transition-colors ${
                  tab === t.key
                    ? 'bg-ink-900 text-white'
                    : 'bg-white border border-line-200 text-ink-700 hover:bg-cream-100'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <LoanFilterBar initialQ={q} tab={tab} />
      </div>

      {loans.length === 0 ? (
        q ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="Transaksi peminjaman tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau tampilkan semua peminjaman."
            actionLabel="Reset pencarian"
            actionHref={tab === 'all' ? '/peminjaman' : `/peminjaman?tab=${tab}`}
          />
        ) : (
          <EmptyState
            icon={ArrowLeftRight}
            title="Belum ada transaksi peminjaman"
            description="Mulai dengan mengajukan atau mencatat peminjaman peralatan laboratorium."
            actionLabel={isStaff ? 'Catat peminjaman' : 'Ajukan peminjaman'}
            actionHref="/peminjaman/baru"
          />
        )
      ) : (
        <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Kode pinjam</th>
                  <th className="py-3.5 px-4">Peminjam</th>
                  <th className="py-3.5 px-4 text-right">Jumlah aset</th>
                  <th className="py-3.5 px-4">Tanggal pinjam</th>
                  <th className="py-3.5 px-4">Rencana kembali</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {loans.map((l) => {
                  const late = ['borrowed', 'overdue'].includes(l.status)
                    ? daysOverdue(l.expected_return_date)
                    : 0;
                  const displayStatus = late > 0 ? 'overdue' : l.status;
                  return (
                    <tr
                      key={l.id}
                      className={`h-14 hover:bg-cream-50 ${late > 0 ? 'bg-status-danger-bg/30' : ''}`}
                    >
                      <td className="px-5 font-semibold tabular-nums text-ink-900">
                        <Link href={`/peminjaman/${l.id}`} className="hover:underline">
                          {l.loan_code}
                        </Link>
                      </td>
                      <td className="px-4 text-ink-700">{l.borrower_name}</td>
                      <td className="px-4 text-right tabular-nums font-medium">{l.item_count}</td>
                      <td className="px-4 text-ink-600 tabular-nums">{formatDate(l.loan_date)}</td>
                      <td className="px-4 tabular-nums">
                        <span className={late > 0 ? 'text-status-danger-fg font-semibold' : 'text-ink-600'}>
                          {formatDate(l.expected_return_date)}
                        </span>
                        {late > 0 && (
                          <span className="block text-xs text-status-danger-fg font-semibold">
                            Terlambat {late} hari
                          </span>
                        )}
                      </td>
                      <td className="px-5">
                        <Badge map={LOAN_STATUSES} value={displayStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
