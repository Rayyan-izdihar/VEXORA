'use client';

import { Button } from '@/components/ui/Button';

export default function ErrorPage({ error, reset }) {
  return (
    <div className="rounded-[20px] bg-white border border-line-200 p-8 max-w-lg mx-auto text-center space-y-4 my-12">
      <h2 className="text-xl font-semibold text-ink-900">Data tidak bisa dimuat</h2>
      <p className="text-sm text-ink-600">
        {error?.message || 'Terjadi kendala saat mengambil data dari server.'}
      </p>
      <Button variant="primary" onClick={() => reset()}>
        Coba lagi
      </Button>
    </div>
  );
}
