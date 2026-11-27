'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { USER_ROLES } from '@/lib/status';
import { useToast } from '@/components/ui/Toast';

export function ProfileClient({ user }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          current_password: currentPassword || undefined,
          new_password: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Gagal memperbarui profil.', 'error');
        setSaving(false);
        return;
      }
      showToast('Profil berhasil diperbarui');
      setCurrentPassword('');
      setNewPassword('');
      setSaving(false);
      router.refresh();
    } catch {
      showToast('Terjadi kesalahan jaringan.', 'error');
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <Card className="p-6 flex flex-col items-center text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-ink-900 text-lime-400 font-bold text-2xl flex items-center justify-center">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-ink-900">{user.name}</h2>
          <p className="text-sm text-ink-600">{user.email}</p>
        </div>
        <Badge map={USER_ROLES} value={user.role} />
      </Card>

      <Card className="lg:col-span-2 p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Nama lengkap"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={user.email}
            disabled
          />

          <div className="pt-4 border-t border-line-200 space-y-4">
            <h3 className="text-sm font-semibold text-ink-900">
              Ubah kata sandi (opsional)
            </h3>
            <Input
              label="Kata sandi saat ini"
              name="current_password"
              type="password"
              autoComplete="current-password"
              placeholder="Kosongkan jika tidak ingin mengubah kata sandi"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="Kata sandi baru"
              name="new_password"
              type="password"
              minLength={6}
              autoComplete="new-password"
              placeholder="Minimal 6 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" loading={saving}>
              Simpan perubahan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
