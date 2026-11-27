import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { AppShell } from '@/components/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function AplikasiLayout({ children }) {
  const user = await requireUser();

  let unreadNotifications = 0;
  let openDamage = 0;
  let recentNotifications = [];

  try {
    const [notifCountRes, damageCountRes, recentNotifRes] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
        [user.id]
      ),
      query(`SELECT COUNT(*)::int AS cnt FROM damage_reports WHERE status != 'resolved'`),
      query(
        `SELECT id, title, message, read_at, created_at
         FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [user.id]
      ),
    ]);

    unreadNotifications = notifCountRes.rows[0]?.cnt ?? 0;
    openDamage = damageCountRes.rows[0]?.cnt ?? 0;
    recentNotifications = recentNotifRes.rows;
  } catch {
    // ignore if DB not yet migrated
  }

  return (
    <AppShell
      user={user}
      badges={{ unreadNotifications, openDamage }}
      recentNotifications={recentNotifications}
    >
      {children}
    </AppShell>
  );
}
