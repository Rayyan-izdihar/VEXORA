import { Pool } from 'pg';

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

export async function query(text, params = []) {
  return pool.query(text, params);
}

/**
 * Menjalankan callback di dalam satu transaksi PostgreSQL (BEGIN / COMMIT / ROLLBACK).
 * @template T
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export async function withTransaction(fn) {
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
