import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';

function isValidIsoDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const parsed = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === str;
}

export async function GET(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const loanDate = String(searchParams.get('loan_date') || '').slice(0, 10);
    const expectedReturnDate = String(searchParams.get('expected_return_date') || '').slice(0, 10);

    if (!isValidIsoDate(loanDate) || !isValidIsoDate(expectedReturnDate)) {
      return NextResponse.json({ error: 'Format tanggal tidak valid.' }, { status: 400 });
    }
    if (expectedReturnDate < loanDate) {
      return NextResponse.json(
        { error: 'Tanggal kembali harus sama dengan atau setelah tanggal pinjam.' },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `SELECT li.asset_id, l.loan_code,
              TO_CHAR(l.loan_date, 'YYYY-MM-DD') AS loan_date,
              TO_CHAR(l.expected_return_date, 'YYYY-MM-DD') AS expected_return_date,
              l.status
       FROM loan_items li
       JOIN loans l ON l.id = li.loan_id
       WHERE l.status IN ('pending', 'approved', 'borrowed', 'overdue')
         AND li.item_status IN ('requested', 'approved', 'borrowed')
         AND l.loan_date <= $1::date
         AND GREATEST(
           l.expected_return_date,
           CASE WHEN l.status IN ('borrowed', 'overdue') THEN CURRENT_DATE ELSE l.expected_return_date END
         ) >= $2::date`,
      [expectedReturnDate, loanDate]
    );

    const conflicts = {};
    for (const row of rows) {
      if (!conflicts[row.asset_id]) {
        conflicts[row.asset_id] = row;
      }
    }

    return NextResponse.json({ conflicts });
  } catch (err) {
    console.error('Availability check error:', err);
    return NextResponse.json({ error: 'Gagal memeriksa ketersediaan jadwal.' }, { status: 500 });
  }
}
