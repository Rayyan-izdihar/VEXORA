import { requireUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { syncOverdueLoanNotifications } from '@/lib/notifications';
import { AppShell } from '@/components/app/AppShell';

export const dynamic = 'force-dynamic';

export default async function AplikasiLayout({ children }) {
  const user = await requireUser();

  let unreadNotifications = 0;

  try {
    await syncOverdueLoanNotifications().catch(() => {});
    const notifCountRes = await query(
      `SELECT COUNT(*)::int AS cnt FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [user.id]
    );

    unreadNotifications = notifCountRes.rows[0]?.cnt ?? 0;
  } catch {
    // ignore if DB not yet migrated
  }

  return (
    <AppShell
      user={user}
      badges={{ unreadNotifications }}
    >
      {children}
    </AppShell>
  );
}
