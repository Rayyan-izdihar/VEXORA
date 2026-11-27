import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Pencil, Wrench, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { formatDate, formatDateTime } from '@/lib/format';
import {
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  LOAN_ITEM_STATUSES,
  MAINTENANCE_STATUSES,
  DAMAGE_STATUSES,
} from '@/lib/status';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function AsetDetailPage({ params }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const { id } = await params;

  const { rows: assetRows } = await query(
    `SELECT a.*, c.name AS category_name, l.name AS location_name
     FROM assets a
     JOIN categories c ON c.id = a.category_id
     LEFT JOIN locations l ON l.id = a.location_id
     WHERE a.id = $1
     LIMIT 1`,
    [id]
  );

  const asset = assetRows[0];
  if (!asset) notFound();

  const [loansRes, maintRes, damageRes] = await Promise.all([
    query(
      `SELECT li.id, li.item_status, l.id AS loan_id, l.loan_code, l.loan_date, l.expected_return_date, u.name AS borrower_name
       FROM loan_items li
       JOIN loans l ON l.id = li.loan_id
       JOIN users u ON u.id = l.borrower_id
       WHERE li.asset_id = $1
       ORDER BY l.created_at DESC
       LIMIT 10`,
      [id]
    ),
    query(
      `SELECT m.id, m.title, m.scheduled_at, m.completed_at, m.status, u.name AS assigned_name
       FROM maintenance_schedules m
       LEFT JOIN users u ON u.id = m.assigned_to
       WHERE m.asset_id = $1
       ORDER BY m.scheduled_at DESC
       LIMIT 10`,
      [id]
    ),
    query(
      `SELECT d.id, d.description, d.reported_at, d.status, u.name AS reporter_name
       FROM damage_reports d
       LEFT JOIN users u ON u.id = d.reported_by
       WHERE d.asset_id = $1
       ORDER BY d.reported_at DESC
       LIMIT 10`,
      [id]
    ),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/aset"
            className="w-10 h-10 rounded-full border border-line-200 bg-white flex items-center justify-center text-ink-900 hover:bg-cream-100"
            aria-label="Kembali ke daftar aset"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs font-bold tabular-nums text-ink-600">{asset.asset_code}</div>
            <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">{asset.name}</h1>
          </div>
        </div>
        {isStaff && (
          <Link href={`/aset/${asset.id}/ubah`}>
            <Button variant="secondary">
              <Pencil className="w-4 h-4" />
              Ubah aset
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="flex flex-wrap items-center gap-3 pb-5 border-b border-line-200">
              <Badge map={ASSET_STATUSES} value={asset.status} />
              <Badge map={ASSET_CONDITIONS} value={asset.condition} />
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-sm">
              <div>
                <dt className="text-ink-600">Kategori</dt>
                <dd className="font-semibold text-ink-900 mt-0.5">{asset.category_name}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Lokasi</dt>
                <dd className="font-semibold text-ink-900 mt-0.5">{asset.location_name || '-'}</dd>
              </div>
              <div>
                <dt className="text-ink-600">Tanggal perolehan</dt>
                <dd className="font-semibold text-ink-900 mt-0.5 tabular-nums">
                  {formatDate(asset.acquisition_date)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-600">Terakhir diperbarui</dt>
                <dd className="font-semibold text-ink-900 mt-0.5 tabular-nums">
                  {formatDateTime(asset.updated_at)}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-600">Deskripsi</dt>
                <dd className="text-ink-900 mt-0.5">{asset.description || '-'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-ink-600">Catatan</dt>
                <dd className="text-ink-900 mt-0.5">{asset.notes || '-'}</dd>
              </div>
            </dl>
          </Card>

          {/* Riwayat Peminjaman */}
          <Card>
            <h2 className="text-lg font-semibold mb-4">Riwayat peminjaman</h2>
            {loansRes.rows.length === 0 ? (
              <p className="text-sm text-ink-600">Belum ada riwayat peminjaman untuk aset ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line-200 text-left text-xs font-semibold text-ink-600">
                      <th className="pb-2">Kode</th>
                      <th className="pb-2">Peminjam</th>
                      <th className="pb-2">Tanggal</th>
                      <th className="pb-2">Status item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-200">
                    {loansRes.rows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2.5 font-semibold tabular-nums">
                          <Link href={`/peminjaman/${row.loan_id}`} className="hover:underline">
                            {row.loan_code}
                          </Link>
                        </td>
                        <td className="py-2.5">{row.borrower_name}</td>
                        <td className="py-2.5 text-ink-600 tabular-nums">{formatDate(row.loan_date)}</td>
                        <td className="py-2.5">
                          <Badge map={LOAN_ITEM_STATUSES} value={row.item_status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Riwayat Pemeliharaan & Kerusakan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold mb-3">Jadwal pemeliharaan</h2>
              {maintRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Belum ada jadwal pemeliharaan.</p>
              ) : (
                <div className="divide-y divide-line-200 text-sm">
                  {maintRes.rows.map((m) => (
                    <div key={m.id} className="py-2.5 flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium text-ink-900">{m.title}</div>
                        <div className="text-xs text-ink-600">{formatDate(m.scheduled_at)}</div>
                      </div>
                      <Badge map={MAINTENANCE_STATUSES} value={m.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold mb-3">Laporan kerusakan</h2>
              {damageRes.rows.length === 0 ? (
                <p className="text-sm text-ink-600">Belum ada laporan kerusakan.</p>
              ) : (
                <div className="divide-y divide-line-200 text-sm">
                  {damageRes.rows.map((d) => (
                    <div key={d.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-ink-600">{formatDate(d.reported_at)}</span>
                        <Badge map={DAMAGE_STATUSES} value={d.status} />
                      </div>
                      <p className="text-ink-900 line-clamp-2">{d.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right 4 cols: Quick Actions */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="dark" className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Tindakan cepat</h2>
            <div className="space-y-2.5">
              {asset.status === 'available' && (
                <Link
                  href={`/peminjaman/baru?asset=${asset.id}`}
                  className="w-full h-11 px-4 rounded-full bg-lime-400 text-ink-900 font-semibold text-sm flex items-center gap-2.5 hover:bg-lime-500"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {isStaff ? 'Pinjamkan aset ini' : 'Ajukan peminjaman'}
                </Link>
              )}
              {isStaff && (
                <Link
                  href={`/pemeliharaan?asset=${asset.id}`}
                  className="w-full h-11 px-4 rounded-full bg-white/10 text-white font-medium text-sm flex items-center gap-2.5 hover:bg-white/20"
                >
                  <Wrench className="w-4 h-4 text-lime-400" />
                  Jadwalkan pemeliharaan
                </Link>
              )}
              <Link
                href={`/kerusakan?asset=${asset.id}`}
                className="w-full h-11 px-4 rounded-full bg-white/10 text-white font-medium text-sm flex items-center gap-2.5 hover:bg-white/20"
              >
                <AlertTriangle className="w-4 h-4 text-lime-400" />
                Laporkan kerusakan
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
