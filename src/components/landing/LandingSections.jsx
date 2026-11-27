'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Hexagon,
  Menu,
  X,
  Play,
  ArrowUp,
} from 'lucide-react';
import { ArrowPill } from '@/components/ui/ArrowPill';

export function LandingNavbar({ isLoggedIn }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6">
      <nav
        aria-label="Navigasi utama"
        className="max-w-[1240px] mx-auto h-14 px-3 sm:px-5 rounded-full bg-white/95 backdrop-blur border border-line-200 flex items-center justify-between gap-4 shadow-sm"
      >
        <Link
          href={isLoggedIn ? '/?beranda=1' : '/'}
          className="flex items-center gap-2.5 shrink-0"
        >
          <span className="w-8 h-8 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center">
            <Hexagon className="w-4 h-4" />
          </span>
          <span className="font-bold tracking-tight text-ink-900">LIMMS</span>
        </Link>

        <span className="hidden md:inline-flex items-center px-3.5 py-1 rounded-full bg-cream-100 border border-line-200 text-xs font-medium text-ink-700">
          Sistem Inventaris &amp; Pemeliharaan Lab
        </span>

        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="h-10 px-5 rounded-full bg-lime-400 text-ink-900 font-semibold text-sm inline-flex items-center hover:bg-lime-500 transition-colors"
            >
              Buka Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/masuk"
                className="px-3 py-2 text-sm font-semibold text-ink-900 hover:text-ink-700"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="h-10 px-5 rounded-full bg-lime-400 text-ink-900 font-semibold text-sm inline-flex items-center hover:bg-lime-500 transition-colors"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Buka menu navigasi"
          className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-ink-900 hover:bg-cream-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900 text-white p-6 flex flex-col justify-between md:hidden">
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">LIMMS</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ul className="space-y-4 text-2xl font-semibold">
            {navLinks.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 hover:text-lime-400"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="space-y-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="h-12 rounded-full bg-lime-400 text-ink-900 font-semibold flex items-center justify-center"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/masuk"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 rounded-full bg-lime-400 text-ink-900 font-semibold flex items-center justify-center"
                >
                  Masuk ke LIMMS
                </Link>
                <Link
                  href="/daftar"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 rounded-full border border-white/25 text-white font-semibold flex items-center justify-center hover:bg-white/10"
                >
                  Daftar akun
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function ModulePanels() {
  const [active, setActive] = useState(0);

  const modules = [
    {
      num: '01',
      title: 'Inventaris',
      desc: 'Registrasi aset dengan kode unik, kategorisasi, pencatatan lokasi ruangan, dan pemantauan kondisi fisik secara terstruktur.',
      href: '/aset',
      cta: 'Lihat aset',
    },
    {
      num: '02',
      title: 'Peminjaman',
      desc: 'Pengajuan peminjaman multi-aset, persetujuan laboran, penguncian transaksi agar tidak bentrok, serta pengembalian per item.',
      href: '/peminjaman',
      cta: 'Lihat peminjaman',
    },
    {
      num: '03',
      title: 'Pemeliharaan',
      desc: 'Penjadwalan perawatan berkala, pelaporan kerusakan oleh pengguna, serta pengingat jadwal in-app sebelum hari pelaksanaan.',
      href: '/pemeliharaan',
      cta: 'Lihat jadwal',
    },
    {
      num: '04',
      title: 'Laporan',
      desc: 'Dashboard ringkasan real-time dan laporan inventaris, pemeliharaan, kerusakan, serta peminjaman siap ekspor CSV atau cetak.',
      href: '/laporan',
      cta: 'Lihat laporan',
    },
  ];

  return (
    <section id="modul" className="bg-ink-900 text-white py-24 px-6 sm:px-10 mt-20">
      <div className="max-w-[1240px] mx-auto">
        <h2 className="text-[clamp(32px,4vw,48px)] font-semibold tracking-tight leading-[1.08] mb-10">
          Empat modul, satu alur kerja
        </h2>

        {/* Desktop horizontal expandable panels */}
        <div className="hidden md:flex gap-4 h-[420px]">
          {modules.map((mod, idx) => {
            const isOpen = active === idx;
            return (
              <div
                key={mod.num}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => setActive(idx)}
                onMouseEnter={() => setActive(idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActive(idx);
                  }
                }}
                className={`relative rounded-[20px] overflow-hidden border border-white/15 bg-ink-700/60 cursor-pointer transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 flex flex-col justify-between p-6 ${isOpen ? 'flex-[3]' : 'flex-[0.85] hover:bg-ink-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-lime-400 tracking-wider">
                    {mod.num}
                  </span>
                </div>

                {isOpen ? (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-white">{mod.title}</h3>
                    <p className="text-sm text-[#C9CCBD] max-w-md leading-relaxed">
                      {mod.desc}
                    </p>
                    <ArrowPill href={mod.href}>{mod.cta}</ArrowPill>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-lg font-semibold text-white whitespace-nowrap -rotate-90 origin-center">
                      {mod.title}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden space-y-3">
          {modules.map((mod, idx) => {
            const isOpen = active === idx;
            return (
              <div
                key={mod.num}
                className="rounded-[20px] border border-white/15 bg-ink-700/50 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setActive(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-semibold"
                >
                  <span>
                    <span className="text-lime-400 mr-3 text-xs">{mod.num}</span>
                    {mod.title}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 space-y-3">
                    <p className="text-sm text-[#C9CCBD]">{mod.desc}</p>
                    <ArrowPill href={mod.href}>{mod.cta}</ArrowPill>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Kembali ke atas"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-lime-400 text-ink-900 shadow-[var(--shadow-pop)] flex items-center justify-center hover:bg-lime-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

export function DemoTriggerButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-11 pl-4 pr-5 rounded-full bg-ink-900 text-white text-sm font-semibold inline-flex items-center gap-2.5 hover:bg-ink-700 transition-colors"
      >
        <span className="w-6 h-6 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center">
          <Play className="w-3 h-3 fill-current" />
        </span>
        Tonton demo
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panduan singkat demo LIMMS"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-[28px] max-w-lg w-full p-7 shadow-[var(--shadow-pop)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-ink-900">Alur Demonstrasi LIMMS</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full border border-line-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed mb-4">
              Masuk dengan akun contoh untuk mencoba seluruh alur:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-ink-900 mb-6">
              <li><strong>Peminjam</strong> mengajukan peminjaman multi-aset &amp; laporan kerusakan.</li>
              <li><strong>Laboran</strong> menyetujui, menyerahkan aset, mencatat pengembalian, dan menjadwalkan pemeliharaan.</li>
              <li><strong>Administrator</strong> meninjau laporan aset dan mengelola pengguna.</li>
            </ol>
            <div className="flex justify-end gap-3">
              <ArrowPill href="/masuk" dark>
                Masuk sekarang
              </ArrowPill>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
