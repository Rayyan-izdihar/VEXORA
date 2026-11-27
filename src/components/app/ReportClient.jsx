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
  getStatusMeta,
} from '@/lib/status';
import { formatDate, daysOverdue, toYmdInTz } from '@/lib/format';

function getLoanDisplayStatus(loan) {
  const late = ['borrowed', 'overdue'].includes(loan.status)
    ? daysOverdue(loan.expected_return_date)
    : 0;
  return late > 0 ? 'overdue' : loan.status;
}

function escapeCsvCell(cell) {
  const str = String(cell ?? '');
  const safe = /^[=+@\t\r]|^-(?=\S)/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

const STATUS_OPTIONS_BY_TAB = {
  inventaris: [
    { value: 'available', label: 'Tersedia' },
    { value: 'borrowed', label: 'Dipinjam' },
    { value: 'maintenance', label: 'Pemeliharaan' },
    { value: 'inactive', label: 'Nonaktif' },
  ],
  pemeliharaan: [
    { value: 'scheduled', label: 'Terjadwal' },
    { value: 'in_progress', label: 'Berlangsung' },
    { value: 'completed', label: 'Selesai' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ],
  kerusakan: [
    { value: 'reported', label: 'Dilaporkan' },
    { value: 'reviewed', label: 'Ditinjau' },
    { value: 'in_progress', label: 'Ditangani' },
    { value: 'resolved', label: 'Selesai' },
  ],
  peminjaman: [
    { value: 'pending', label: 'Menunggu' },
    { value: 'approved', label: 'Disetujui' },
    { value: 'borrowed', label: 'Dipinjam' },
    { value: 'overdue', label: 'Terlambat' },
    { value: 'completed', label: 'Selesai' },
    { value: 'rejected', label: 'Ditolak' },
    { value: 'cancelled', label: 'Dibatalkan' },
  ],
};

export function ReportClient({
  assets = [],
  maintenance = [],
  damages = [],
  loans = [],
  categories = [],
}) {
  const [tab, setTab] = useState('inventaris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  function matchesDateRange(dateInput) {
    if (!startDate && !endDate) return true;
    const ymd = toYmdInTz(dateInput);
    if (!ymd) return false;
    if (startDate && ymd < startDate) return false;
    if (endDate && ymd > endDate) return false;
    return true;
  }

  function handleTabChange(nextTab) {
    setTab(nextTab);
    setStatusFilter('');
    if (nextTab === 'peminjaman') {
      setCategoryFilter('');
    }
  }

  function resetFilters() {
    setStartDate('');
    setEndDate('');
    setCategoryFilter('');
    setStatusFilter('');
  }

  const filteredAssets = assets.filter((a) => {
    if (!matchesDateRange(a.acquisition_date || a.created_at)) return false;
    if (categoryFilter && a.category_name !== categoryFilter) return false;
    if (tab === 'inventaris' && statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const filteredMaintenance = maintenance.filter((m) => {
    if (!matchesDateRange(m.scheduled_at)) return false;
    if (categoryFilter && m.category_name !== categoryFilter) return false;
    if (tab === 'pemeliharaan' && statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  const filteredDamages = damages.filter((d) => {
    if (!matchesDateRange(d.reported_at)) return false;
    if (categoryFilter && d.category_name !== categoryFilter) return false;
    if (tab === 'kerusakan' && statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const filteredLoans = loans.filter((l) => {
    if (!matchesDateRange(l.loan_date)) return false;
    if (tab === 'peminjaman' && statusFilter && getLoanDisplayStatus(l) !== statusFilter) {
      return false;
    }
    return true;
  });

  const goodCount = filteredAssets.filter((a) => a.condition === 'good').length;
  const goodPct =
    filteredAssets.length > 0 ? Math.round((goodCount / filteredAssets.length) * 100) : 0;

  const hasFilters = Boolean(startDate || endDate || categoryFilter || statusFilter);

  function exportCsv() {
    let headers = [];
    let rows = [];
    const filename = `laporan-${tab}.csv`;

    if (tab === 'inventaris') {
      headers = ['Kode Aset', 'Nama Aset', 'Kategori', 'Lokasi', 'Kondisi', 'Status'];
      rows = filteredAssets.map((a) => [
        a.asset_code,
        a.name,
        a.category_name,
        a.location_name || '-',
        getStatusMeta(ASSET_CONDITIONS, a.condition).label,
        getStatusMeta(ASSET_STATUSES, a.status).label,
      ]);
    } else if (tab === 'pemeliharaan') {
      headers = ['Kode Aset', 'Nama Aset', 'Kategori', 'Judul', 'Waktu Jadwal', 'Status'];
      rows = filteredMaintenance.map((m) => [
        m.asset_code,
        m.asset_name,
        m.category_name,
        m.title,
        formatDate(m.scheduled_at),
        getStatusMeta(MAINTENANCE_STATUSES, m.status).label,
      ]);
    } else if (tab === 'kerusakan') {
      headers = ['Kode Aset', 'Nama Aset', 'Kategori', 'Pelapor', 'Tanggal Lapor', 'Status', 'Deskripsi'];
      rows = filteredDamages.map((d) => [
        d.asset_code,
        d.asset_name,
        d.category_name,
        d.reporter_name || '-',
        formatDate(d.reported_at),
        getStatusMeta(DAMAGE_STATUSES, d.status).label,
        d.description,
      ]);
    } else {
      headers = ['Kode Pinjam', 'Peminjam', 'Tanggal Pinjam', 'Rencana Kembali', 'Status'];
      rows = filteredLoans.map((l) => [
        l.loan_code,
        l.borrower_name,
        formatDate(l.loan_date),
        formatDate(l.expected_return_date),
        getStatusMeta(LOAN_STATUSES, getLoanDisplayStatus(l)).label,
      ]);
    }

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((r) => r.map(escapeCsvCell).join(';'))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
              onClick={() => handleTabChange(t.key)}
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

      {/* Filter Periode, Kategori & Status */}
      <div className="no-print rounded-[20px] bg-white border border-line-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-700">
            Dari tanggal
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white font-normal text-ink-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-700">
            Sampai tanggal
            <input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white font-normal text-ink-900"
            />
          </label>
          {tab !== 'peminjaman' && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-ink-700">
              Kategori aset
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white font-normal text-ink-900"
              >
                <option value="">Semua kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-xs font-semibold text-ink-700">
            Status
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white font-normal text-ink-900"
            >
              <option value="">Semua status</option>
              {STATUS_OPTIONS_BY_TAB[tab].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-start lg:justify-end">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset filter
              </Button>
            )}
          </div>
        </div>
      </div>

      {hasFilters && (
        <div className="text-xs text-ink-600">
          Menampilkan data terfilter
          {startDate || endDate
            ? ` · Periode ${startDate ? formatDate(startDate) : 'awal'} s.d. ${endDate ? formatDate(endDate) : 'sekarang'}`
            : ''}
          {categoryFilter ? ` · Kategori: ${categoryFilter}` : ''}
          {statusFilter
            ? ` · Status: ${STATUS_OPTIONS_BY_TAB[tab].find((s) => s.value === statusFilter)?.label || statusFilter}`
            : ''}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total aset" value={filteredAssets.length} />
        <StatCard
          label="Kondisi baik (%)"
          value={goodPct}
          subtext={`${goodCount} dari ${filteredAssets.length} aset`}
        />
        <StatCard label="Jadwal pemeliharaan" value={filteredMaintenance.length} />
        <StatCard label="Laporan kerusakan" value={filteredDamages.length} />
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
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-ink-600">
                      Tidak ada data inventaris aset yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((a) => (
                    <tr key={a.id} className="h-12">
                      <td className="px-5 font-semibold tabular-nums">{a.asset_code}</td>
                      <td className="px-4 font-medium">{a.name}</td>
                      <td className="px-4 text-ink-600">{a.category_name}</td>
                      <td className="px-4 text-ink-600">{a.location_name || '-'}</td>
                      <td className="px-4"><Badge map={ASSET_CONDITIONS} value={a.condition} /></td>
                      <td className="px-5"><Badge map={ASSET_STATUSES} value={a.status} /></td>
                    </tr>
                  ))
                )}
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
                {filteredMaintenance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-ink-600">
                      Tidak ada data pemeliharaan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredMaintenance.map((m) => (
                    <tr key={m.id} className="h-12">
                      <td className="px-5 font-medium">{m.asset_code} · {m.asset_name}</td>
                      <td className="px-4">{m.title}</td>
                      <td className="px-4 tabular-nums text-ink-600">{formatDate(m.scheduled_at)}</td>
                      <td className="px-5"><Badge map={MAINTENANCE_STATUSES} value={m.status} /></td>
                    </tr>
                  ))
                )}
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
                {filteredDamages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-600">
                      Tidak ada data laporan kerusakan yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredDamages.map((d) => (
                    <tr key={d.id} className="h-12">
                      <td className="px-5 font-medium">{d.asset_code} · {d.asset_name}</td>
                      <td className="px-4 text-ink-600">{d.reporter_name || '-'}</td>
                      <td className="px-4 tabular-nums text-ink-600">{formatDate(d.reported_at)}</td>
                      <td className="px-4 max-w-sm truncate">{d.description}</td>
                      <td className="px-5"><Badge map={DAMAGE_STATUSES} value={d.status} /></td>
                    </tr>
                  ))
                )}
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
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-600">
                      Tidak ada data peminjaman yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((l) => (
                    <tr key={l.id} className="h-12">
                      <td className="px-5 font-semibold tabular-nums">{l.loan_code}</td>
                      <td className="px-4">{l.borrower_name}</td>
                      <td className="px-4 tabular-nums text-ink-600">{formatDate(l.loan_date)}</td>
                      <td className="px-4 tabular-nums text-ink-600">{formatDate(l.expected_return_date)}</td>
                      <td className="px-5"><Badge map={LOAN_STATUSES} value={getLoanDisplayStatus(l)} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
