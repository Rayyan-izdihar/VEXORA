'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES } from '@/lib/status';
import { formatDate } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';

export function UsersClient({ users = [], currentUserId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('peminjam');
  const [saving, setSaving] = useState(false);

  const [toggleTarget, setToggleTarget] = useState(null);
  const [toggling, setToggling] = useState(false);

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
      setSaving(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setSaving(false);
    }
  }

  async function handleRoleChange(userId, nextRole) {
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
  }

  async function handleToggleActive() {
    if (!toggleTarget) return;
    setToggling(true);
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
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="primary" onClick={() => setDrawerOpen(true)}>
          <Plus className="w-4 h-4" />
          Tambah pengguna
        </Button>
      </div>

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
              {users.map((u) => (
                <tr key={u.id} className="h-14 hover:bg-cream-50">
                  <td className="px-5 font-semibold text-ink-900">{u.name}</td>
                  <td className="px-4 text-ink-600">{u.email}</td>
                  <td className="px-4">
                    <select
                      aria-label={`Peran ${u.name}`}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="h-8 px-2.5 rounded-full border border-line-200 bg-white text-xs font-semibold"
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
                      <Button
                        variant={u.is_active ? 'ghost' : 'secondary'}
                        size="sm"
                        onClick={() => setToggleTarget(u)}
                      >
                        {u.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
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
    </div>
  );
}
