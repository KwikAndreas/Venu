import { readFile } from 'node:fs/promises';
import { pool } from '../src/db/pool.ts';

const SCHEMA_PATH = new URL('../db/schema.sql', import.meta.url);

async function runSchema(): Promise<void> {
  const sql = await readFile(SCHEMA_PATH, 'utf8');
  await pool.query(sql);
}

async function listTables(): Promise<string[]> {
  const { rows } = await pool.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' ORDER BY table_name`,
  );
  return rows.map((row) => row.table_name);
}

try {
  await runSchema();
  const tables = await listTables();
  console.log('Skema berhasil dijalankan. Tabel di database:');
  for (const table of tables) console.log(`  - ${table}`);
} catch (error) {
  console.error('Gagal menjalankan skema:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
