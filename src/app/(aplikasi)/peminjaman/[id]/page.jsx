import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate, daysOverdue } from '@/lib/format';
import { LOAN_STATUSES, LOAN_ITEM_STATUSES } from '@/lib/status';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoanActions } from '@/components/app/LoanActions';

export const dynamic = 'force-dynamic';

export default async function PeminjamanDetailPage({ params }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const { id } = await params;

  const { rows: loanRows } = await query(
    `SELECT l.*, u.name AS borrower_name, u.email AS borrower_email
     FROM loans l
     JOIN users u ON u.id = l.borrower_id
     WHERE l.id = $1
     LIMIT 1`,
    [id]
  );

  const loan = loanRows[0];
  if (!loan) notFound();
  if (!isStaff && loan.borrower_id !== user.id) {
    notFound();
  }

  const { rows: items } = await query(
    `SELECT li.*, a.asset_code, a.name AS asset_name,
            rr.return_date, rr.condition_after
     FROM loan_items li
     JOIN assets a ON a.id = li.asset_id
     LEFT JOIN return_records rr ON rr.loan_item_id = li.id
     WHERE li.loan_id = $1
     ORDER BY a.asset_code ASC`,
    [id]
  );

  const late = loan.status === 'borrowed' ? daysOverdue(loan.expected_return_date) : 0;
  const displayStatus = late > 0 ? 'overdue' : loan.status;

  const steps = [
    { key: 'pending', label: 'Diajukan' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'borrowed', label: 'Dipinjam' },
    { key: 'completed', label: 'Dikembalikan' },
  ];
  const currentStepIdx = steps.findIndex((s) => s.key === (loan.status === 'overdue' ? 'borrowed' : loan.status));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/peminjaman"
            className="w-10 h-10 rounded-full border border-line-200 bg-white flex items-center justify-center text-ink-900 hover:bg-cream-100"
            aria-label="Kembali ke peminjaman"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[28px] font-semibold tracking-tight text-ink-900 tabular-nums">
                {loan.loan_code}
              </h1>
              <Badge map={LOAN_STATUSES} value={displayStatus} />
            </div>
            <p className="text-sm text-ink-600">
              Peminjam: {loan.borrower_name} ({loan.borrower_email})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <LoanActions
            loanId={loan.id}
            status={loan.status}
            isStaff={isStaff}
            isOwner={loan.borrower_id === user.id}
          />
          {isStaff && ['borrowed', 'overdue'].includes(loan.status) && (
            <Link href="/pengembalian">
              <Button variant="primary">Catat pengembalian</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stepper */}
      {!['rejected', 'cancelled'].includes(loan.status) && (
        <Card className="py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {steps.map((s, idx) => {
              const done = idx <= currentStepIdx;
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      done ? 'bg-lime-400 text-ink-900' : 'bg-cream-100 text-ink-400'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : idx + 1}
                  </span>
                  <span className={`text-sm font-semibold ${done ? 'text-ink-900' : 'text-ink-400'}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card>
            <h2 className="text-lg font-semibold mb-4">Daftar aset dipinjam ({items.length})</h2>
            <div className="divide-y divide-line-200">
              {items.map((item) => (
                <div key={item.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/aset/${item.asset_id}`}
                      className="font-semibold text-sm text-ink-900 hover:underline"
                    >
                      <span className="tabular-nums text-ink-600 mr-2">{item.asset_code}</span>
                      {item.asset_name}
                    </Link>
                    {item.return_date && (
                      <div className="text-xs text-ink-600 mt-0.5">
                        Dikembalikan pada {formatDate(item.return_date)}
                      </div>
                    )}
                  </div>
                  <Badge map={LOAN_ITEM_STATUSES} value={item.item_status} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card variant="cream">
            <h2 className="text-lg font-semibold mb-4">Informasi transaksi</h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-ink-600">Tanggal pinjam</dt>
                <dd className="font-semibold text-ink-900 tabular-nums">{formatDate(loan.loan_date)}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Rencana kembali</dt>
                <dd className="font-semibold text-ink-900 tabular-nums">
                  {formatDate(loan.expected_return_date)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-600">Keperluan</dt>
                <dd className="text-ink-900">{loan.purpose || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Catatan</dt>
                <dd className="text-ink-900">{loan.notes || '-'}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
