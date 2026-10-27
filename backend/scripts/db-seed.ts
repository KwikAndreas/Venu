import { pool } from '../src/db/pool.ts';
import { hashPassword } from '../src/lib/password.ts';
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
  // [VULN-A02] Akun default dengan kredensial yang mudah ditebak dan tidak pernah diganti.
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
    fasilitas: ['Rumput sintetis', 'Ruang ganti', 'Parkir luas', 'Kantin'],
    deskripsi: 'Lapangan futsal indoor berstandar turnamen dengan pencahayaan LED.',
  },
  {
    nama: 'Bintang Timur Futsal',
    jenis_olahraga: 'futsal',
    alamat: 'Jl. Dago No. 88, Coblong',
    kota: 'Bandung',
    harga_per_jam: 120000,
    jam_buka: '09:00',
    jam_tutup: '22:00',
    fasilitas: ['Lantai vinyl', 'Ruang ganti', 'Musala'],
    deskripsi: 'Dua lapangan futsal indoor yang nyaman untuk latihan rutin.',
  },
  {
    nama: 'Samudra Futsal Center',
    jenis_olahraga: 'futsal',
    alamat: 'Jl. Raya Darmo No. 45, Wonokromo',
    kota: 'Surabaya',
    harga_per_jam: 175000,
    jam_buka: '07:00',
    jam_tutup: '23:00',
    fasilitas: ['Rumput sintetis', 'Tribun penonton', 'Shower', 'Wi-Fi'],
    deskripsi: 'Kompleks futsal dengan tribun penonton, cocok untuk turnamen komunitas.',
  },
  {
    nama: 'Rajawali Badminton Hall',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Cempaka Putih Raya No. 7',
    kota: 'Jakarta',
    harga_per_jam: 60000,
    jam_buka: '06:00',
    jam_tutup: '22:00',
    fasilitas: ['Karpet BWF', 'Ruang ganti', 'Sewa raket'],
    deskripsi: 'Empat lapangan badminton dengan karpet standar BWF.',
  },
  {
    nama: 'Kencana Shuttle Club',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Setiabudi No. 150, Sukasari',
    kota: 'Bandung',
    harga_per_jam: 50000,
    jam_buka: '07:00',
    jam_tutup: '21:00',
    fasilitas: ['Lantai kayu', 'Parkir', 'Kantin'],
    deskripsi: 'GOR badminton berlantai kayu dengan suasana sejuk khas Bandung.',
  },
  {
    nama: 'Pelita Badminton Arena',
    jenis_olahraga: 'badminton',
    alamat: 'Jl. Kertajaya No. 21, Gubeng',
    kota: 'Surabaya',
    harga_per_jam: 55000,
    jam_buka: '06:00',
    jam_tutup: '22:00',
    fasilitas: ['Karpet BWF', 'Shower', 'Sewa raket', 'Wi-Fi'],
    deskripsi: 'Arena badminton modern dengan sirkulasi udara yang baik.',
  },
  {
    nama: 'Nusantara Basketball Court',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Senayan No. 3, Kebayoran Baru',
    kota: 'Jakarta',
    harga_per_jam: 250000,
    jam_buka: '08:00',
    jam_tutup: '22:00',
    fasilitas: ['Lantai parket', 'Papan skor digital', 'Tribun', 'Ruang ganti'],
    deskripsi: 'Lapangan basket indoor full court dengan lantai parket.',
  },
  {
    nama: 'Merapi Hoops',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Pasteur No. 60, Sukajadi',
    kota: 'Bandung',
    harga_per_jam: 200000,
    jam_buka: '09:00',
    jam_tutup: '21:00',
    fasilitas: ['Lantai sintetis', 'Parkir', 'Shower'],
    deskripsi: 'Lapangan basket semi-outdoor beratap, nyaman di segala cuaca.',
  },
  {
    nama: 'Mahakam Basket Arena',
    jenis_olahraga: 'basket',
    alamat: 'Jl. Ahmad Yani No. 99, Wonocolo',
    kota: 'Surabaya',
    harga_per_jam: 225000,
    jam_buka: '08:00',
    jam_tutup: '23:00',
    fasilitas: ['Lantai parket', 'Papan skor digital', 'Kantin', 'Wi-Fi'],
    deskripsi: 'Arena basket dengan papan skor digital untuk latihan dan pertandingan.',
  },
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

try {
  const users = await seedUsers();
  console.log(`Seed users selesai: ${users} baru, ${SEED_USERS.length - users} sudah ada.`);
  const venues = await seedVenues();
  console.log(
    venues > 0
      ? `Seed venues selesai: ${venues} lapangan baru.`
      : 'Seed venues dilewati: sudah ada.',
  );
} catch (error) {
  console.error('Gagal menjalankan seed:', error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
