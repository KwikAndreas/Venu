import type pg from 'pg';
import { pool } from './pool.ts';

/** Pool atau client transaksi: keduanya punya `query`, jadi repository bisa menerima salah satunya. */
export type Db = pg.Pool | pg.PoolClient;

/**
 * Menjalankan `work` di dalam satu transaksi. Bila ada error, semua perubahan di-ROLLBACK
 * sehingga database tidak pernah tertinggal setengah jadi.
 */
export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}
