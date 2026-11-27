import { requireUser } from '@/lib/auth';
import { ProfileClient } from '@/components/app/ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Profil</h1>
        <p className="text-sm text-ink-600">
          Kelola informasi akun dan kata sandi Anda
        </p>
      </div>
      <ProfileClient user={user} />
    </div>
  );
}
