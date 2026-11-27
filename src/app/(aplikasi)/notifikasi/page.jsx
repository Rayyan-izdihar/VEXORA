import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { NotificationsClient } from '@/components/app/NotificationsClient';

export const dynamic = 'force-dynamic';

export default async function NotifikasiPage() {
  const user = await requireUser();

  const { rows } = await query(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 100`,
    [user.id]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-semibold tracking-tight text-ink-900">Notifikasi</h1>
        <p className="text-sm text-ink-600">
          Pusat pemberitahuan jadwal pemeliharaan laboratorium
        </p>
      </div>
      <NotificationsClient notifications={rows} />
    </div>
  );
}
