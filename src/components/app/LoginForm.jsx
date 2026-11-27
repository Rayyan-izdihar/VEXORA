'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Email atau kata sandi tidak cocok.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Perubahan belum tersimpan. Periksa koneksi lalu coba lagi.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-[12px] bg-status-danger-bg text-status-danger-fg px-4 py-3 text-sm font-medium"
        >
          {error}
        </div>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="nama@limms.ac.id"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="relative">
        <Input
          label="Kata sandi"
          name="password"
          type={showPass ? 'text' : 'password'}
          required
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="pr-12"
        />
        <button
          type="button"
          onClick={() => setShowPass((v) => !v)}
          aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          className="absolute right-3 top-[38px] w-8 h-8 rounded-full flex items-center justify-center text-ink-600 hover:bg-cream-100"
        >
          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
        Masuk
      </Button>

      <p className="text-sm text-ink-600 text-center">
        Belum punya akun?{' '}
        <Link href="/daftar" className="font-semibold text-ink-900 underline underline-offset-4">
          Daftar sekarang
        </Link>
      </p>

      <div className="rounded-[12px] bg-cream-100 p-3.5 text-xs text-ink-600 space-y-1">
        <p className="font-semibold text-ink-900">Akun contoh (data sintetis):</p>
        <p>Admin: <code className="text-ink-900">admin@limms.ac.id</code> / <code>admin123</code></p>
        <p>Laboran: <code className="text-ink-900">laboran@limms.ac.id</code> / <code>laboran123</code></p>
        <p>Peminjam: <code className="text-ink-900">mahasiswa@limms.ac.id</code> / <code>mhs123</code></p>
      </div>

      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      </div>
    </form>
  );
}
