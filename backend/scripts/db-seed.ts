import { randomBytes, randomUUID } from 'node:crypto';
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env, isBeforeMode } from '../src/config/env.ts';
import { pool } from '../src/db/pool.ts';
import { hashPassword } from '../src/lib/password.ts';
import { UPLOAD_ROOT } from '../src/lib/storage.ts';
import type { NewVenue } from '../src/modules/venues/venue.input.ts';
import type { Role } from '../src/types/role.ts';

type SeedUser = {
  nama: string;
  email: string;
  password: string;
  role: Role;
};

// Data DUMMY untuk pengembangan lokal. Domain .test memang khusus untuk pengujian.
const SEED_USERS: SeedUser[] = [
  // [VULN-A02] Mode before: akun default dengan kredensial yang mudah ditebak dan tidak
  // pernah diganti. Mode after: lihat [FIXED-A02] di seedPasswordFor().
  { nama: 'Admin Venu', email: 'admin@venu.test', password: 'admin123', role: 'admin' },
  { nama: 'Pemilik Demo', email: 'pemilik@venu.test', password: 'pemilik123', role: 'pemilik' },
  { nama: 'Penyewa Satu', email: 'penyewa1@venu.test', password: 'penyewa123', role: 'penyewa' },
  { nama: 'Penyewa Dua', email: 'penyewa2@venu.test', password: 'penyewa123', role: 'penyewa' },
];

const VENUE_OWNER_EMAIL = 'pemilik@venu.test';

