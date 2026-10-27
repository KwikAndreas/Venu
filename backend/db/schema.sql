-- Skema database Venu. Aman dijalankan berulang kali (IF NOT EXISTS).
-- Jalankan dari folder backend: npm run db:migrate
-- Semua nominal uang dalam Rupiah (INTEGER, tanpa desimal).

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  -- [VULN-A04] Mode before mengisi kolom ini dengan MD5 tanpa salt; mode after dengan bcrypt
  -- (lihat src/lib/password.ts). Kedua format dikenali saat login.
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'penyewa'
                CHECK (role IN ('penyewa', 'pemilik', 'admin')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venues (
  id             INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id       INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  nama           VARCHAR(150) NOT NULL,
  jenis_olahraga VARCHAR(20)  NOT NULL
                 CHECK (jenis_olahraga IN ('futsal', 'badminton', 'basket')),
  alamat         TEXT         NOT NULL,
  kota           VARCHAR(100) NOT NULL,
  harga_per_jam  INTEGER      NOT NULL CHECK (harga_per_jam > 0),
  jam_buka       TIME         NOT NULL DEFAULT '08:00',
  jam_tutup      TIME         NOT NULL DEFAULT '22:00',
  fasilitas      TEXT[]       NOT NULL DEFAULT '{}',
  foto_url       TEXT,
  deskripsi      TEXT,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CHECK (jam_tutup > jam_buka)
);

CREATE TABLE IF NOT EXISTS bookings (
  id          INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  venue_id    INTEGER     NOT NULL REFERENCES venues (id) ON DELETE CASCADE,
  tanggal     DATE        NOT NULL,
  jam_mulai   TIME        NOT NULL,
  jam_selesai TIME        NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'menunggu'
              CHECK (status IN ('menunggu', 'dikonfirmasi', 'ditolak', 'dibatalkan', 'selesai')),
  total_harga INTEGER     NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jam_selesai > jam_mulai)
  -- [VULN-A06] Sengaja TANPA constraint unik/exclusion pada (venue_id, tanggal, jam),
  -- sehingga slot yang sama bisa dibooking dobel (race condition).
);

CREATE TABLE IF NOT EXISTS payments (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id INTEGER     NOT NULL REFERENCES bookings (id) ON DELETE CASCADE,
  jumlah     INTEGER     NOT NULL,
  metode     VARCHAR(30) NOT NULL DEFAULT 'transfer',
  status     VARCHAR(20) NOT NULL DEFAULT 'menunggu'
             CHECK (status IN ('menunggu', 'lunas', 'gagal')),
  bukti_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  venue_id   INTEGER     NOT NULL REFERENCES venues (id) ON DELETE CASCADE,
  rating     SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  komentar   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER     REFERENCES users (id) ON DELETE SET NULL,
  aksi       VARCHAR(50) NOT NULL,
  detail     JSONB,
  ip         VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_venues_owner      ON venues (owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user     ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue    ON bookings (venue_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_payments_booking  ON payments (booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_venue     ON reviews (venue_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_reviews_user_venue ON reviews (user_id, venue_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_aksi   ON audit_logs (aksi, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user   ON audit_logs (user_id);
