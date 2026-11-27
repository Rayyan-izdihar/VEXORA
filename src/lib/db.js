import { Pool } from 'pg';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UPLOAD_URL_REGEX = /^\/api\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp)$/i;

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export function isValidUploadUrl(value) {
  if (value === null || value === undefined || value === '') return true;
  return typeof value === 'string' && UPLOAD_URL_REGEX.test(value);
}

const globalForPg = globalThis;

function createPool() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/limms';

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
}

export const pool = globalForPg.__limmsPgPool || createPool();

if (process.env.NODE_ENV !== 'production') {
  globalForPg.__limmsPgPool = pool;
}

export async function ensureSchema() {
  if (!globalForPg.__limmsSchemaPromise) {
    globalForPg.__limmsSchemaPromise = (async () => {
      const statements = [
        `ALTER TABLE assets ADD COLUMN IF NOT EXISTS image_url TEXT`,
        `ALTER TABLE damage_reports ADD COLUMN IF NOT EXISTS image_url TEXT`,
        `ALTER TABLE return_records ADD COLUMN IF NOT EXISTS image_url TEXT`,
        `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link_url VARCHAR(255)`,
        `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS loan_id UUID REFERENCES loans(id) ON DELETE SET NULL`,
        `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS damage_report_id UUID REFERENCES damage_reports(id) ON DELETE SET NULL`,
      ];
      for (const sql of statements) {
        await pool.query(sql);
      }
    })().catch((err) => {
      globalForPg.__limmsSchemaPromise = null;
      throw err;
    });
  }
  return globalForPg.__limmsSchemaPromise;
}

export async function query(text, params = []) {
  await ensureSchema();
  return pool.query(text, params);
}

/**
 * Menjalankan callback di dalam satu transaksi PostgreSQL (BEGIN / COMMIT / ROLLBACK).
 * @template T
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
  await ensureSchema();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore rollback error
    }
    throw err;
  } finally {
    client.release();
  }
}