const SEED_VENUES: NewVenue[] = [
  {
    nama: 'Arena Garuda Futsal',
    jenis_olahraga: 'futsal',
    alamat: 'Jl. Pemuda No. 12, Kemayoran',
    kota: 'Jakarta',
    harga_per_jam: 150000,
    jam_buka: '08:00',
    jam_tutup: '23:00',
    fasilitas: [
      'Rumput sintetis',
      'Pagar jaring',
      'Balkon penonton',
      'Pencahayaan alami',
      'Lampu LED',
    ],
    deskripsi:
      'Lapangan futsal indoor berumput sintetis yang dikelilingi pagar jaring. Ada balkon penonton di lantai dua, dan jendela besar di sepanjang dinding membuat lapangan terang alami pada siang hari.',
  },
  {
    nama: 'Bintang Timur Futsal',
    jenis_olahraga: 'futsal',
    alamat: 'Jl. Dago No. 88, Coblong',
    kota: 'Bandung',
    harga_per_jam: 120000,
    jam_buka: '09:00',
    jam_tutup: '22:00',
    fasilitas: ['Rumput sintetis', 'Pagar jaring', 'Bangku pemain', 'Taman', 'Lampu LED'],
    deskripsi:
      'Lapangan futsal indoor berumput sintetis dengan pagar jaring tinggi di sekelilingnya. Deretan bangku kayu dan taman kecil di sisi lapangan membuat suasana santai, cocok untuk main malam bersama teman.',
  },
  {
    nama: 'Samudra Futsal Center',
    jenis_olahraga: 'futsal',
    alamat: 'Jl. Raya Darmo No. 45, Wonokromo',
    kota: 'Surabaya',
    harga_per_jam: 175000,
    jam_buka: '07:00',
    jam_tutup: '23:00',
    fasilitas: ['Rumput sintetis', 'Pagar jaring', 'Atap skylight', 'Lampu LED'],
    deskripsi:
      'Hall futsal indoor yang luas dengan rumput sintetis dan pagar jaring di sekeliling lapangan. Atap skylight dan lampu LED berderet menjaga pencahayaan tetap merata, cocok untuk latihan tim dan sparing.',
  },
  {
    nama: 'Rajawali Badminton Hall',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Cempaka Putih Raya No. 7',
    kota: 'Jakarta',
    harga_per_jam: 60000,
    jam_buka: '06:00',
    jam_tutup: '22:00',
    fasilitas: ['Karpet sintetis', '3 lapangan', 'Bangku pemain', 'Lampu LED'],
    deskripsi:
      'Tiga lapangan badminton berkarpet sintetis hijau dalam satu hall. Setiap lapangan punya bangku kayu di sisinya, dan lampu LED tersebar merata di langit-langit.',
  },
  {
    nama: 'Kencana Shuttle Club',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Setiabudi No. 150, Sukasari',
    kota: 'Bandung',
    harga_per_jam: 50000,
    jam_buka: '07:00',
    jam_tutup: '21:00',
    fasilitas: ['Karpet sintetis', 'Plafon tinggi', 'Pencahayaan alami', 'Lampu LED'],
    deskripsi:
      'GOR badminton satu lapangan berkarpet sintetis biru dengan plafon tinggi. Jendela besar di dinding membuat ruangan terang alami pada siang hari, dengan suasana sejuk khas Bandung.',
  },
  {
    nama: 'Pelita Badminton Arena',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Kertajaya No. 21, Gubeng',
    kota: 'Surabaya',
    harga_per_jam: 55000,
    jam_buka: '06:00',
    jam_tutup: '22:00',
    fasilitas: ['Karpet sintetis', 'Plafon tinggi', 'Bangku pemain', 'Lampu LED'],
    deskripsi:
      'Hall badminton satu lapangan berkarpet sintetis biru dengan plafon tinggi. Dinding polos tanpa jendela menghindari silau, sehingga shuttlecock tetap mudah terlihat.',
  },
  {
    nama: 'Nusantara Basketball Court',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Senayan No. 3, Kebayoran Baru',
    kota: 'Jakarta',
    harga_per_jam: 250000,
    jam_buka: '08:00',
    jam_tutup: '22:00',
    fasilitas: [
      'Lantai parket',
      'Full court',
      'Tribun penonton',
      'Balkon penonton',
      'Dinding pelindung',
    ],
    deskripsi:
      'Lapangan basket indoor full court berlantai parket kayu. Tersedia tribun di sisi lapangan dan balkon penonton di lantai atas, serta dinding berpelindung busa di sekeliling lapangan.',
  },
  {
    nama: 'Merapi Hoops',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Pasteur No. 60, Sukajadi',
    kota: 'Bandung',
    harga_per_jam: 200000,
    jam_buka: '09:00',
    jam_tutup: '21:00',
    fasilitas: [
      'Lantai parket',
      'Full court',
      'Tribun penonton',
      'Atap skylight',
      '4 ring portabel',
    ],
    deskripsi:
      'Hall basket indoor berlantai parket dengan atap skylight yang terang alami. Empat ring portabel memungkinkan lapangan dibagi dua untuk latihan, dan tribun penonton tersedia di ujung lapangan.',
  },
  {
    nama: 'Mahakam Basket Arena',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Ahmad Yani No. 99, Wonocolo',
    kota: 'Surabaya',
    harga_per_jam: 225000,
    jam_buka: '08:00',
    jam_tutup: '23:00',
    fasilitas: [
      'Lantai parket',
      'Half court',
      'Papan pantul kaca',
      'Dinding pelindung',
      'Kursi tunggu',
    ],
    deskripsi:
      'Lapangan basket half court indoor bergaya klub premium dengan lantai parket kayu dan ring dinding berpapan pantul kaca. Dinding di belakang ring berpelindung busa dan ada kursi tunggu di sisi lapangan. Pas untuk latihan shooting atau main 3x3.',
  },
];

/** Foto contoh per olahraga (`seed-assets/venues/<olahraga>-<n>.jpg`), dipakai bergiliran. */
const PHOTO_ASSETS = fileURLToPath(new URL('../seed-assets/venues/', import.meta.url));
const PHOTOS_PER_SPORT = 3;

function seedPasswordFor(user: SeedUser): string {
  if (isBeforeMode) return user.password;
  // [FIXED-A02] Tidak ada password bawaan yang bisa ditebak: pakai SEED_PASSWORD dari .env,
  // atau password acak yang hanya ditampilkan sekali di terminal.
  return env.seedPassword ?? `${randomBytes(9).toString('base64url')}7a`;
}

async function seedUsers(): Promise<number> {
  const created: { email: string; password: string }[] = [];
  for (const user of SEED_USERS) {
    const password = seedPasswordFor(user);
    const result = await pool.query(
      `INSERT INTO users (nama, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING`,
      [user.nama, user.email, await hashPassword(password), user.role],
    );
    if (result.rowCount) created.push({ email: user.email, password });
  }
  if (!isBeforeMode && created.length > 0 && !env.seedPassword) {
    console.log('Password akun seed (simpan sekarang, tidak akan ditampilkan lagi):');
    console.table(created);
  }
  return created.length;
}

