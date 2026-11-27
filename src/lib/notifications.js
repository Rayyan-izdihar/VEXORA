import { query } from '@/lib/db';
import { formatDate } from '@/lib/format';

const globalForNotif = globalThis;

export async function notifyUsers(
  executor,
  {
    userIds = [],
    title,
    message,
    linkUrl = null,
    loanId = null,
    damageReportId = null,
    maintenanceScheduleId = null,
  }
) {
  const exec = executor?.query ? executor.query.bind(executor) : query;
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return;

  for (const userId of uniqueIds) {
    await exec(
      `INSERT INTO notifications (
         user_id, maintenance_schedule_id, loan_id, damage_report_id,
         title, message, link_url, scheduled_for, sent_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
      [userId, maintenanceScheduleId, loanId, damageReportId, title, message, linkUrl]
    );
  }
}

export async function notifyStaff(
  executor,
  {
    title,
    message,
    linkUrl = null,
    loanId = null,
    damageReportId = null,
    excludeUserId = null,
  }
) {
  const exec = executor?.query ? executor.query.bind(executor) : query;
  const { rows } = await exec(
    `SELECT id FROM users WHERE role IN ('administrator', 'laboran') AND is_active = TRUE`
  );
  const staffIds = rows
    .map((r) => r.id)
    .filter((id) => !excludeUserId || id !== excludeUserId);

  await notifyUsers(executor, {
    userIds: staffIds,
    title,
    message,
    linkUrl,
    loanId,
    damageReportId,
  });
}

export async function syncOverdueLoanNotifications() {
  const nowMs = Date.now();
  const lastSync = globalForNotif.__limmsLastOverdueSync || 0;
  if (nowMs - lastSync < 60000) return;
  globalForNotif.__limmsLastOverdueSync = nowMs;

  try {
    const [dueLoansRes, staffRes] = await Promise.all([
      query(`
        SELECT l.id, l.loan_code, l.borrower_id, l.expected_return_date, u.name AS borrower_name,
               (CURRENT_DATE - l.expected_return_date)::int AS days_late
        FROM loans l
        JOIN users u ON u.id = l.borrower_id
        WHERE l.status IN ('borrowed', 'overdue')
          AND l.expected_return_date <= CURRENT_DATE
      `),
      query(`
        SELECT id FROM users
        WHERE role IN ('administrator', 'laboran') AND is_active = TRUE
      `),
    ]);

    if (dueLoansRes.rows.length === 0) return;
    const staffIds = staffRes.rows.map((r) => r.id);

    for (const loan of dueLoansRes.rows) {
      const daysLate = Number(loan.days_late || 0);
      const isOverdue = daysLate > 0;
      const title = isOverdue
        ? 'Pengingat: Peminjaman terlambat'
        : 'Pengingat: Jatuh tempo pengembalian hari ini';

      const borrowerMsg = isOverdue
        ? `Transaksi ${loan.loan_code} telah melewati rencana kembali (${formatDate(loan.expected_return_date)}, terlambat ${daysLate} hari). Segera kembalikan peralatan ke laboratorium.`
        : `Transaksi ${loan.loan_code} jatuh tempo pengembalian hari ini (${formatDate(loan.expected_return_date)}).`;

      const staffMsg = isOverdue
        ? `Transaksi ${loan.loan_code} oleh ${loan.borrower_name} terlambat ${daysLate} hari (rencana kembali ${formatDate(loan.expected_return_date)}).`
        : `Transaksi ${loan.loan_code} oleh ${loan.borrower_name} jatuh tempo pengembalian hari ini.`;

      const linkUrl = `/peminjaman/${loan.id}`;

      const targets = [{ userId: loan.borrower_id, message: borrowerMsg }];
      for (const sid of staffIds) {
        if (sid !== loan.borrower_id) {
          targets.push({ userId: sid, message: staffMsg });
        }
      }

      for (const target of targets) {
        await query(
          `INSERT INTO notifications (user_id, loan_id, title, message, link_url, scheduled_for, sent_at)
           SELECT $1, $2, $3, $4, $5, NOW(), NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM notifications
             WHERE user_id = $1
               AND loan_id = $2
               AND title = $3
               AND created_at::date = CURRENT_DATE
           )`,
          [target.userId, loan.id, title, target.message, linkUrl]
        );
      }
    }
  } catch (err) {
    globalForNotif.__limmsLastOverdueSync = 0;
    throw err;
  }
}
