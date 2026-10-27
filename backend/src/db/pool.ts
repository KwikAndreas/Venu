import pg from 'pg';
import { env } from '../config/env.ts';

export const pool = new pg.Pool({ connectionString: env.databaseUrl });

// Koneksi idle yang terputus (mis. Neon sleep) memicu event 'error'. Tanpa listener,
// Node akan menghentikan seluruh proses server.
pool.on('error', (error) => {
  console.error('Koneksi database idle terputus:', error.message);
});
