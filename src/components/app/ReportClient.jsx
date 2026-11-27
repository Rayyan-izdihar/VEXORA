'use client';

import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  ASSET_CONDITIONS,
  ASSET_STATUSES,
  MAINTENANCE_STATUSES,
  DAMAGE_STATUSES,
  LOAN_STATUSES,
} from '@/lib/status';
import { formatDate } from '@/lib/format';

export function ReportClient({ assets = [], maintenance = [], damages = [], loans = [] }) {
  const [tab, setTab] = useState('inventaris');

  const goodCount = assets.filter((a) => a.condition === 'good').length;
  const goodPct = assets.length > 0 ? Math.round((goodCount / assets.length) * 100) : 0;

  function exportCsv() {
    let headers = [];
    let rows = [];
    let filename = `laporan-${tab}.csv`;

    if (tab === 'inventaris') {
      headers = ['Kode Aset', 'Nama Aset', 'Kategori', 'Lokasi', 'Kondisi', 'Status'];
      rows = assets.map((a) => [
        a.asset_code,
        a.name,
        a.category_name,
        a.location_name || '-',
        a.condition,
        a.status,
      ]);
    } else if (tab === 'pemeliharaan') {
      headers = ['Kode Aset', 'Nama Aset', 'Judul', 'Waktu Jadwal', 'Status'];
      rows = maintenance.map((m) => [
        m.asset_code,
        m.asset_name,
        m.title,
        formatDate(m.scheduled_at),
        m.status,
      ]);
    } else if (tab === 'kerusakan') {
      headers = ['Kode Aset', 'Nama Aset', 'Pelapor', 'Tanggal Lapor', 'Status', 'Deskripsi'];
      rows = damages.map((d) => [
        d.asset_code,
        d.asset_name,
        d.reporter_name || '-',
        formatDate(d.reported_at),
        d.status,
        d.description,
      ]);
    } else {
      headers = ['Kode Pinjam', 'Peminjam', 'Tanggal Pinjam', 'Rencana Kembali', 'Status'];
      rows = loans.map((l) => [
        l.loan_code,
        l.borrower_name,
        formatDate(l.loan_date),
        formatDate(l.expected_return_date),
        l.status,
      ]);
    }

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap rounded-full bg-cream-100 p-1 gap-1">
          {[
            { key: 'inventaris', label: 'Inventaris' },
            { key: 'pemeliharaan', label: 'Pemeliharaan' },
            { key: 'kerusakan', label: 'Kerusakan' },
            { key: 'peminjaman', label: 'Peminjaman' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`h-9 px-4 rounded-full text-sm font-semibold ${
                tab === t.key ? 'bg-ink-900 text-white' : 'text-ink-700 hover:text-ink-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={exportCsv}>
            <Download className="w-4 h-4" />
            Ekspor CSV
          </Button>
          <Button variant="dark" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4" />
            Cetak / PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total aset" value={assets.length} />
        <StatCard label="Kondisi baik (%)" value={goodPct} subtext={`${goodCount} dari ${assets.length} aset`} />
        <StatCard label="Jadwal pemeliharaan" value={maintenance.length} />
        <StatCard label="Laporan kerusakan" value={damages.length} />
      </div>

      <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
        <div className="overflow-x-auto">
          {tab === 'inventaris' && (
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Kode</th>
                  <th className="py-3.5 px-4">Nama aset</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Lokasi</th>
                  <th className="py-3.5 px-4">Kondisi</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {assets.map((a) => (
                  <tr key={a.id} className="h-12">
                    <td className="px-5 font-semibold tabular-nums">{a.asset_code}</td>
                    <td className="px-4 font-medium">{a.name}</td>
                    <td className="px-4 text-ink-600">{a.category_name}</td>
                    <td className="px-4 text-ink-600">{a.location_name || '-'}</td>
                    <td className="px-4"><Badge map={ASSET_CONDITIONS} value={a.condition} /></td>
                    <td className="px-5"><Badge map={ASSET_STATUSES} value={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'pemeliharaan' && (
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Aset</th>
                  <th className="py-3.5 px-4">Pekerjaan</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {maintenance.map((m) => (
                  <tr key={m.id} className="h-12">
                    <td className="px-5 font-medium">{m.asset_code} · {m.asset_name}</td>
                    <td className="px-4">{m.title}</td>
                    <td className="px-4 tabular-nums text-ink-600">{formatDate(m.scheduled_at)}</td>
                    <td className="px-5"><Badge map={MAINTENANCE_STATUSES} value={m.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'kerusakan' && (
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Aset</th>
                  <th className="py-3.5 px-4">Pelapor</th>
                  <th className="py-3.5 px-4">Tanggal</th>
                  <th className="py-3.5 px-4">Deskripsi</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {damages.map((d) => (
                  <tr key={d.id} className="h-12">
                    <td className="px-5 font-medium">{d.asset_code} · {d.asset_name}</td>
                    <td className="px-4 text-ink-600">{d.reporter_name || '-'}</td>
                    <td className="px-4 tabular-nums text-ink-600">{formatDate(d.reported_at)}</td>
                    <td className="px-4 max-w-sm truncate">{d.description}</td>
                    <td className="px-5"><Badge map={DAMAGE_STATUSES} value={d.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'peminjaman' && (
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Kode</th>
                  <th className="py-3.5 px-4">Peminjam</th>
                  <th className="py-3.5 px-4">Tanggal pinjam</th>
                  <th className="py-3.5 px-4">Rencana kembali</th>
                  <th className="py-3.5 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {loans.map((l) => (
                  <tr key={l.id} className="h-12">
                    <td className="px-5 font-semibold tabular-nums">{l.loan_code}</td>
                    <td className="px-4">{l.borrower_name}</td>
                    <td className="px-4 tabular-nums text-ink-600">{formatDate(l.loan_date)}</td>
                    <td className="px-4 tabular-nums text-ink-600">{formatDate(l.expected_return_date)}</td>
                    <td className="px-5"><Badge map={LOAN_STATUSES} value={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
