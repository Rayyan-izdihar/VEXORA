import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Check, Package, ArrowLeftRight, Wrench, Hexagon } from 'lucide-react';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { formatNumber } from '@/lib/format';
import { ArrowPill } from '@/components/ui/ArrowPill';
import {
  LandingNavbar,
  ModulePanels,
  ScrollTopButton,
  DemoTriggerButton,
} from '@/components/landing/LandingSections';
import {
  LANDING_FEATURES,
  LANDING_ROLES,
  LANDING_RULES,
} from '@/components/landing/landingData';

export const dynamic = 'force-dynamic';

async function getLandingStats() {
  try {
    const [assetRes, maintRes, damageRes, catRes] = await Promise.all([
      query(`
        SELECT
          COUNT(*)::int AS total_assets,
          COUNT(*) FILTER (WHERE status = 'borrowed')::int AS borrowed_assets
        FROM assets
      `),
      query(`
        SELECT COUNT(*)::int AS upcoming_maintenance
        FROM maintenance_schedules
        WHERE status IN ('scheduled', 'in_progress')
          AND scheduled_at >= NOW() - INTERVAL '1 day'
          AND scheduled_at <= NOW() + INTERVAL '7 days'
      `),
      query(`
        SELECT COUNT(*)::int AS open_reports
        FROM damage_reports
        WHERE status != 'resolved'
      `),
      query(`SELECT id, name FROM categories ORDER BY name ASC LIMIT 10`),
    ]);

    return {
      totalAssets: assetRes.rows[0]?.total_assets ?? 0,
      borrowedAssets: assetRes.rows[0]?.borrowed_assets ?? 0,
      upcomingMaintenance: maintRes.rows[0]?.upcoming_maintenance ?? 0,
      openReports: damageRes.rows[0]?.open_reports ?? 0,
      categories: catRes.rows,
    };
  } catch {
    return {
      totalAssets: 0,
      borrowedAssets: 0,
      upcomingMaintenance: 0,
      openReports: 0,
      categories: [],
    };
  }
}

