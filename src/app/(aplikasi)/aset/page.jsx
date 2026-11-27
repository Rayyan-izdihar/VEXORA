import Link from 'next/link';
import { Package, Eye, Pencil, Plus } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Table';
import { UploadedImage } from '@/components/ui/ImageUpload';
import { AssetFilterBar } from '@/components/app/AssetFilterBar';

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
  const rawPage = Number.parseInt(sp?.page || '1', 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

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
      `SELECT a.id, a.asset_code, a.name, a.condition, a.status, a.image_url,
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
      <AssetFilterBar
        initialQ={q}
        initialKategori={kategori}
        initialLokasi={lokasi}
        initialKondisi={kondisi}
        initialStatus={status}
        categories={categoriesRes.rows}
        locations={locationsRes.rows}
      />

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
                        {a.image_url ? (
                          <UploadedImage
                            src={a.image_url}
                            alt={a.name}
                            className="w-9 h-9 rounded-full object-cover border border-line-200 shrink-0"
                          />
                        ) : (
                          <span className="w-9 h-9 rounded-full bg-cream-100 text-ink-700 inline-flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </span>
                        )}
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
                        ) : a.status !== 'inactive' ? (
                          <Link
                            href={`/peminjaman/baru?asset=${a.id}`}
                            className="h-8 px-3 rounded-full border border-line-200 bg-white text-ink-700 text-xs font-semibold inline-flex items-center hover:bg-cream-100"
                          >
                            Booking
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
