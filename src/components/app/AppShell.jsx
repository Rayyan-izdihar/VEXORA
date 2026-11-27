'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Hexagon,
  LayoutDashboard,
  Package,
  Tags,
  ArrowLeftRight,
  RotateCcw,
  Wrench,
  AlertTriangle,
  Bell,
  FileSpreadsheet,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export function AppShell({ user, badges, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);

  const isStaff = user.role === 'administrator' || user.role === 'laboran';
  const isAdmin = user.role === 'administrator';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { href: '/aset', label: 'Aset', icon: Package, show: true },
    { href: '/referensi', label: 'Kategori & Lokasi', icon: Tags, show: isStaff },
    { href: '/peminjaman', label: 'Peminjaman', icon: ArrowLeftRight, show: true },
    { href: '/pengembalian', label: 'Pengembalian', icon: RotateCcw, show: isStaff },
    { href: '/pemeliharaan', label: 'Pemeliharaan', icon: Wrench, show: isStaff },
    {
      href: '/kerusakan',
      label: 'Laporan Kerusakan',
      icon: AlertTriangle,
      show: true,
    },
    {
      href: '/notifikasi',
      label: 'Notifikasi',
      icon: Bell,
      show: true,
      badge: badges.unreadNotifications,
    },
    { href: '/laporan', label: 'Laporan', icon: FileSpreadsheet, show: isStaff },
    { href: '/pengguna', label: 'Pengguna', icon: Users, show: isAdmin, divider: true },
    { href: '/profil', label: 'Profil', icon: User, show: true },
  ].filter((item) => item.show);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network error and still navigate to login
    } finally {
      router.push('/masuk');
      router.refresh();
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        <Link
          href="/?beranda=1"
          title="Lihat Beranda"
          className="flex items-center gap-2.5 px-3 py-2 mb-6"
        >
          <span className="w-8 h-8 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center shrink-0">
            <Hexagon className="w-4 h-4" />
          </span>
          <span className="font-bold text-white tracking-tight text-lg">LIMMS</span>
        </Link>

        <nav aria-label="Menu aplikasi" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <div key={item.href}>
                {item.divider && <div className="my-3 border-t border-white/15" />}
                <Link
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors ${active
                      ? 'bg-lime-400 text-ink-900 font-semibold'
                      : 'text-[#C9CCBD] hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge > 0 && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${active ? 'bg-ink-900 text-white' : 'bg-lime-400 text-ink-900'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-white/15">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium text-[#C9CCBD] hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-cream-50">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-[264px] shrink-0 p-3">
        <div className="sticky top-3 h-[calc(100vh-24px)] rounded-[28px] bg-ink-900 overflow-y-auto">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {mobileMenu && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-ink-900/50" onClick={() => setMobileMenu(false)} />
          <div className="relative z-10 w-[264px] bg-ink-900 h-full overflow-y-auto">
            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              aria-label="Tutup menu"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="no-print lg:hidden sticky top-0 z-30 bg-cream-50/95 backdrop-blur border-b border-line-200 px-4 h-14 flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Buka menu navigasi"
            className="w-10 h-10 rounded-full border border-line-200 bg-white flex items-center justify-center text-ink-900"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
