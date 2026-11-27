import Link from 'next/link';
import { Package, Eye, Pencil, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Table';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

export default async function AsetListPage({ searchParams }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const sp = await searchParams;

  const q = (sp?.q || '').trim();
  const kategori = sp?.kategori || '';
  const lokasi = sp?.lokasi || '';
  const kondisi = sp?.kondisi || '';
  const status = sp?.status || '';
  const page = Math.max(1, Number(sp?.page || 1));

  const where = [];
  const params = [];

  if (q) {
    params.push(`%${q}%`);
    where.push(`(a.asset_code ILIKE $${params.length} OR a.name ILIKE $${params.length})`);
  }
  if (kategori) {
    params.push(kategori);
    where.push(`c.name = $${params.length}`);
  }
  if (lokasi) {
    params.push(lokasi);
    where.push(`l.name = $${params.length}`);
  }
  if (kondisi) {
    params.push(kondisi);
    where.push(`a.condition = $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`a.status = $${params.length}`);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * PAGE_SIZE;

  const [countRes, assetsRes, categoriesRes, locationsRes] = await Promise.all([
    query(
      `SELECT COUNT(*)::int AS cnt
       FROM assets a
       JOIN categories c ON c.id = a.category_id
       LEFT JOIN locations l ON l.id = a.location_id
       ${whereSql}`,
      params
    ),
    query(
      `SELECT a.id, a.asset_code, a.name, a.condition, a.status,
              c.name AS category_name, l.name AS location_name
       FROM assets a
       JOIN categories c ON c.id = a.category_id
       LEFT JOIN locations l ON l.id = a.location_id
       ${whereSql}
       ORDER BY a.asset_code ASC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, PAGE_SIZE, offset]
    ),
    query(`SELECT id, name FROM categories ORDER BY name ASC`),
    query(`SELECT id, name FROM locations ORDER BY name ASC`),
  ]);

  const totalItems = countRes.rows[0]?.cnt ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const hasFilters = Boolean(q || kategori || lokasi || kondisi || status);

  function buildHref(nextPage, overrides = {}) {
    const merged = { q, kategori, lokasi, kondisi, status, page: nextPage, ...overrides };
    const qs = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) qs.set(k, String(v));
    });
    return `/aset?${qs.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Aset</h1>
          <p className="text-sm text-ink-600">Semua aset laboratorium beserta lokasi dan kondisinya</p>
        </div>
        {isStaff && (
          <Link href="/aset/baru">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Daftarkan aset
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Toolbar */}
      <form method="GET" action="/aset" className="rounded-[20px] bg-white border border-line-200 p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Cari kode atau nama..."
            className="lg:col-span-2 h-10 px-3.5 rounded-[12px] border border-line-200 text-sm focus:outline-none focus:border-ink-900"
          />
          <select
            name="kategori"
            defaultValue={kategori}
            className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
          >
            <option value="">Semua kategori</option>
            {categoriesRes.rows.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            name="lokasi"
            defaultValue={lokasi}
            className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
          >
            <option value="">Semua lokasi</option>
            {locationsRes.rows.map((l) => (
              <option key={l.id} value={l.name}>
                {l.name}
              </option>
            ))}
          </select>
          <select
            name="kondisi"
            defaultValue={kondisi}
            className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
          >
            <option value="">Semua kondisi</option>
            <option value="good">Baik</option>
            <option value="needs_attention">Perlu perhatian</option>
            <option value="damaged">Rusak</option>
          </select>
          <select
            name="status"
            defaultValue={status}
            className="h-10 px-3 rounded-[12px] border border-line-200 text-sm bg-white"
          >
            <option value="">Semua status</option>
            <option value="available">Tersedia</option>
            <option value="borrowed">Dipinjam</option>
            <option value="maintenance">Pemeliharaan</option>
            <option value="inactive">Nonaktif</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/aset"
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                !kategori ? 'bg-ink-900 text-white border-ink-900' : 'bg-cream-50 text-ink-700 border-line-200'
              }`}
            >
              Semua
            </Link>
            {categoriesRes.rows.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={buildHref(1, { kategori: c.name })}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  kategori === c.name
                    ? 'bg-lime-400 text-ink-900 border-lime-400'
                    : 'bg-cream-50 text-ink-700 border-line-200 hover:bg-cream-100'
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && (
              <Link href="/aset">
                <Button variant="ghost" size="sm">
                  Reset filter
                </Button>
              </Link>
            )}
            <Button type="submit" variant="dark" size="sm">
              Terapkan
            </Button>
          </div>
        </div>
      </form>

      {assetsRes.rows.length === 0 ? (
        hasFilters ? (
          <EmptyState
            title="Tidak ada aset yang cocok dengan filter"
            description="Coba ubah kata kunci pencarian atau reset filter yang aktif."
            actionLabel="Reset filter"
            actionHref="/aset"
          />
        ) : (
          <EmptyState
            title="Belum ada aset"
            description="Daftarkan aset pertama agar bisa dipinjam dan dijadwalkan pemeliharaannya."
            actionLabel={isStaff ? 'Daftarkan aset' : undefined}
            actionHref={isStaff ? '/aset/baru' : undefined}
          />
        )
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-[20px] bg-white border border-line-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Kode</th>
                  <th className="py-3.5 px-4">Nama aset</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Lokasi</th>
                  <th className="py-3.5 px-4">Kondisi</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {assetsRes.rows.map((a) => (
                  <tr key={a.id} className="h-14 hover:bg-cream-50">
                    <td className="px-5 font-semibold tabular-nums text-ink-900">
                      <Link href={`/aset/${a.id}`} className="hover:underline">
                        {a.asset_code}
                      </Link>
                    </td>
                    <td className="px-4">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-cream-100 text-ink-700 inline-flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4" />
                        </span>
                        <Link href={`/aset/${a.id}`} className="font-medium text-ink-900 hover:underline">
                          {a.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 text-ink-600">{a.category_name}</td>
                    <td className="px-4 text-ink-600">{a.location_name || '-'}</td>
                    <td className="px-4">
                      <Badge map={ASSET_CONDITIONS} value={a.condition} />
                    </td>
                    <td className="px-4">
                      <Badge map={ASSET_STATUSES} value={a.status} />
                    </td>
                    <td className="px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/aset/${a.id}`}
                          title="Lihat detail"
                          aria-label={`Lihat detail ${a.name}`}
                          className="w-8 h-8 rounded-full border border-line-200 inline-flex items-center justify-center text-ink-700 hover:bg-cream-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        {isStaff ? (
                          <Link
                            href={`/aset/${a.id}/ubah`}
                            title="Ubah aset"
                            aria-label={`Ubah ${a.name}`}
                            className="w-8 h-8 rounded-full border border-line-200 inline-flex items-center justify-center text-ink-700 hover:bg-cream-100"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        ) : a.status === 'available' ? (
                          <Link
                            href={`/peminjaman/baru?asset=${a.id}`}
                            className="h-8 px-3 rounded-full bg-lime-400 text-ink-900 text-xs font-semibold inline-flex items-center hover:bg-lime-500"
                          >
                            Pinjam
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {assetsRes.rows.map((a) => (
              <Link
                key={a.id}
                href={`/aset/${a.id}`}
                className="block rounded-[20px] bg-white border border-line-200 p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tabular-nums text-ink-600">{a.asset_code}</span>
                  <Badge map={ASSET_STATUSES} value={a.status} />
                </div>
                <div className="font-semibold text-ink-900">{a.name}</div>
                <div className="flex items-center justify-between text-xs text-ink-600">
                  <span>{a.category_name} · {a.location_name || 'Tanpa lokasi'}</span>
                  <Badge map={ASSET_CONDITIONS} value={a.condition} />
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            buildHref={(p) => buildHref(p)}
          />
        </>
      )}
    </div>
  );
}
