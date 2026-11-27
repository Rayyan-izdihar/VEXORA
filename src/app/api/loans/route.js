import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { withTransaction, isValidUuid } from '@/lib/db';
import { requireApiUser } from '@/lib/auth';
import { formatDate, toYmdInTz } from '@/lib/format';
import { notifyUsers, notifyStaff } from '@/lib/notifications';

function isValidIsoDate(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const parsed = new Date(`${str}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === str;
}

export async function POST(request) {
  const auth = await requireApiUser();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const user = auth.user;
  const isStaff = user.role === 'administrator' || user.role === 'laboran';

  try {
    const body = await request.json();
    const assetIds = Array.isArray(body.asset_ids) ? [...new Set(body.asset_ids)] : [];
    const loanDate = String(body.loan_date || '').slice(0, 10);
    const expectedReturnDate = String(body.expected_return_date || '').slice(0, 10);
    const purpose = body.purpose ? String(body.purpose).trim() : null;
    const notes = body.notes ? String(body.notes).trim() : null;
    const borrowerId = isStaff && body.borrower_id ? body.borrower_id : user.id;
    const directBorrow = isStaff && body.direct_borrow === true;

    if (assetIds.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal satu aset.' }, { status: 400 });
    }
    if (!assetIds.every(isValidUuid)) {
      return NextResponse.json({ error: 'Format ID aset tidak valid.' }, { status: 400 });
    }
    if (!isValidUuid(borrowerId)) {
      return NextResponse.json({ error: 'Format ID peminjam tidak valid.' }, { status: 400 });
    }
    if (!loanDate || !expectedReturnDate) {
      return NextResponse.json(
        { error: 'Tanggal pinjam dan rencana kembali wajib diisi.' },
        { status: 400 }
      );
    }
    if (!isValidIsoDate(loanDate) || !isValidIsoDate(expectedReturnDate)) {
      return NextResponse.json(
        { error: 'Format tanggal tidak valid.' },
        { status: 400 }
      );
    }
    if (expectedReturnDate < loanDate) {
      return NextResponse.json(
        { error: 'Tanggal kembali harus sama dengan atau setelah tanggal pinjam.' },
        { status: 400 }
      );
    }

    const result = await withTransaction(async (client) => {
      const { rows: borrowerRows } = await client.query(
        `SELECT id, name, is_active FROM users WHERE id = $1 LIMIT 1`,
        [borrowerId]
      );
      const borrower = borrowerRows[0];
      if (!borrower || !borrower.is_active) {
        return {
          error: 'Peminjam tidak ditemukan atau akun sedang nonaktif.',
          status: 400,
        };
      }

      // Lock selected assets in deterministic order to prevent deadlocks
      const { rows: lockedAssets } = await client.query(
        `SELECT id, asset_code, name, condition, status
         FROM assets
         WHERE id = ANY($1::uuid[])
         ORDER BY id ASC
         FOR UPDATE`,
        [assetIds]
      );

      if (lockedAssets.length !== assetIds.length) {
        return { error: 'Sebagian aset tidak ditemukan.', status: 404 };
      }

      const inactiveAssets = lockedAssets.filter((a) => a.status === 'inactive');
      if (inactiveAssets.length > 0) {
        const names = inactiveAssets.map((a) => `${a.name} (${a.asset_code})`).join(', ');
        return {
          error: `${names} berstatus Nonaktif dan tidak dapat dipinjam.`,
          conflictAssetIds: inactiveAssets.map((a) => a.id),
          status: 409,
        };
      }

      if (directBorrow) {
        const unavailable = lockedAssets.filter((a) => a.status !== 'available');
        if (unavailable.length > 0) {
          const names = unavailable.map((a) => `${a.name} (${a.asset_code})`).join(', ');
          return {
            error: `${names} sedang tidak tersedia untuk diserahkan langsung.`,
            conflictAssetIds: unavailable.map((a) => a.id),
            status: 409,
          };
        }
      } else {
        const todayYmd = toYmdInTz(new Date());
        if (loanDate <= todayYmd) {
          const inMaint = lockedAssets.filter((a) => a.status === 'maintenance');
          if (inMaint.length > 0) {
            const names = inMaint.map((a) => `${a.name} (${a.asset_code})`).join(', ');
            return {
              error: `${names} sedang dalam pemeliharaan. Pilih tanggal lain atau aset lain.`,
              conflictAssetIds: inMaint.map((a) => a.id),
              status: 409,
            };
          }
        }
      }

      const { rows: overlapping } = await client.query(
        `SELECT li.asset_id, a.asset_code, a.name,
                l.loan_code, l.loan_date, l.expected_return_date
         FROM loan_items li
         JOIN loans l ON l.id = li.loan_id
         JOIN assets a ON a.id = li.asset_id
         WHERE li.asset_id = ANY($1::uuid[])
           AND l.status IN ('pending', 'approved', 'borrowed', 'overdue')
           AND li.item_status IN ('requested', 'approved', 'borrowed')
           AND l.loan_date <= $2::date
           AND GREATEST(
             l.expected_return_date,
             CASE WHEN l.status IN ('borrowed', 'overdue') THEN (NOW() AT TIME ZONE 'Asia/Makassar')::date ELSE l.expected_return_date END
           ) >= $3::date`,
        [assetIds, expectedReturnDate, loanDate]
      );

      if (overlapping.length > 0) {
        const conflictMap = new Map();
        for (const row of overlapping) {
          if (!conflictMap.has(row.asset_id)) {
            conflictMap.set(
              row.asset_id,
              `${row.name} (${row.asset_code}, ${formatDate(row.loan_date)} – ${formatDate(row.expected_return_date)})`
            );
          }
        }
        return {
          error: `Jadwal bentrok pada rentang tanggal tersebut untuk: ${[...conflictMap.values()].join('; ')}.`,
          conflictAssetIds: [...conflictMap.keys()],
          status: 409,
        };
      }

      const loanCode = `LN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      const loanStatus = directBorrow ? 'borrowed' : 'pending';
      const itemStatus = directBorrow ? 'borrowed' : 'requested';

      const { rows: loanRows } = await client.query(
        `INSERT INTO loans (loan_code, borrower_id, created_by, loan_date, expected_return_date, status, purpose, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [loanCode, borrowerId, user.id, loanDate, expectedReturnDate, loanStatus, purpose, notes]
      );
      const loan = loanRows[0];

      for (const asset of lockedAssets) {
        await client.query(
          `INSERT INTO loan_items (loan_id, asset_id, item_status, condition_before)
           VALUES ($1, $2, $3, $4)`,
          [loan.id, asset.id, itemStatus, asset.condition]
        );
      }

      if (directBorrow) {
        await client.query(
          `UPDATE assets SET status = 'borrowed', updated_at = NOW()
           WHERE id = ANY($1::uuid[])`,
          [assetIds]
        );
        if (borrowerId !== user.id) {
          await notifyUsers(client, {
            userIds: [borrowerId],
            title: 'Peminjaman dicatat & diserahkan',
            message: `Peminjaman ${loanCode} (${lockedAssets.length} aset) telah dicatat dan diserahkan kepada Anda. Rencana kembali ${formatDate(expectedReturnDate)}.`,
            linkUrl: `/peminjaman/${loan.id}`,
            loanId: loan.id,
          });
        }
      } else {
        await notifyStaff(client, {
          title: 'Pengajuan peminjaman baru',
          message: `${borrower.name} mengajukan peminjaman ${loanCode} (${lockedAssets.length} aset) untuk ${formatDate(loanDate)} – ${formatDate(expectedReturnDate)}.`,
          linkUrl: `/peminjaman/${loan.id}`,
          loanId: loan.id,
          excludeUserId: user.id,
        });
      }

      return { loan, status: 201 };
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error, conflictAssetIds: result.conflictAssetIds || [] },
        { status: result.status }
      );
    }

    return NextResponse.json({ loan: result.loan }, { status: 201 });
  } catch (err) {
    console.error('Create loan error:', err);
    return NextResponse.json(
      { error: 'Perubahan belum tersimpan. Coba lagi.' },
      { status: 500 }
    );
  }
}
