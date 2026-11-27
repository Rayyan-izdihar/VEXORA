import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { UsersClient } from '@/components/app/UsersClient';

export const dynamic = 'force-dynamic';

export default async function PenggunaPage() {
  const user = await requireUser(['administrator']);

  const { rows } = await query(`
    SELECT id, name, email, role, is_active, created_at
    FROM users
    ORDER BY created_at ASC
  `);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Pengguna</h1>
        <p className="text-sm text-ink-600">
          Kelola akun, peran akses, dan status keaktifan pengguna LIMMS
        </p>
      </div>
      <UsersClient users={rows} currentUserId={user.id} />
    </div>
  );
}