/** Mengisi lapangan hanya bila pemilik demo belum punya lapangan (aman dijalankan ulang). */
async function seedVenues(): Promise<number> {
  const { rows } = await pool.query<{ id: number; jumlah: string }>(
    `SELECT u.id, COUNT(v.id) AS jumlah
     FROM users u LEFT JOIN venues v ON v.owner_id = u.id
     WHERE u.email = $1 GROUP BY u.id`,
    [VENUE_OWNER_EMAIL],
  );
  const owner = rows[0];
  if (!owner) throw new Error(`Pemilik ${VENUE_OWNER_EMAIL} tidak ditemukan`);
  if (Number(owner.jumlah) > 0) return 0;

  for (const venue of SEED_VENUES) {
    await pool.query(
      `INSERT INTO venues (owner_id, nama, jenis_olahraga, alamat, kota, harga_per_jam,
                           jam_buka, jam_tutup, fasilitas, deskripsi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        owner.id,
        venue.nama,
        venue.jenis_olahraga,
        venue.alamat,
        venue.kota,
        venue.harga_per_jam,
        venue.jam_buka,
        venue.jam_tutup,
        venue.fasilitas,
        venue.deskripsi,
      ],
    );
  }
  return SEED_VENUES.length;
}

/**
 * Menyamakan fasilitas & deskripsi lapangan seed yang sudah ada dengan SEED_VENUES, agar
 * database lama ikut sesuai dengan foto contohnya (aman dijalankan ulang).
 */
async function syncSeedVenueDetails(): Promise<number> {
  let updated = 0;
  for (const venue of SEED_VENUES) {
    const result = await pool.query(
      `UPDATE venues v SET fasilitas = $1, deskripsi = $2
       FROM users u
       WHERE u.id = v.owner_id AND u.email = $3 AND v.nama = $4
         AND (v.fasilitas IS DISTINCT FROM $1 OR v.deskripsi IS DISTINCT FROM $2)`,
      [venue.fasilitas, venue.deskripsi, VENUE_OWNER_EMAIL, venue.nama],
    );
    updated += result.rowCount ?? 0;
  }
  return updated;
}

/** Memberi foto pada lapangan seed yang belum punya foto (aman dijalankan ulang). */
async function seedVenuePhotos(): Promise<number> {
  const { rows } = await pool.query<{ id: number; nama: string }>(
    `SELECT v.id, v.nama FROM venues v JOIN users u ON u.id = v.owner_id
     WHERE u.email = $1 AND v.foto_url IS NULL`,
    [VENUE_OWNER_EMAIL],
  );
  await mkdir(join(UPLOAD_ROOT, 'venues'), { recursive: true });

  let filled = 0;
  for (const venue of rows) {
    const seed = SEED_VENUES.find((item) => item.nama === venue.nama);
    if (!seed) continue;
    const sameSport = SEED_VENUES.filter((item) => item.jenis_olahraga === seed.jenis_olahraga);
    const photoNumber = (sameSport.indexOf(seed) % PHOTOS_PER_SPORT) + 1;

    const key = `venues/${randomUUID()}.jpg`;
    await copyFile(
      join(PHOTO_ASSETS, `${seed.jenis_olahraga}-${photoNumber}.jpg`),
      join(UPLOAD_ROOT, key),
    );
    await pool.query('UPDATE venues SET foto_url = $1 WHERE id = $2', [
      `/uploads/${key}`,
      venue.id,
    ]);
    filled += 1;
  }
  return filled;
}

try {
  const users = await seedUsers();
  console.log(`Seed users selesai: ${users} baru, ${SEED_USERS.length - users} sudah ada.`);
  const venues = await seedVenues();
  console.log(
    venues > 0
      ? `Seed venues selesai: ${venues} lapangan baru.`
      : 'Seed venues dilewati: sudah ada.',
  );
  const synced = await syncSeedVenueDetails();
  console.log(`Sinkron detail lapangan seed: ${synced} lapangan diperbarui.`);
  const photos = await seedVenuePhotos();
  console.log(`Seed foto lapangan selesai: ${photos} foto baru.`);
} catch (error) {
  console.error('Gagal menjalankan seed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
