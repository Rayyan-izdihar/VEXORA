'use client';

import { useState, useEffect } from 'react';
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
  Search,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { USER_ROLES, getStatusMeta } from '@/lib/status';
import { formatRelativeTime } from '@/lib/format';

export function AppShell({ user, badges, recentNotifications = [], children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

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
      badge: isStaff ? badges.openDamage : 0,
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
  ].filter((item) => item.show);

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('global-asset-search')?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/masuk');
    router.refresh();
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchText.trim();
    router.push(q ? `/aset?q=${encodeURIComponent(q)}` : '/aset');
  }

  const roleMeta = getStatusMeta(USER_ROLES, user.role);

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div>
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2 mb-6">
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
                  className={`flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    active
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
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                        active ? 'bg-ink-900 text-white' : 'bg-lime-400 text-ink-900'
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
        <header className="no-print sticky top-0 z-30 bg-cream-50/95 backdrop-blur border-b border-line-200 px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenu(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden w-10 h-10 rounded-full border border-line-200 bg-white flex items-center justify-center text-ink-900"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-ink-600 hidden sm:inline">
              LIMMS Laboratorium
            </span>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
            <div className="relative">
              <Search
                className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                id="global-asset-search"
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Cari kode atau nama aset... (Ctrl+K)"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-white border border-line-200 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-lime-400"
              />
            </div>
          </form>

          <div className="flex items-center gap-3 relative">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifikasi"
                className="relative w-10 h-10 rounded-full bg-white border border-line-200 flex items-center justify-center text-ink-900 hover:bg-cream-100"
              >
                <Bell className="w-4 h-4" />
                {badges.unreadNotifications > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-lime-400 ring-2 ring-white" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[20px] bg-white border border-line-200 shadow-[var(--shadow-pop)] overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-line-200 flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink-900">Notifikasi Terbaru</span>
                    <Link
                      href="/notifikasi"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-semibold text-ink-900 underline"
                    >
                      Lihat semua
                    </Link>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-line-200">
                    {recentNotifications.length === 0 ? (
                      <div className="p-4 text-sm text-ink-600">Belum ada notifikasi.</div>
                    ) : (
                      recentNotifications.map((n) => (
                        <Link
                          key={n.id}
                          href="/notifikasi"
                          onClick={() => setNotifOpen(false)}
                          className={`block px-4 py-3 hover:bg-cream-50 ${
                            !n.read_at ? 'bg-lime-100/60' : ''
                          }`}
                        >
                          <div className="text-sm font-semibold text-ink-900">{n.title}</div>
                          <div className="text-xs text-ink-600 line-clamp-1 mt-0.5">{n.message}</div>
                          <div className="text-[11px] text-ink-400 mt-1">
                            {formatRelativeTime(n.created_at)}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-line-200">
              <div className="w-9 h-9 rounded-full bg-ink-900 text-lime-400 font-bold text-sm flex items-center justify-center">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-ink-900">{user.name}</div>
                <div className="text-xs text-ink-600">{roleMeta.label}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
