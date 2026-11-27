'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, KeyRound, Eye, EyeOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { USER_ROLES } from '@/lib/status';
import { formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function UsersClient({ users = [], currentUserId }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchQ, setSearchQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('peminjam');
  const [saving, setSaving] = useState(false);

  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetting, setResetting] = useState(false);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter === 'active' && !u.is_active) return false;
    if (statusFilter === 'inactive' && u.is_active) return false;
    if (searchQ.trim()) {
      const q = searchQ.trim().toLowerCase();
      if (!u.name?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const hasFilters = Boolean(searchQ.trim() || roleFilter !== 'all' || statusFilter !== 'all');

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal menambah pengguna.', 'error');
        setSaving(false);
        return;
      }
      showToast('Pengguna ditambahkan');
      setDrawerOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('peminjam');
      setSaving(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setSaving(false);
    }
  }

  async function handleRoleChange(userId, nextRole) {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal mengubah peran.', 'error');
        return;
      }
      showToast('Peran pengguna diperbarui');
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
    }
  }

  async function handleToggleActive() {
    if (!toggleTarget) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/users/${toggleTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !toggleTarget.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal mengubah status akun.', 'error');
        setToggling(false);
        setToggleTarget(null);
        return;
      }
      showToast(toggleTarget.is_active ? 'Akun dinonaktifkan' : 'Akun diaktifkan');
      setToggling(false);
      setToggleTarget(null);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setToggling(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetError('');
    if (resetPassword.length < 6) {
      setResetError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    setResetting(true);
    try {
      const res = await fetch(`/api/users/${resetTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: resetPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error || 'Gagal mereset kata sandi.');
        setResetting(false);
        return;
      }
      showToast(`Kata sandi ${resetTarget.name} berhasil direset`);
      setResetTarget(null);
      setResetPassword('');
      setShowResetPass(false);
      setResetting(false);
    } catch {
      setResetError('Terjadi kesalahan jaringan.');
      setResetting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder="Cari nama atau email..."
              aria-label="Cari pengguna"
              className="w-full h-10 pl-10 pr-3 rounded-full border border-line-200 bg-white text-sm focus:outline-none focus:border-ink-900"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            aria-label="Filter peran pengguna"
            className="h-10 px-3.5 rounded-full border border-line-200 bg-white text-sm"
          >
            <option value="all">Semua peran</option>
            <option value="administrator">Administrator</option>
            <option value="laboran">Laboran</option>
            <option value="peminjam">Peminjam</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter status akun"
            className="h-10 px-3.5 rounded-full border border-line-200 bg-white text-sm"
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQ('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
            >
              Reset
            </Button>
          )}
        </div>

        <Button variant="primary" onClick={() => setDrawerOpen(true)}>
          <Plus className="w-4 h-4" />
          Tambah pengguna
        </Button>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Tidak ada pengguna yang cocok"
          description="Coba ubah kata kunci pencarian atau filter peran/status."
          actionLabel={hasFilters ? 'Reset filter' : undefined}
          onAction={
            hasFilters
              ? () => {
                  setSearchQ('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }
              : undefined
          }
        />
      ) : (
        <div className="rounded-[20px] bg-white border border-line-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-100 text-ink-600 text-[13px] font-semibold">
                <tr className="text-left">
                  <th className="py-3.5 px-5">Nama</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Peran</th>
                  <th className="py-3.5 px-4">Status akun</th>
                  <th className="py-3.5 px-4">Dibuat pada</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-200">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="h-14 hover:bg-cream-50">
                    <td className="px-5 font-semibold text-ink-900">{u.name}</td>
                    <td className="px-4 text-ink-600">{u.email}</td>
                    <td className="px-4">
                      <select
                        aria-label={`Peran ${u.name}`}
                        disabled={u.id === currentUserId}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="h-8 px-2.5 rounded-full border border-line-200 bg-white text-xs font-semibold disabled:bg-cream-100 disabled:text-ink-400 disabled:cursor-not-allowed"
                      >
                        <option value="administrator">Administrator</option>
                        <option value="laboran">Laboran</option>
                        <option value="peminjam">Peminjam</option>
                      </select>
                    </td>
                    <td className="px-4">
                      <Badge
                        label={u.is_active ? 'Aktif' : 'Nonaktif'}
                        variant={u.is_active ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="px-4 tabular-nums text-ink-600">{formatDate(u.created_at)}</td>
                    <td className="px-5 text-right">
                      {u.id !== currentUserId ? (
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setResetTarget(u);
                              setResetPassword('');
                              setResetError('');
                              setShowResetPass(false);
                            }}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            Reset sandi
                          </Button>
                          <Button
                            variant={u.is_active ? 'ghost' : 'secondary'}
                            size="sm"
                            onClick={() => setToggleTarget(u)}
                          >
                            {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                          </Button>
                        </div>
                      ) : (
                        <Badge map={USER_ROLES} value={u.role} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Tambah pengguna baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Nama lengkap" required value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Kata sandi awal"
            type="password"
            required
            minLength={6}
            placeholder="Minimal 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Select label="Peran" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="peminjam">Peminjam</option>
            <option value="laboran">Laboran</option>
            <option value="administrator">Administrator</option>
          </Select>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Simpan pengguna
            </Button>
          </div>
        </form>
      </Drawer>

      <Modal
        open={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        title={
          toggleTarget?.is_active
            ? `Nonaktifkan akun ${toggleTarget?.name}?`
            : `Aktifkan kembali akun ${toggleTarget?.name}?`
        }
        description={
          toggleTarget?.is_active
            ? `${toggleTarget?.name} tidak bisa masuk lagi, namun riwayat transaksi tetap tersimpan.`
            : `${toggleTarget?.name} dapat masuk kembali ke sistem.`
        }
        confirmLabel={toggleTarget?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
        confirmVariant={toggleTarget?.is_active ? 'danger' : 'primary'}
        loading={toggling}
        onConfirm={handleToggleActive}
      />

      <Modal
        open={Boolean(resetTarget)}
        onClose={() => {
          setResetTarget(null);
          setResetPassword('');
          setResetError('');
        }}
        title={`Reset kata sandi ${resetTarget?.name}?`}
        description={`Masukkan kata sandi baru untuk akun ${resetTarget?.email || ''}.`}
        cancelLabel="Batal"
        loading={resetting}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {resetError && (
            <div
              role="alert"
              className="rounded-[12px] bg-status-danger-bg text-status-danger-fg px-3.5 py-2.5 text-sm font-medium"
            >
              {resetError}
            </div>
          )}
          <div className="relative">
            <Input
              label="Kata sandi baru"
              name="reset_password"
              type={showResetPass ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowResetPass((v) => !v)}
              aria-label={showResetPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-3 top-[38px] w-8 h-8 rounded-full flex items-center justify-center text-ink-600 hover:bg-cream-100"
            >
              {showResetPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" variant="primary" loading={resetting}>
              Simpan kata sandi baru
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