export default async function LandingPage({ searchParams }) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user && params?.beranda !== '1') {
    redirect('/dashboard');
  }

  const stats = await getLandingStats();

  return (
    <div className="min-h-screen bg-white text-ink-900">
      <LandingNavbar isLoggedIn={Boolean(user)} />

      {/* Section 1: Hero */}
      <section id="beranda" className="px-6 sm:px-10 pt-24 pb-12">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="relative rounded-[28px] overflow-hidden min-h-[320px] lg:min-h-[600px] bg-ink-900">
            <Image
              src="/images/lab-hero.jpg"
              alt="Ruang laboratorium komputer dan perangkat jaringan kampus yang tertata rapi"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>

          <div className="rounded-[28px] bg-cream-100 p-8 sm:p-12 flex flex-col justify-between gap-10">
            <div className="space-y-6">
              <h1 className="text-[clamp(40px,5.5vw,72px)] font-semibold tracking-[-0.035em] leading-[1.02] text-ink-900">
                Aset laboratorium tercatat, terlacak, dan terawat.
              </h1>
              <p className="text-base text-ink-600 leading-relaxed max-w-[52ch]">
                Satu sistem untuk inventaris, peminjaman, pengembalian, dan pemeliharaan peralatan laboratorium perguruan tinggi.
              </p>
              <div>
                <ArrowPill href="#fitur">Lihat semua fitur</ArrowPill>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-line-200">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-lime-400 text-ink-900 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl font-bold tracking-tight tabular-nums">
                    {formatNumber(stats.totalAssets)}
                  </span>
                  <span className="text-[11px] font-medium">aset</span>
                </div>
                <div className="text-sm text-ink-600">
                  <div className="font-semibold text-ink-900">Aset tercatat</div>
                  <div>Terhubung langsung ke database</div>
                </div>
              </div>
              <DemoTriggerButton />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tentang LIMMS (3 Pilar) */}
      <section className="px-6 sm:px-10 py-14">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <span className="inline-flex items-center self-start px-3.5 py-1.5 rounded-full bg-cream-100 text-xs font-semibold text-ink-900">
              Tentang LIMMS
            </span>
            <h2 className="text-[clamp(30px,4vw,44px)] font-semibold tracking-[-0.03em] leading-[1.08] max-w-2xl">
              Satu sistem untuk seluruh siklus hidup aset laboratorium
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Dark */}
            <Link
              href="/aset"
              className="group rounded-[28px] bg-ink-900 text-white p-8 min-h-[340px] flex flex-col justify-between transition-colors hover:bg-ink-700"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/15">
                  <span className="text-xs font-semibold text-lime-400">01</span>
                  <Package className="w-5 h-5 text-lime-400" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">Inventaris</h3>
                <p className="mt-3 text-sm text-[#C9CCBD] leading-relaxed">
                  Daftarkan aset, kelompokkan per kategori, dan catat lokasi serta kondisinya.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-semibold underline underline-offset-4">Lihat aset</span>
              </div>
            </Link>

            {/* Pillar 2: Lime */}
            <Link
              href="/peminjaman"
              className="group rounded-[28px] bg-lime-400 text-ink-900 p-8 min-h-[340px] flex flex-col justify-between transition-colors hover:bg-lime-500"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-ink-900/15">
                  <span className="text-xs font-semibold">02</span>
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">Peminjaman</h3>
                <p className="mt-3 text-sm text-ink-700 leading-relaxed">
                  Catat peminjaman dan pengembalian. Aset yang sedang dipinjam tidak bisa dipinjam dua kali.
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm font-semibold underline underline-offset-4">Lihat alur</span>
              </div>
            </Link>

            {/* Pillar 3: Photo */}
            <Link
              href="/pemeliharaan"
              className="group relative rounded-[28px] overflow-hidden text-white p-8 min-h-[340px] flex flex-col justify-between bg-ink-900"
            >
              <Image
                src="/images/lab-pillar.jpg"
                alt="Peralatan laboratorium yang dirawat berkala"
                fill
                className="object-cover"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/50 to-ink-900/30" />
              <div className="relative z-10">
                <div className="flex items-center justify-between pb-4 border-b border-white/20">
                  <span className="text-xs font-semibold text-lime-400">03</span>
                  <Wrench className="w-5 h-5 text-lime-400" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">Pemeliharaan</h3>
                <p className="mt-3 text-sm text-white/85 leading-relaxed">
                  Atur jadwal, catat kerusakan, dan terima pengingat sebelum jadwal tiba.
                </p>
              </div>
              <div className="relative z-10 flex items-center justify-between pt-4">
                <span className="text-sm font-semibold underline underline-offset-4">Lihat jadwal</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: Baris Kategori (Pill) */}
      <section className="px-6 sm:px-10 py-6">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
            {(stats.categories.length > 0
              ? stats.categories
              : [
                  { id: '1', name: 'Komputer' },
                  { id: '2', name: 'Perangkat Jaringan' },
                  { id: '3', name: 'Proyektor' },
                  { id: '4', name: 'Alat Praktikum' },
                  { id: '5', name: 'Perangkat Pendukung' },
                ]
            ).map((cat) => (
              <Link
                key={cat.id}
                href={`/aset?kategori=${encodeURIComponent(cat.name)}`}
                className="snap-start shrink-0 h-11 px-5 rounded-full border border-line-200 bg-white hover:bg-cream-100 inline-flex items-center gap-2.5 text-sm font-medium text-ink-900 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-lime-500" />
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Statistik Gelap */}
      <section className="px-6 sm:px-10 pb-6">
        <div className="max-w-[1240px] mx-auto relative rounded-[28px] overflow-hidden bg-ink-900 text-white p-8 sm:p-14">
          <Image
            src="/images/lab-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-15"
            sizes="1240px"
          />
          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-lime-400">
                Ringkasan Langsung
              </span>
              <span className="text-xs text-[#C9CCBD]">Data contoh (sintetis) dari database</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { val: stats.totalAssets, label: 'Aset tercatat', offset: 'lg:pt-0' },
                { val: stats.borrowedAssets, label: 'Sedang dipinjam', offset: 'lg:pt-12' },
                { val: stats.openReports, label: 'Laporan terbuka', offset: 'lg:pt-4' },
                { val: stats.upcomingMaintenance, label: 'Jadwal pekan ini', offset: 'lg:pt-16' },
              ].map((item) => (
                <div key={item.label} className={`border-l border-white/20 pl-5 ${item.offset}`}>
                  <span className="block w-2 h-2 rounded-full bg-lime-400 -ml-[25px] mb-4" />
                  <div className="text-[clamp(44px,6vw,88px)] font-medium leading-[0.95] tracking-[-0.04em] tabular-nums">
                    {formatNumber(item.val)}
                  </div>
                  <div className="mt-3 text-sm text-[#C9CCBD]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Fitur Utama (Grid 2x4) */}
      <section id="fitur" className="px-6 sm:px-10 pb-14 pt-30">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-[clamp(30px,4vw,44px)] font-semibold tracking-[-0.03em] leading-[1.08]">
              Delapan fitur inti pengelolaan lab
            </h2>
            <div className="relative rounded-[20px] overflow-hidden h-64 bg-cream-100">
              <Image
                src="/images/lab-pillar.jpg"
                alt="Pemantauan kondisi peralatan laboratorium"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, 100vw"
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-ink-900">
                Pantau kondisi aset
              </span>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {LANDING_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-[20px] border border-line-200 bg-white p-6 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-full bg-lime-100 text-ink-900 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink-900">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink-600 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: Panel Modul Vertikal */}
      <ModulePanels />

      {/* Section 7: Peran Pengguna */}
      <section id="peran" className="px-6 sm:px-10 pt-30">
        <div className="max-w-[1240px] mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-[clamp(30px,4vw,44px)] font-semibold tracking-[-0.03em] leading-[1.08]">
              Dibuat untuk tiga peran
            </h2>
            <p className="mt-3 text-sm text-ink-600">
              Peran usulan sesuai rancangan awal PRD dan skema database.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LANDING_ROLES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.name} className="rounded-[28px] bg-cream-100 p-8 flex flex-col gap-5">
                  <div className="w-12 h-12 rounded-full bg-white text-ink-900 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-ink-900">{r.name}</h3>
                  <ul className="space-y-2.5 text-sm text-ink-600">
                    {r.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-ink-900 shrink-0 mt-0.5" />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 8: Aturan yang Dijaga */}
      <section id="aturan" className="px-6 sm:px-10 pb-16 pt-28">
        <div className="max-w-[1240px] mx-auto rounded-[28px] bg-cream-100 p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
            Aturan konsistensi data yang dijaga sistem
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LANDING_RULES.map((rule) => (
              <div
                key={rule}
                className="flex items-center gap-3.5 bg-white rounded-[16px] px-5 py-4 border border-line-200"
              >
                <span className="w-7 h-7 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </span>
                <span className="text-sm font-medium text-ink-900">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: CTA + Footer */}
      <section className="px-6 sm:px-10 pb-12">
        <div className="max-w-[1240px] mx-auto space-y-6">
          <div className="relative rounded-[28px] overflow-hidden bg-ink-900 text-white p-10 sm:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Image
              src="/images/lab-hero.jpg"
              alt=""
              fill
              className="object-cover opacity-20"
              sizes="1240px"
            />
            <div className="relative z-10 max-w-lg">
              <h2 className="text-[clamp(28px,4vw,44px)] font-semibold tracking-tight leading-[1.08]">
                Siap merapikan inventaris lab?
              </h2>
              <p className="mt-3 text-sm text-[#C9CCBD]">
                Masuk untuk mencatat aset, memproses peminjaman, dan memantau jadwal pemeliharaan.
              </p>
            </div>
            <Link
              href={user ? '/dashboard' : '/masuk'}
              className="relative z-10 h-12 px-7 rounded-full bg-lime-400 text-ink-900 font-semibold text-sm inline-flex items-center hover:bg-lime-500 transition-colors shrink-0"
            >
              {user ? 'Buka Dashboard' : 'Masuk ke LIMMS'}
            </Link>
          </div>

          <footer className="rounded-[28px] bg-ink-900 text-[#C9CCBD] p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/15">
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2.5 text-white">
                  <span className="w-8 h-8 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center">
                    <Hexagon className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-lg">LIMMS</span>
                </div>
                <p className="text-sm max-w-sm leading-relaxed">
                  Laboratory Inventory and Maintenance Management System 
                </p>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-3">Modul</div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/aset" className="hover:text-white">Inventaris Aset</Link></li>
                  <li><Link href="/peminjaman" className="hover:text-white">Peminjaman</Link></li>
                  <li><Link href="/pemeliharaan" className="hover:text-white">Pemeliharaan</Link></li>
                  <li><Link href="/laporan" className="hover:text-white">Laporan</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-white font-semibold text-sm mb-3">Akses</div>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/masuk" className="hover:text-white">Masuk Sistem</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span>Sistem Informasi, Universitas Hasanuddin · 2026</span>
              <span>Dibangun dengan Next.js &amp; PostgreSQL</span>
            </div>
          </footer>
        </div>
      </section>

      <ScrollTopButton />
    </div>
  );
}
