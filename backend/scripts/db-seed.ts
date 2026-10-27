import { pool } from '../src/db/pool.ts';
import { hashPassword } from '../src/lib/password.ts';
import type { Role } from '../src/types/role.ts';

type SeedUser = {
  nama: string;
  email: string;
  password: string;
  role: Role;
};

// Data DUMMY untuk pengembangan lokal. Domain .test memang khusus untuk pengujian.
const SEED_USERS: SeedUser[] = [
  // [VULN-A02] Akun default dengan kredensial yang mudah ditebak dan tidak pernah diganti.
  { nama: 'Admin Venu', email: 'admin@venu.test', password: 'admin123', role: 'admin' },
  { nama: 'Pemilik Demo', email: 'pemilik@venu.test', password: 'pemilik123', role: 'pemilik' },
  { nama: 'Penyewa Satu', email: 'penyewa1@venu.test', password: 'penyewa123', role: 'penyewa' },
  { nama: 'Penyewa Dua', email: 'penyewa2@venu.test', password: 'penyewa123', role: 'penyewa' },
];

async function seedUsers(): Promise<number> {
  let inserted = 0;
  for (const user of SEED_USERS) {
    const result = await pool.query(
      `INSERT INTO users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.nama, user.email, hashPassword(user.password), user.role],
    );
    inserted += result.rowCount ?? 0;
  }
  return inserted;
}

try {
  const inserted = await seedUsers();
  console.log(`Seed users selesai: ${inserted} baru, ${SEED_USERS.length - inserted} sudah ada.`);
} catch (error) {
  console.error('Gagal menjalankan seed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
