import { redirect } from 'next/navigation';
import Image from 'next/image';
import { Hexagon } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { LoginForm } from '@/components/app/LoginForm';

export default async function MasukPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="flex flex-col justify-center px-2 sm:px-6 py-4">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-9 h-9 rounded-full bg-lime-400 text-ink-900 inline-flex items-center justify-center">
              <Hexagon className="w-5 h-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-ink-900">LIMMS</span>
          </div>

          <h1 className="text-[32px] font-semibold tracking-tight text-ink-900 leading-tight">
            Masuk ke LIMMS
          </h1>
          <p className="mt-2 text-base text-ink-600 mb-8">
            Kelola aset laboratorium dari satu tempat.
          </p>

          <LoginForm />
        </div>

        <div className="hidden lg:flex relative rounded-[28px] overflow-hidden bg-ink-900 min-h-[540px] p-9 flex-col justify-between">
          <Image
            src="/images/lab-hero.jpg"
            alt=""
            fill
            className="object-cover opacity-35"
            sizes="(min-width: 1024px) 50vw, 0px"
          />
          <div className="relative z-10 inline-flex items-center gap-2 self-start rounded-full bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white border border-white/15">
            Laboratory Inventory & Maintenance
          </div>
          <div className="relative z-10 flex items-end justify-between gap-4">
            <p className="text-2xl font-semibold text-white leading-snug max-w-sm">
              Dari peminjaman sampai pemeliharaan, semua tercatat.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
