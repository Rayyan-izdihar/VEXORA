import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate, daysOverdue } from '@/lib/format';
import { ASSET_CONDITIONS, LOAN_STATUSES } from '@/lib/status';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowPill } from '@/components/ui/ArrowPill';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

  export default async function DashboardPage({ searchParams }) {
    const user = await requireUser();
    const isStaff = user.role === 'administrator' || user.role === 'laboran';
    const sp = await searchParams;
    const forbidden = sp?.error === 'forbidden';

    const forbiddenBanner = forbidden ? (
      <div
        role="alert"
        className="rounded-[16px] bg-status-warning-bg text-status-warning-fg px-4 py-3 text-sm font-medium"
      >
        Anda tidak memiliki izin untuk mengakses halaman tersebut.
      </div>
    ) : null;

    if (!isStaff) {
    const [myLoansRes, myNotifRes, myLoanCountsRes, unreadCountRes] = await Promise.all([
        query(
          `SELECT l.id, l.loan_code, l.loan_date, l.expected_return_date, l.status,
                COUNT(li.id)::int AS item_count
         FROM loans l
         LEFT JOIN loan_items li ON li.loan_id = l.id
         WHERE l.borrower_id = $1
         GROUP BY l.id
         ORDER BY l.created_at DESC
         LIMIT 5`,
          [user.id]
        ),
        query(
          `SELECT id, title, message, read_at, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
          [user.id]
        ),
        query(
          `SELECT
           COUNT(*) FILTER (WHERE status IN ('pending', 'approved', 'borrowed', 'overdue'))::int AS active_loans,
           COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_loans
         FROM loans
         WHERE borrower_id = $1`,
          [user.id]
        ),
        query(
          `SELECT COUNT(*)::int AS unread_notifications
         FROM notifications
         WHERE user_id = $1 AND read_at IS NULL`,
          [user.id]
        ),
      ]);

      const activeLoansCount = myLoanCountsRes.rows[0]?.active_loans ?? 0;
      const pendingLoansCount = myLoanCountsRes.rows[0]?.pending_loans ?? 0;
      const unreadNotificationsCount = unreadCountRes.rows[0]?.unread_notifications ?? 0;

      return (
        <div className="space-y-8">
          {forbiddenBanner}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
                Halo, {user.name}
              </h1>
              <p className="text-sm text-ink-600">
                Ringkasan peminjaman dan notifikasi Anda hari ini
              </p>
            </div>
            <Link href="/peminjaman/baru">
              <Button variant="primary">Ajukan peminjaman</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Peminjaman aktif" value={activeLoansCount} tone="lime" />
            <StatCard label="Menunggu persetujuan" value={pendingLoansCount} />
            <StatCard
              label="Notifikasi belum dibaca"
              value={unreadNotificationsCount}
              href="/notifikasi"
              actionLabel="Buka"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Peminjaman saya</h2>
                <ArrowPill href="/peminjaman">Semua</ArrowPill>
              </div>
              {myLoansRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Belum ada riwayat peminjaman.</p>
              ) : (
                <div className="divide-y divide-line-200">
                          {myLoansRes.rows.map((loan) => {
                            const late = ['borrowed', 'overdue'].includes(loan.status)
                              ? daysOverdue(loan.expected_return_date)
                              : 0;
                            const displayStatus = late > 0 ? 'overdue' : loan.status;
                            return (
                    <Link
                      key={loan.id}
                      href={`/peminjaman/${loan.id}`}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-cream-50 px-2 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-sm text-ink-900 tabular-nums">
                          {loan.loan_code}
                        </div>
                        <div className="text-xs text-ink-600">
                          {loan.item_count} aset · Kembali {formatDate(loan.expected_return_date)}
                        </div>
                      </div>
                        <Badge map={LOAN_STATUSES} value={displayStatus} />
                    </Link>
                  );
                })}
                </div>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Notifikasi terbaru</h2>
                <ArrowPill href="/notifikasi">Lihat semua</ArrowPill>
              </div>
              {myNotifRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Belum ada notifikasi.</p>
              ) : (
                <div className="divide-y divide-line-200">
                  {myNotifRes.rows.map((n) => (
                    <div key={n.id} className="py-3">
                      <div className="text-sm font-semibold text-ink-900">{n.title}</div>
                      <div className="text-xs text-ink-600 mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      );
    }

    // Staff Dashboard (Administrator & Laboran)
    const [
      assetSummaryRes,
      conditionRes,
      categoryRes,
      overdueRes,
      pendingLoansRes,
      upcomingMaintRes,
      openDamageRes,
      activeLoansRes,
    ] = await Promise.all([
      query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'available')::int AS available,
        COUNT(*) FILTER (WHERE status = 'borrowed')::int AS borrowed,
        COUNT(*) FILTER (WHERE status = 'maintenance')::int AS maintenance
      FROM assets
    `),
      query(`
      SELECT condition, COUNT(*)::int AS cnt
      FROM assets
      GROUP BY condition
    `),
      query(`
      SELECT c.name, COUNT(a.id)::int AS cnt
      FROM categories c
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY cnt DESC, c.name ASC
      LIMIT 6
    `),
      query(`
      SELECT COUNT(*)::int AS cnt
      FROM loans
      WHERE status IN ('borrowed', 'overdue')
        AND expected_return_date < (NOW() AT TIME ZONE 'Asia/Makassar')::date
    `),
      query(`SELECT COUNT(*)::int AS cnt FROM loans WHERE status = 'pending'`),
      query(`
      SELECT m.id, m.title, m.scheduled_at, m.status, a.asset_code, a.name AS asset_name
      FROM maintenance_schedules m
      JOIN assets a ON a.id = m.asset_id
      WHERE m.status IN ('scheduled', 'in_progress')
        AND m.scheduled_at <= NOW() + INTERVAL '7 days'
      ORDER BY m.scheduled_at ASC
      LIMIT 5
    `),
      query(`SELECT COUNT(*)::int AS cnt FROM damage_reports WHERE status != 'resolved'`),
      query(`
      SELECT l.id, l.loan_code, l.expected_return_date, l.status, u.name AS borrower_name,
             COUNT(li.id)::int AS item_count
      FROM loans l
      JOIN users u ON u.id = l.borrower_id
      LEFT JOIN loan_items li ON li.loan_id = l.id
      WHERE l.status IN ('pending', 'approved', 'borrowed', 'overdue')
      GROUP BY l.id, u.name
      ORDER BY l.expected_return_date ASC
      LIMIT 5
    `),
    ]);

    const summary = assetSummaryRes.rows[0] || { total: 0, available: 0, borrowed: 0 };
    const overdueCount = overdueRes.rows[0]?.cnt ?? 0;
    const pendingCount = pendingLoansRes.rows[0]?.cnt ?? 0;
    const openDamageCount = openDamageRes.rows[0]?.cnt ?? 0;

    const condMap = Object.fromEntries(conditionRes.rows.map((r) => [r.condition, r.cnt]));
    const totalForBar = Math.max(summary.total, 1);

    return (
      <div className="space-y-8">
        {forbiddenBanner}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">
              Selamat datang, {user.name}
            </h1>
            <p className="text-sm text-ink-600">Ringkasan inventaris laboratorium hari ini</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/aset/baru">
              <Button variant="secondary">Daftarkan aset</Button>
            </Link>
            <Link href="/peminjaman/baru">
              <Button variant="primary">Catat peminjaman</Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total aset" value={summary.total} subtext="Seluruh aset terdaftar" />
          <StatCard label="Tersedia" value={summary.available} subtext="Siap dipinjam" />
          <StatCard label="Sedang dipinjam" value={summary.borrowed} subtext="Aktif di peminjam" />
          <StatCard
            label="Peminjaman terlambat"
            value={overdueCount}
            tone={overdueCount > 0 ? 'dark' : 'default'}
            subtext={overdueCount > 0 ? 'Melewati rencana kembali' : 'Tidak ada keterlambatan'}
            href="/peminjaman?tab=overdue"
            actionLabel="Tinjau"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <h2 className="text-lg font-semibold mb-4">Kondisi aset</h2>
              <div className="space-y-3">
                {['good', 'needs_attention', 'damaged'].map((key) => {
                  const count = condMap[key] || 0;
                  const pct = Math.round((count / totalForBar) * 100);
                  const meta = ASSET_CONDITIONS[key];
                  const barColor =
                    key === 'good'
                      ? 'bg-ink-900'
                      : key === 'needs_attention'
                        ? 'bg-status-warning-fg'
                        : 'bg-status-danger-fg';
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-ink-900">{meta.label}</span>
                        <span className="tabular-nums text-ink-600">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-cream-100 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-4">Aset per kategori</h2>
              <div className="space-y-2.5">
                {categoryRes.rows.map((cat) => {
                  const pct = Math.round((cat.cnt / totalForBar) * 100);
                  return (
                    <div key={cat.name} className="flex items-center gap-3 text-sm">
                      <span className="w-40 truncate text-ink-700 font-medium">{cat.name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-cream-100 overflow-hidden">
                        <div className="h-full rounded-full bg-lime-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right tabular-nums font-semibold text-ink-900">
                        {cat.cnt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Peminjaman aktif &amp; menunggu</h2>
                <ArrowPill href="/peminjaman">Lihat semua</ArrowPill>
              </div>
              {activeLoansRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Tidak ada peminjaman aktif saat ini.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-line-200 text-left text-xs font-semibold text-ink-600">
                        <th className="pb-2">Kode</th>
                        <th className="pb-2">Peminjam</th>
                        <th className="pb-2">Kembali</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-200">
                      {activeLoansRes.rows.map((l) => {
                        const late = ['borrowed', 'overdue'].includes(l.status)
                          ? daysOverdue(l.expected_return_date)
                          : 0;
                        const displayStatus = late > 0 ? 'overdue' : l.status;
                        return (
                          <tr key={l.id} className="hover:bg-cream-50">
                            <td className="py-3 font-semibold tabular-nums">
                              <Link href={`/peminjaman/${l.id}`} className="hover:underline">
                                {l.loan_code}
                              </Link>
                            </td>
                            <td className="py-3 text-ink-700">{l.borrower_name}</td>
                            <td className="py-3 text-ink-600 tabular-nums">
                              {formatDate(l.expected_return_date)}
                            </td>
                            <td className="py-3">
                              <Badge map={LOAN_STATUSES} value={displayStatus} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* Right 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="cream">
              <h2 className="text-lg font-semibold mb-3">Perlu tindakan</h2>
              <div className="space-y-3 text-sm">
                <Link
                  href="/peminjaman?tab=pending"
                  className="flex items-center justify-between rounded-[14px] bg-white p-4 border border-line-200 hover:bg-cream-50"
                >
                  <span>Pengajuan peminjaman menunggu</span>
                  <span className="font-bold tabular-nums px-2.5 py-0.5 rounded-full bg-lime-400 text-ink-900">
                    {pendingCount}
                  </span>
                </Link>
                <Link
                  href="/kerusakan"
                  className="flex items-center justify-between rounded-[14px] bg-white p-4 border border-line-200 hover:bg-cream-50"
                >
                  <span>Laporan kerusakan terbuka</span>
                  <span className="font-bold tabular-nums px-2.5 py-0.5 rounded-full bg-status-danger-bg text-status-danger-fg">
                    {openDamageCount}
                  </span>
                </Link>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Pemeliharaan 7 hari ke depan</h2>
                <ArrowPill href="/pemeliharaan">Jadwal</ArrowPill>
              </div>
              {upcomingMaintRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Tidak ada jadwal pemeliharaan dalam 7 hari ke depan.</p>
              ) : (
                <div className="divide-y divide-line-200">
                  {upcomingMaintRes.rows.map((m) => (
                    <div key={m.id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink-900">{m.title}</div>
                        <div className="text-xs text-ink-600">
                          {m.asset_code} · {m.asset_name}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-ink-600 whitespace-nowrap tabular-nums">
                        {formatDate(m.scheduled_at)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }
