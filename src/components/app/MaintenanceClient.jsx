'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Combobox } from '@/components/ui/Combobox';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { MAINTENANCE_STATUSES } from '@/lib/status';
import { formatDate, formatDateTime, daysOverdue, toLocalDateTimeInputValue } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function MaintenanceClient({
  schedules = [],
  assets = [],
  staffUsers = [],
  preselectedAssetId = '',
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [view, setView] = useState('list'); // 'list' | 'calendar'
  const [statusFilter, setStatusFilter] = useState('all');
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [createOpen, setCreateOpen] = useState(Boolean(preselectedAssetId));
  const [assetId, setAssetId] = useState(preselectedAssetId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState(() => toLocalDateTimeInputValue());
  const [assignedTo, setAssignedTo] = useState(staffUsers[0]?.id || '');
  const [reminderDays, setReminderDays] = useState('1');
  const [saving, setSaving] = useState(false);

  const [detailItem, setDetailItem] = useState(null);
  const [resultNotes, setResultNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const filtered = schedules.filter((s) =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  async function handleCreate(e) {
    e.preventDefault();
      if (!assetId || !title.trim() || !scheduledAt) {
        showToast('Pilih aset, isi judul pemeliharaan, dan tentukan waktu jadwal.', 'error');
        return;
      }
      setSaving(true);
      try {
        const res = await fetch('/api/maintenance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            asset_id: assetId,
            title,
            description,
            scheduled_at: new Date(scheduledAt).toISOString(),
            assigned_to: assignedTo || null,
            reminder_days: Number(reminderDays),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Gagal membuat jadwal.', 'error');
          setSaving(false);
          return;
        }
        showToast('Jadwal dibuat');
        setCreateOpen(false);
        setTitle('');
        setDescription('');
        setSaving(false);
        router.refresh();
      } catch {
        showToast('Terjadi kesalahan jaringan.', 'error');
        setSaving(false);
      }
    }

    async function updateStatus(status) {
      if (!detailItem) return;
      setUpdating(true);
      try {
        const res = await fetch(`/api/maintenance/${detailItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes: resultNotes || undefined }),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || 'Gagal memperbarui status.', 'error');
          setUpdating(false);
          return;
        }
        showToast('Status pemeliharaan diperbarui');
        setDetailItem(null);
        setUpdating(false);
        router.refresh();
      } catch {
        showToast('Terjadi kesalahan jaringan.', 'error');
        setUpdating(false);
      }
    }

    // Monthly calendar calculation for selected month
    const now = new Date();
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = Array.from({ length: firstDay + daysInMonth }, (_, idx) =>
      idx < firstDay ? null : idx - firstDay + 1
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full bg-cream-100 p-1">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`h-9 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 ${view === 'list' ? 'bg-ink-900 text-white' : 'text-ink-700'
                  }`}
              >
                <List className="w-4 h-4" />
                Daftar
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`h-9 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 ${view === 'calendar' ? 'bg-ink-900 text-white' : 'text-ink-700'
                  }`}
              >
                <CalendarIcon className="w-4 h-4" />
                Kalender
              </button>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3.5 rounded-full border border-line-200 bg-white text-sm"
            >
              <option value="all">Semua status</option>
              <option value="scheduled">Terjadwal</option>
              <option value="in_progress">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>

          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4" />
            Jadwalkan pemeliharaan
          </Button>
        </div>

        {view === 'list' ? (
          filtered.length === 0 ? (
            <EmptyState
              icon={CalendarIcon}
              title="Belum ada jadwal pemeliharaan"
              description="Buat jadwal pemeliharaan berkala agar kondisi peralatan tetap terjaga."
              actionLabel="Jadwalkan pemeliharaan"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                    <tr className="text-left">
                      <th className="py-3.5 px-5">Aset</th>
                      <th className="py-3.5 px-4">Pekerjaan</th>
                      <th className="py-3.5 px-4">Waktu terjadwal</th>
                      <th className="py-3.5 px-4">Penanggung jawab</th>
                      <th className="py-3.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-200">
                    {filtered.map((s) => {
                      const late =
                        ['scheduled', 'in_progress'].includes(s.status)
                          ? daysOverdue(s.scheduled_at)
                          : 0;
                      return (
                        <tr
                          key={s.id}
                          onClick={() => {
                            setDetailItem(s);
                            setResultNotes(s.notes || '');
                          }}
                          className="h-14 hover:bg-cream-50 cursor-pointer"
                        >
                          <td className="px-5">
                            <span className="font-semibold tabular-nums text-ink-600 mr-2">
                              {s.asset_code}
                            </span>
                            <span className="font-medium text-ink-900">{s.asset_name}</span>
                          </td>
                          <td className="px-4 font-medium text-ink-900">{s.title}</td>
                          <td className="px-4 tabular-nums">
                            <span className={late > 0 ? 'text-status-danger-fg font-semibold' : 'text-ink-600'}>
                              {formatDateTime(s.scheduled_at)}
                            </span>
                            {late > 0 && (
                              <span className="block text-xs text-status-danger-fg">
                                Terlambat {late} hari
                              </span>
                            )}
                          </td>
                          <td className="px-4 text-ink-600">{s.assigned_name || '-'}</td>
                          <td className="px-5">
                            <Badge map={MAINTENANCE_STATUSES} value={s.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-[20px] bg-white border border-line-200 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold">
                {new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(calMonth)}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Bulan sebelumnya"
                  onClick={() => setCalMonth(new Date(year, month - 1, 1))}
                  className="w-8 h-8 rounded-full border border-line-200 flex items-center justify-center text-ink-700 hover:bg-cream-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Bulan berikutnya"
                  onClick={() => setCalMonth(new Date(year, month + 1, 1))}
                  className="w-8 h-8 rounded-full border border-line-200 flex items-center justify-center text-ink-700 hover:bg-cream-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-ink-600 mb-2 text-center">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[88px] rounded-xl bg-cream-50/50" />;
                const isToday =
                  year === now.getFullYear() &&
                  month === now.getMonth() &&
                  day === now.getDate();
                const dayItems = filtered.filter((s) => {
                  const sd = new Date(s.scheduled_at);
                  return sd.getFullYear() === year && sd.getMonth() === month && sd.getDate() === day;
                });
                return (
                  <div
                    key={day}
                    className="min-h-[88px] rounded-xl border border-line-200 p-2 flex flex-col gap-1 bg-white"
                  >
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center ${isToday ? 'bg-lime-400 text-ink-900' : 'text-ink-700'
                        }`}
                    >
                      {day}
                    </span>
                    {dayItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setDetailItem(item);
                          setResultNotes(item.notes || '');
                        }}
                        className="text-left text-[11px] font-medium px-1.5 py-1 rounded bg-cream-100 hover:bg-lime-100 truncate"
                      >
                        {item.asset_code} · {item.title}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Schedule Drawer */}
        <Drawer
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Jadwalkan pemeliharaan"
          subtitle="Pengingat in-app akan dikirim otomatis ke penanggung jawab"
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <Combobox
              id="maint-asset"
              label="Aset"
              required
              value={assetId}
              onChange={setAssetId}
              options={assets.map((a) => ({
                value: a.id,
                label: `${a.asset_code} — ${a.name}`,
              }))}
            />
            <Input
              label="Judul pekerjaan"
              name="title"
              required
              placeholder="Contoh: Kalibrasi rutin & pembersihan filter"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Waktu terjadwal"
              name="scheduled_at"
              type="datetime-local"
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            <Select
              label="Penanggung jawab"
              name="assigned_to"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
            <Select
              label="Ingatkan sebelum jadwal"
              name="reminder_days"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
            >
              <option value="0">Pada hari H</option>
              <option value="1">1 hari sebelumnya</option>
              <option value="3">3 hari sebelumnya</option>
            </Select>
            <Textarea
              label="Detail pekerjaan"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" loading={saving}>
                Simpan jadwal
              </Button>
            </div>
          </form>
        </Drawer>

        {/* Detail / Transition Drawer */}
        <Drawer
          open={Boolean(detailItem)}
          onClose={() => setDetailItem(null)}
          title={detailItem?.title || 'Detail jadwal'}
          subtitle={
            detailItem ? `${detailItem.asset_code} · ${detailItem.asset_name}` : ''
          }
        >
          {detailItem && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Badge map={MAINTENANCE_STATUSES} value={detailItem.status} />
                <span className="text-xs text-ink-600 tabular-nums">
                  {formatDateTime(detailItem.scheduled_at)}
                </span>
              </div>

              <div className="text-sm text-ink-700">
                <div className="font-semibold text-ink-900 mb-1">Detail pekerjaan</div>
                <p>{detailItem.description || '-'}</p>
              </div>

              {detailItem.completed_at && (
                <div className="text-xs text-ink-600">
                  Selesai pada {formatDate(detailItem.completed_at)}
                </div>
              )}

              <Textarea
                label="Catatan hasil pemeliharaan"
                name="result_notes"
                disabled={['completed', 'cancelled'].includes(detailItem.status)}
                value={resultNotes}
                onChange={(e) => setResultNotes(e.target.value)}
              />

              <div className="flex flex-wrap gap-2 pt-2">
                {detailItem.status === 'scheduled' && (
                  <Button
                    variant="dark"
                    loading={updating}
                    onClick={() => updateStatus('in_progress')}
                  >
                    Mulai pemeliharaan
                  </Button>
                )}
                {['scheduled', 'in_progress'].includes(detailItem.status) && (
                  <>
                    <Button
                      variant="primary"
                      loading={updating}
                      onClick={() => updateStatus('completed')}
                    >
                      Tandai selesai
                    </Button>
                    <Button
                      variant="ghost"
                      loading={updating}
                      onClick={() => updateStatus('cancelled')}
                    >
                      Batalkan jadwal
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Drawer>
      </div>
    );
  }
