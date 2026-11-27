'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function NotificationsClient({ notifications = [] }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const items =
    filter === 'unread' ? notifications.filter((n) => !n.read_at) : notifications;

  async function markAllRead() {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
      if (!res.ok) {
        showToast('Gagal menandai semua notifikasi.', 'error');
        return;
      }
      showToast('Semua notifikasi ditandai dibaca');
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function markOneRead(id) {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        showToast('Gagal menandai notifikasi.', 'error');
        return;
      }
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full bg-cream-100 p-1">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`h-9 px-5 rounded-full text-sm font-semibold ${filter === 'all' ? 'bg-ink-900 text-white' : 'text-ink-700'
              }`}
          >
            Semua ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`h-9 px-5 rounded-full text-sm font-semibold ${filter === 'unread' ? 'bg-ink-900 text-white' : 'text-ink-700'
              }`}
          >
            Belum dibaca ({unreadCount})
          </button>
        </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={markAllRead}
            disabled={unreadCount === 0 || loading}
          >
            <CheckCheck className="w-4 h-4" />
            Tandai semua dibaca
          </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Belum ada notifikasi"
          description="Pengingat jadwal pemeliharaan akan muncul di sini."
        />
      ) : (
        <div className="rounded-[20px] bg-white border border-line-200 divide-y divide-line-200 overflow-hidden">
          {items.map((n) => {
            const unread = !n.read_at;
            return (
              <div
                key={n.id}
                className={`p-5 flex flex-wrap items-start justify-between gap-4 ${unread ? 'bg-lime-100/70' : ''
                  }`}
              >
                <div className="flex items-start gap-3">
                  {unread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-ink-900 mt-1.5 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-ink-900">{n.title}</h3>
                    <p className="text-sm text-ink-600 mt-0.5">{n.message}</p>
                    <div className="text-xs text-ink-400 mt-1.5">
                      {formatRelativeTime(n.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(() => {
                    const targetUrl =
                      n.link_url || (n.maintenance_schedule_id ? '/pemeliharaan' : null);
                    if (!targetUrl) return null;
                    const linkLabel = targetUrl.startsWith('/peminjaman')
                      ? 'Lihat transaksi'
                      : targetUrl.startsWith('/kerusakan')
                        ? 'Lihat laporan'
                        : targetUrl.startsWith('/pemeliharaan')
                          ? 'Lihat jadwal'
                          : 'Lihat detail';
                    return (
                      <Link
                        href={targetUrl}
                        className="text-xs font-semibold text-ink-900 underline"
                      >
                        {linkLabel}
                      </Link>
                    );
                  })()}
                  {unread && (
                    <Button variant="ghost" size="sm" onClick={() => markOneRead(n.id)}>
                      Tandai dibaca
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
