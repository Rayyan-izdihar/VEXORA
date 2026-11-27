import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { syncOverdueLoanNotifications } from '@/lib/notifications';
import { AppShell } from '@/components/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function AplikasiLayout({ children }) {
  const user = await requireUser();
  const isStaff = user.role === 'administrator' || user.role === 'laboran';

  let unreadNotifications = 0;
  let openDamage = 0;

  try {
    await syncOverdueLoanNotifications().catch(() => {});
    const [notifCountRes, damageCountRes] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
        [user.id]
      ),
      isStaff
        ? query(`SELECT COUNT(*)::int AS cnt FROM damage_reports WHERE status != 'resolved'`)
        : Promise.resolve({ rows: [{ cnt: 0 }] }),
    ]);

    unreadNotifications = notifCountRes.rows[0]?.cnt ?? 0;
    openDamage = damageCountRes.rows[0]?.cnt ?? 0;
  } catch {
    // ignore if DB not yet migrated
  }

  return (
    <AppShell
      user={user}
      badges={{ unreadNotifications, openDamage }}
    >
      {children}
    </AppShell>
  );
}
