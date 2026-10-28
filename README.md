# Venu — Platform Booking Lapangan Olahraga

**Venu** (plesetan dari *venue*) adalah aplikasi booking lapangan futsal, badminton, dan basket. Penyewa bisa mencari lapangan, memilih slot jam, memesan, dan membayar (simulasi). Pemilik bisa mengelola lapangan dan booking yang masuk.

Proyek ini adalah tugas kelompok mata kuliah **Secure Application Development**, dengan tema **Asta Cita nomor 4** (penguatan SDM, termasuk prestasi olahraga). Aplikasi diuji dengan **OWASP Top 10:2025** dalam dua versi:

| Versi | Cara mengaktifkan | Isi |
|---|---|---|
| **Before** | `SECURITY_MODE=before` (backend) + `VITE_SECURITY_MODE=before` (web) | Tanpa praktik keamanan, celah **disengaja** aktif. Ditandai `[VULN-Axx]` di kode |
| **After** | `SECURITY_MODE=after` + `VITE_SECURITY_MODE=after` (atau dikosongkan) | Celah diperbaiki dengan Secure Application Development. Ditandai `[FIXED-Axx]` |

Kedua versi ada di **satu kode** dan dipilih lewat file `.env`, lihat [Mode keamanan Before/After](#mode-keamanan-beforeafter). Hasil kedua versi dibandingkan secara terukur untuk melihat dampak praktik keamanan.

> [!WARNING]
> **Mode Before sengaja tidak aman.** Jalankan hanya di komputer lokal dengan data dummy. **Jangan di-deploy ke internet**, jangan memakai password atau data asli, dan jangan memasukkan kredensial apa pun ke dalam kode. Server sendiri menolak berjalan di mode before bila `NODE_ENV=production`.

Dokumen acuan:
- [TASK.md](TASK.md): rencana kerja, checkpoint, katalog celah, dan progress log (sumber kebenaran)
- [DESIGN.md](DESIGN.md): sistem desain UI (warna, tipografi, komponen)

---

## Daftar Isi

1. [Fitur](#fitur)
2. [Status Pengerjaan](#status-pengerjaan)
3. [Tech Stack](#tech-stack)
4. [Struktur Repo](#struktur-repo)
5. [Prasyarat](#prasyarat)
6. [Menjalankan Backend](#menjalankan-backend)
7. [Menjalankan Web](#menjalankan-web)
8. [Menjalankan Mobile](#menjalankan-mobile)
9. [Mode keamanan Before/After](#mode-keamanan-beforeafter)
10. [Ringkasan API](#ringkasan-api)
11. [Pengujian](#pengujian)
12. [Konvensi Pengembangan](#konvensi-pengembangan)
13. [Troubleshooting](#troubleshooting)

---

## Fitur

| Peran | Fitur |
|---|---|
| **Penyewa** | Registrasi, login, edit profil · cari dan filter lapangan (jenis, nama, harga, lokasi) · lihat slot jam tersedia · booking dan batalkan · bayar (simulasi) dengan upload bukti · riwayat booking · ulasan |
| **Pemilik** | Dashboard (jumlah booking, pendapatan, okupansi) · CRUD lapangan, harga, jam operasional, foto · konfirmasi atau tolak booking masuk |
| **Admin** | Kelola user dan lapangan · lihat log aktivitas |

## Status Pengerjaan

| Checkpoint | Isi | Status |
|---|---|---|
| CP0 | Persiapan repo | ✅ Selesai |
| CP1 | Backend dasar + koneksi Neon | ✅ Selesai |
| CP2 | Autentikasi (JWT) dan peran | ✅ Selesai |
| CP3 | Lapangan: CRUD, pencarian, filter | ✅ Selesai |
| CP4 | Booking, pembayaran simulasi, upload | ✅ Selesai |
| CP5 | Dashboard pemilik, admin, ulasan | ✅ Selesai |
| CP6 | Web UI | ✅ Selesai |
| CP7 | Bekukan versi Before | ⏳ Berikutnya |
| CP8 | Pengujian Before | ⏳ Belum |
| CP9 | Perbaikan (Secure SDLC) | ⏳ Belum |
| CP10 | Pengujian After + laporan | ⏳ Belum |
| CP11 | Mobile (opsional) | ✅ Selesai |

Detail tiap checkpoint ada di bagian **Progress Log** pada [TASK.md](TASK.md).

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Bahasa | TypeScript (`strict`, ESM) di semua proyek |
| Backend | Node.js 24 + Express 5 (REST API), dijalankan langsung tanpa build (*type stripping*) |
| Database | PostgreSQL di [Neon](https://neon.tech), driver `pg` |
| Auth | JWT (`jsonwebtoken`) |
| Upload | `multer` (disimpan lokal di `backend/uploads/`) |
| Web | React + Vite + Tailwind CSS v4 |
| Mobile | Expo SDK 58 (React Native) + Expo Router, StyleSheet dengan token `DESIGN.md` |
| Kualitas kode | ESLint (typescript-eslint strict) + Prettier |
| Uji keamanan | OWASP ZAP, Burp Suite Community, Semgrep, `npm audit` |

## Struktur Repo

```
Venu/
├── backend/                 REST API (Express + Neon)
│   ├── db/schema.sql        Skema database (6 tabel)
│   ├── scripts/             db-migrate.ts, db-seed.ts
│   ├── seed-assets/venues/  foto contoh lapangan (dipakai db:seed)
│   ├── src/
│   │   ├── config/          Membaca & memvalidasi .env
│   │   ├── db/              Pool koneksi & helper transaksi
│   │   ├── lib/             Utilitas: JWT, password, waktu, upload, error
│   │   ├── middleware/      Auth, peran, upload, error handler
│   │   ├── modules/         Per fitur: auth, users, venues, bookings, payments,
│   │   │                    reviews, owner, admin, audit
│   │   │   └── <fitur>/     *.routes.ts → *.service.ts → *.repository.ts
│   │   ├── types/           Tipe bersama (peran, olahraga, status)
│   │   ├── app.ts           Menyusun aplikasi Express
│   │   └── server.ts        Titik masuk server
│   └── uploads/             File upload (dibuat otomatis, diabaikan Git)
├── web/                     Frontend React + Vite + Tailwind
│   └── src/
│       ├── auth/            Sesi login (AuthProvider, useAuth) & penjaga rute per peran
│       ├── components/      UI dasar (ui/), layout, toast, komponen lapangan & booking
│       ├── hooks/           useApi: ambil data GET dari API
│       ├── lib/             Klien API, tipe data, format Rupiah/tanggal, aturan booking
│       ├── pages/           Satu file/folder per halaman
│       ├── index.css        Token desain (DESIGN.md §10)
│       └── main.tsx         Daftar rute
├── mobile/                  Aplikasi Expo untuk penyewa (CP11)
│   └── src/
│       ├── app/             Layar (Expo Router): (tabs)/Cari·Booking saya·Akun, venue/[id], booking/[id], login, register
│       ├── auth/ bookings/  Sesi login dan booking aktif (sama seperti web)
│       ├── components/      ui/ (Button, TextField, StatusBadge, …), venue/, booking/
│       ├── constants/       theme.ts: token warna/tipe/jarak dari DESIGN.md
│       └── lib/             Klien API, SecureStore, format & aturan (salinan dari web/src/lib)
├── docs/                    Laporan dan bukti pengujian
├── TASK.md
├── DESIGN.md
└── README.md
```

Setiap modul backend punya tiga lapisan dengan tugas masing-masing:
- **routes**: menerima request HTTP dan membaca input
- **service**: aturan bisnis
- **repository**: query SQL

## Prasyarat

| Kebutuhan | Versi | Cek dengan |
|---|---|---|
| [Node.js](https://nodejs.org) | **24 atau lebih baru** (wajib, karena backend menjalankan TypeScript langsung) | `node -v` |
| npm | 11+ (ikut terpasang bersama Node.js) | `npm -v` |
| Git | terbaru | `git --version` |
| Akun [Neon](https://neon.tech) | gratis | — |

Untuk pengujian keamanan, siapkan juga [OWASP ZAP](https://www.zaproxy.org/download/), [Burp Suite Community](https://portswigger.net/burp/communitydownload), dan [Semgrep](https://semgrep.dev/docs/getting-started/). [Docker](https://www.docker.com/) bersifat opsional, tapi memudahkan menjalankan ZAP dan Semgrep.

---

## Menjalankan Backend

Semua perintah di bawah dijalankan di terminal (PowerShell atau Git Bash).

### 1. Clone repo dan pasang dependensi

```bash
git clone <url-repo> Venu
cd Venu/backend
npm install
```

### 2. Buat file `.env`

Salin contoh konfigurasi (di folder `backend`):

```powershell
# PowerShell
Copy-Item .env.example .env
```
```bash
# Git Bash
cp .env.example .env
```

Lalu buka `backend/.env` dan isi:

| Variabel | Isi |
|---|---|
| `SECURITY_MODE` | `before` atau `after` (kosong = `after`). Lihat [Mode keamanan](#mode-keamanan-beforeafter) |
| `PORT` | Port server, default `4000` |
| `DATABASE_URL` | Connection string Neon: **Dashboard → Connect → Connection string**. Ganti `sslmode=require` menjadi `sslmode=verify-full` |
| `JWT_SECRET` | String acak panjang (mode after: minimal 32 karakter). Buat dengan perintah di bawah |
| `CORS_ORIGINS` | Mode after: origin web yang boleh memanggil API, default `http://localhost:5173` |
| `HOST` | Mode after: alamat yang didengar, default `127.0.0.1` (pakai `0.0.0.0` saat deploy). Mode before selalu `127.0.0.1` |
| `SEED_PASSWORD` | Mode after: password akun seed. Kosong = dibuat acak dan ditampilkan sekali saat `db:seed` |

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

> [!IMPORTANT]
> File `.env` berisi rahasia dan **tidak boleh di-commit**. File ini sudah masuk `.gitignore`. Jangan bagikan isinya di chat atau screenshot laporan.

### 3. Buat tabel dan isi data dummy

```bash
npm run db:migrate   # membuat 6 tabel di Neon (aman dijalankan berulang)
npm run db:seed      # membuat 4 akun dummy + 9 lapangan dummy berfoto (aman dijalankan berulang)
```

### 4. Jalankan server

```bash
npm run dev
```

Buka http://localhost:4000/ping. Kalau muncul `{"status":"ok","message":"pong"}`, server sudah berjalan. Mode `dev` otomatis me-restart server setiap kali file disimpan. Tekan **Ctrl+C** untuk berhenti.

### Skrip npm (folder `backend`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server dengan auto-restart |
| `npm start` | Menjalankan server tanpa auto-restart |
| `npm run db:migrate` | Menjalankan `db/schema.sql` ke database |
| `npm run db:seed` | Mengisi data dummy |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run lint` | Cek kualitas kode dengan ESLint |
| `npm run format` | Merapikan format kode dengan Prettier |

### Akun dummy

| Email | Password (mode before) | Peran |
|---|---|---|
| `admin@venu.test` | `admin123` | admin |
| `pemilik@venu.test` | `pemilik123` | pemilik (pemilik 9 lapangan dummy) |
| `penyewa1@venu.test` | `penyewa123` | penyewa |
| `penyewa2@venu.test` | `penyewa123` | penyewa |

Password di atas hanya dipakai bila `db:seed` dijalankan dalam **mode before** (celah A02: akun default). Dalam **mode after**, password diambil dari `SEED_PASSWORD` atau dibuat acak dan dicetak sekali di terminal. Seed tidak menimpa akun yang sudah ada.

Domain `.test` memang khusus untuk pengujian, jadi email ini tidak mungkin milik siapa pun.

## Menjalankan Web

Backend **harus menyala lebih dulu** (`npm run dev` di folder `backend`). Lalu, di terminal **kedua**:

```bash
cd web
npm install
npm run dev
```

Buka http://localhost:5173. Saat development, Vite meneruskan request `/api/...` dan `/uploads/...` ke backend di `http://localhost:4000` (lihat `web/vite.config.ts`), jadi web tidak butuh file `.env`.

### Halaman

Tampilan mengikuti tema perangkat (terang/gelap) dan bisa diganti lewat tombol bulan/matahari di navbar.


| URL | Halaman | Akses |
|---|---|---|
| `/` (juga `/cari`) | Cari lapangan: strip booking aktif, filter olahraga/kota/tanggal/jam/harga, kartu dengan jam kosong, tombol Bandingkan | Publik |
| `/bandingkan` | Bandingkan 2–3 lapangan berdampingan, nilai terbaik ditandai | Publik |
| `/lapangan/:id` | Detail lapangan, pilih tanggal & slot, ulasan | Publik (pesan: penyewa) |
| `/masuk`, `/daftar` | Login & registrasi | Publik |
| `/booking/:id/bayar` | Checkout: ringkasan, metode bayar, upload bukti | Penyewa |
| `/riwayat` | Booking saya: mendatang & selesai, satu status per booking, bayar/batalkan/beri ulasan | Penyewa |
| `/profil` | Edit profil & ganti password | Login |
| `/pemilik` | Dashboard: ringkasan, booking masuk, lapangan saya | Pemilik |
| `/admin` | Panel admin: pengguna, lapangan, log aktivitas | Admin |

### Skrip npm (folder `web`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server development dengan hot reload |
| `npm run build` | Cek tipe lalu build produksi ke `web/dist` |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run lint` | ESLint (termasuk aturan React Hooks) |
| `npm run format` | Prettier |

---

## Menjalankan Mobile

Aplikasi mobile ditujukan untuk **penyewa**: masuk/daftar, cari lapangan, lihat detail dan pilih jam, pesan, kirim bukti bayar, dan pantau booking. Dashboard pemilik dan admin tetap di web. Dijalankan dengan **Expo Go** (unduh dari Play Store/App Store), tanpa Android Studio atau Xcode.

### 1. Pasang dependensi

```bash
cd mobile
npm install
```

### 2. Hubungkan HP ke backend

HP tidak bisa membuka `127.0.0.1` milik laptop, jadi pilih salah satu cara:

| Cara | Pengaturan backend | Pengaturan `mobile/.env` |
|---|---|---|
| **HP lewat Wi-Fi** (paling mudah, mode after) | `HOST=0.0.0.0` di `backend/.env`, lalu restart backend | kosongkan `EXPO_PUBLIC_API_URL` (alamat laptop diambil otomatis dari Expo) |
| **HP Android lewat kabel USB** (bisa mode before maupun after) | tidak perlu diubah | `EXPO_PUBLIC_API_URL=http://localhost:4000`, lalu jalankan `adb reverse tcp:4000 tcp:4000` |
| **Emulator Android** | `HOST=0.0.0.0` | `EXPO_PUBLIC_API_URL=http://10.0.2.2:4000` |

Salin `mobile/.env.example` menjadi `mobile/.env` bila perlu mengisi nilai di atas. HP dan laptop harus berada di **Wi-Fi yang sama**. Bila Windows bertanya soal firewall untuk Node.js, pilih **Allow**. Alamat server yang sedang dipakai tampil di tab **Akun**.

> Mode **before** sengaja memaksa backend hanya mendengar di `127.0.0.1` (lihat [Mode keamanan](#mode-keamanan-beforeafter)), jadi untuk menguji mode before dari HP, pakai cara **kabel USB + `adb reverse`**.

### 3. Jalankan

```bash
npx expo start          # pindai QR code dengan Expo Go (Android) atau aplikasi Kamera (iPhone)
npx expo start --clear  # bila tampilan tidak ikut berubah setelah kode diedit
```

Isi `EXPO_PUBLIC_SECURITY_MODE` di `mobile/.env` sama dengan `SECURITY_MODE` backend. Mode before menampilkan pita peringatan dan meneruskan pesan error login asli dari API (celah A07, sama seperti web). Token login disimpan di **SecureStore** (Keystore/Keychain), bukan teks biasa.

### Skrip npm (folder `mobile`)

| Perintah | Fungsi |
|---|---|
| `npx expo start` | Server development (Expo Go) |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm run lint` | ESLint (`eslint-config-expo`) |
| `npx prettier --write src` | Format kode |

---

## Mode keamanan Before/After

Satu kode, dua perilaku. Ganti mode cukup dengan mengubah `.env` lalu me-restart server, tanpa `git checkout`.

| File | Variabel | Nilai |
|---|---|---|
| `backend/.env` | `SECURITY_MODE` | `before` / `after` (kosong = `after`) |
| `web/.env` | `VITE_SECURITY_MODE` | `before` / `after` (kosong = `after`). Salin dari `web/.env.example` |

**Samakan kedua nilai.** Contoh pindah ke mode before:

```bash
# backend/.env
SECURITY_MODE=before

# web/.env
VITE_SECURITY_MODE=before
```

Lalu matikan (Ctrl+C) dan jalankan ulang `npm run dev` di **kedua** folder. Tanda mode aktif:
- Terminal backend menampilkan `mode BEFORE` beserta kotak peringatan.
- Web menampilkan pita bergaris kuning "MODE BEFORE" di atas navbar.

**Bagaimana kodenya bekerja**
- Setiap celah ditulis berpasangan di tempat yang sama: cabang `if (isBeforeMode)` bertanda `// [VULN-Axx]`, cabang aman bertanda `// [FIXED-Axx]`. Cari dengan `git grep -n "VULN-A\|FIXED-A"`.
- **Backend** dijalankan langsung tanpa build, jadi kedua cabang ada di kode sumber dan mode dipilih saat server menyala.
- **Web** dibangun Vite. Nilai `VITE_SECURITY_MODE` ditanam saat build, sehingga `npm run build` hanya membawa kode untuk mode yang dipilih; cabang mode lain dibuang dari bundle.

**Pengaman mode before**
- Server menolak menyala bila `SECURITY_MODE=before` dan `NODE_ENV=production`.
- Server hanya mendengar di `127.0.0.1`, jadi tidak bisa diakses dari komputer lain di jaringan.
- Nilai selain `before`/`after` membuat server berhenti dengan pesan error (tidak diam-diam memilih salah satu).

**Saran:** pakai branch database Neon terpisah untuk tiap mode (ganti `DATABASE_URL` saat berpindah). Mode before menyimpan password sebagai MD5. Mode after otomatis mengganti hash MD5 menjadi bcrypt saat pemiliknya login, sehingga satu database yang dipakai bergantian akan berisi campuran format hash.

---

## Ringkasan API

Base URL: `http://localhost:4000`. Endpoint yang butuh login wajib mengirim header:

```
Authorization: Bearer <token dari /auth/login>
```

Semua body request berformat JSON, kecuali endpoint upload yang memakai `multipart/form-data`.

### Auth dan profil

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/ping` | Publik | Cek server hidup |
| POST | `/auth/register` | Publik | Body: `nama`, `email`, `password`, `role` (opsional) |
| POST | `/auth/login` | Publik | Body: `email`, `password` → `token`, `user` |
| POST | `/auth/logout` | Login | |
| GET | `/me` | Login | Data user yang sedang login |
| PATCH | `/me` | Login | Edit profil. Body: `nama` dan/atau `email` |
| PUT | `/me/password` | Login | Ganti password. Body: `password_lama`, `password_baru` |

### Lapangan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/venues` | Publik | Query: `jenis`, `q`, `lokasi`, `harga_min`, `harga_max`, `urut` (`terbaru`/`harga_terendah`/`harga_tertinggi`/`nama`). Tambahkan `tanggal=YYYY-MM-DD` (opsional `mulai=JJ:MM`) agar tiap lapangan membawa `slot_kosong` (jam mulai yang masih kosong) |
| GET | `/venues/:id` | Publik | Detail lapangan |
| GET | `/venues/:id/slots` | Publik | Query: `tanggal=YYYY-MM-DD` (default hari ini) |
| GET | `/venues/mine` | Pemilik | Lapangan milik sendiri |
| POST | `/venues` | Pemilik | Body: `nama`, `jenis_olahraga`, `alamat`, `kota`, `harga_per_jam`, opsional `jam_buka`, `jam_tutup`, `fasilitas`, `foto_url`, `deskripsi` |
| PATCH | `/venues/:id` | Pemilik (miliknya) | Ubah sebagian field |
| DELETE | `/venues/:id` | Pemilik (miliknya) | |
| POST | `/venues/:id/photo` | Pemilik (miliknya) | Multipart: file `foto` (jpg/png/webp, maks 2 MB) |

### Booking dan pembayaran

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/bookings` | Penyewa | Body: `venue_id`, `tanggal`, `jam_mulai`, `jam_selesai` (slot per jam) |
| GET | `/bookings/mine` | Penyewa | Riwayat booking + status pembayaran |
| GET | `/bookings/:id` | Penyewa (miliknya) | Detail booking |
| POST | `/bookings/:id/cancel` | Penyewa (miliknya) | Batalkan booking |
| POST | `/bookings/:id/payment` | Penyewa (miliknya) | Multipart: `metode` (`transfer`/`e_wallet`/`qris`) + file `bukti` (jpg/png/webp/pdf, maks 2 MB) |
| GET | `/payments/:id/proof` | Pembayar, pemilik lapangan, admin | Lihat file bukti bayar |

Aturan booking: slot 1 jam, maksimal 4 jam per booking, paling jauh 30 hari ke depan (waktu WIB), dan maksimal 3 booking belum dibayar per penyewa.

### Ulasan

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/venues/:id/reviews` | Publik | Daftar ulasan lapangan |
| POST | `/venues/:id/reviews` | Penyewa | Body: `rating` (1–5), `komentar` (opsional, maks 1000 karakter). Hanya untuk penyewa yang sudah bermain di lapangan itu, satu ulasan per lapangan |
| DELETE | `/reviews/:id` | Penulis ulasan, admin | Hapus ulasan |

Data lapangan (`GET /venues`, `GET /venues/:id`) juga memuat `rating_rata` dan `jumlah_ulasan`.

### Dashboard pemilik

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/owner/stats` | Pemilik | Query: `dari`, `sampai` (default 30 hari terakhir). Ringkasan dan per lapangan: jumlah booking, pendapatan, okupansi |
| GET | `/owner/bookings` | Pemilik | Booking masuk. Query: `status`, `venue_id`, `tanggal` |
| POST | `/owner/bookings/:id/confirm` | Pemilik (lapangannya) | Verifikasi bukti bayar: booking menjadi `dikonfirmasi`, pembayaran menjadi `lunas` |
| POST | `/owner/bookings/:id/reject` | Pemilik (lapangannya) | Tolak booking. Body opsional: `alasan` |

### Panel admin

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/admin/summary` | Admin | Jumlah user per peran, lapangan, booking, pembayaran lunas, login gagal 24 jam |
| GET | `/admin/users` | Admin | Query: `role`, `q` (nama/email) |
| PATCH | `/admin/users/:id/role` | Admin | Body: `role`. Tidak bisa untuk akun sendiri |
| DELETE | `/admin/users/:id` | Admin | Hapus user beserta datanya. Tidak bisa untuk akun sendiri |
| GET | `/admin/venues` | Admin | Semua lapangan. Query: `q` (nama/kota) |
| DELETE | `/admin/venues/:id` | Admin | Hapus lapangan |
| GET | `/admin/audit-logs` | Admin | Log aktivitas. Query: `aksi`, `limit` (default 100, maks 500) |

Event yang dicatat di log aktivitas: register, login berhasil/gagal, ubah profil/password, konfirmasi/tolak booking, dan aksi admin. Bila satu IP mencapai 5 login gagal dalam 15 menit, dibuat event `alert.login_gagal_beruntun` dan peringatan `[ALERT]` di console server.

---

## Pengujian

### 1. Pemeriksaan kode

Jalankan di folder `backend` **dan** folder `web` sebelum commit. Keduanya harus tanpa error:

```bash
npm run typecheck
npm run lint
```

### 2. Uji fungsional API

Cara paling nyaman adalah ekstensi **Thunder Client** di VS Code atau **Postman**. Bisa juga lewat PowerShell 7 seperti contoh berikut (server harus menyala). Ganti tanggal dengan tanggal dalam 30 hari ke depan.

```powershell
$api = 'http://localhost:4000'

# Login sebagai penyewa, simpan token
$login = Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType 'application/json' `
  -Body '{"email":"penyewa1@venu.test","password":"penyewa123"}'
$auth = @{ Authorization = "Bearer $($login.token)" }

# Profil dan daftar lapangan
Invoke-RestMethod -Uri "$api/me" -Headers $auth
(Invoke-RestMethod -Uri "$api/venues?jenis=futsal&urut=harga_terendah").venues | Format-Table id, nama, kota, harga_per_jam

# Lihat slot, lalu booking 2 jam
(Invoke-RestMethod -Uri "$api/venues/1/slots?tanggal=2026-11-05").slots | Format-Table
$booking = (Invoke-RestMethod -Method Post -Uri "$api/bookings" -Headers $auth -ContentType 'application/json' `
  -Body '{"venue_id":1,"tanggal":"2026-11-05","jam_mulai":"10:00","jam_selesai":"12:00"}').booking

# Bayar dengan upload bukti (siapkan file gambar, misal bukti.png)
Invoke-RestMethod -Method Post -Uri "$api/bookings/$($booking.id)/payment" -Headers $auth `
  -Form @{ metode = 'transfer'; bukti = Get-Item .\bukti.png }

# Riwayat booking
(Invoke-RestMethod -Uri "$api/bookings/mine" -Headers $auth).bookings | Format-Table id, venue_nama, tanggal, jam_mulai, status, payment_status
```

Kalau ingin memakai curl di PowerShell, tulis `curl.exe`, bukan `curl`. Di beberapa versi PowerShell, `curl` adalah alias perintah lain.

### 3. Pengujian keamanan (OWASP Top 10:2025)

Pengujian dilakukan **dua kali dengan skenario dan tool yang sama persis**: pertama pada versi Before (CP8), lalu pada versi After (CP10).

**Persiapan**
1. Setel mode yang akan diuji di `backend/.env` dan `web/.env` (lihat [Mode keamanan](#mode-keamanan-beforeafter)). Untuk arsip laporan, kode yang diuji juga ditandai tag Git `v1-before` dan `v2-after`.
2. Pakai **branch database Neon terpisah** untuk Before dan After supaya data uji tidak tercampur. Buat di Dashboard Neon → **Branches → Create branch**, lalu pakai connection string branch itu di `DATABASE_URL`.
3. Jalankan `npm run db:migrate`, `npm run db:seed`, dan `npm run dev` **dalam mode yang sama**.
4. Lihat semua lokasi celah dan perbaikannya:
   ```bash
   git grep -n "VULN-A"     # cabang mode before
   git grep -n "FIXED-A"    # cabang mode after
   ```

**Tool dan perintah** (jalankan dari folder root `Venu`, ganti `before` dengan `after` saat menguji versi After):

| Tool | Jenis uji | Perintah / cara |
|---|---|---|
| `npm audit` | Dependensi rentan (A03) | `cd backend` lalu `npm audit --json > ../docs/before/npm-audit.json` |
| Semgrep | SAST, analisis kode statis | `semgrep scan --config p/owasp-top-ten --config auto backend/src --json -o docs/before/semgrep.json`. Bisa juga lewat Docker: `docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config p/owasp-top-ten /src/backend/src` |
| OWASP ZAP | DAST, scan aplikasi yang sedang berjalan | GUI: **Automated Scan** ke `http://localhost:4000`. Docker: `docker run --rm -v "${PWD}/docs/before:/zap/wrk:rw" -t zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:4000/venues -r zap-report.html` |
| Burp Suite Community | Uji manual lewat proxy | Jalankan request lewat Burp Proxy, lalu pakai **Repeater** untuk mengubah request (ID, peran, body) dan membandingkan respons |

**Cakupan uji per kategori**

| Kategori | Fokus pengujian |
|---|---|
| A01 Broken Access Control | Akses data milik user lain, akses endpoint tanpa peran yang sesuai |
| A02 Security Misconfiguration | Header keamanan, CORS, detail error yang bocor, akun default |
| A03 Software Supply Chain Failures | Hasil `npm audit`, versi dependensi, lockfile |
| A04 Cryptographic Failures | Cara penyimpanan password, penggunaan HTTPS |
| A05 Injection | Penanganan input pada pencarian dan ulasan |
| A06 Insecure Design | Kepercayaan pada data klien (harga), booking bersamaan, batas percobaan |
| A07 Authentication Failures | Rate limit login, kebijakan password, masa berlaku token, pesan error login |
| A08 Software or Data Integrity Failures | Validasi jenis, ukuran, dan nama file upload |
| A09 Security Logging and Alerting Failures | Pencatatan login gagal dan aksi admin |
| A10 Mishandling of Exceptional Conditions | Perilaku saat error, konsistensi status pembayaran |

Daftar lengkap celah yang sengaja dibuat dan rencana perbaikannya ada di **Bagian 7** [TASK.md](TASK.md).

**Menyimpan bukti**

```
docs/
├── before/     Bukti uji versi Before (CP8)
│   ├── A01-<nama-skenario>.png
│   ├── ...
│   ├── npm-audit.json
│   ├── semgrep.json
│   └── zap-report.html
└── after/      Bukti uji versi After (CP10), dengan nama file yang sama
```

Pakai nama file yang sama di `before/` dan `after/` supaya mudah dibandingkan. Sebelum menyimpan screenshot, pastikan tidak ada connection string, isi `.env`, atau token asli yang terlihat.

---

## Konvensi Pengembangan

- **TypeScript strict dan Clean Code:** nama jelas, fungsi kecil dengan satu tugas, tanpa duplikasi, error ditangani eksplisit.
- Backend dijalankan Node.js dengan *type stripping*, jadi **hindari `enum` dan `namespace`**. Pakai union type, misalnya `'penyewa' | 'pemilik' | 'admin'`. Import file lokal wajib memakai ekstensi `.ts`.
- **Query SQL selalu terparameter** (`$1`, `$2`, ...). Jangan pernah menggabungkan input ke string SQL, kecuali celah Before yang memang disengaja dan ditandai.
- Celah Before **wajib** ditulis di dalam cabang `if (isBeforeMode)` dengan komentar `// [VULN-Axx] penjelasan`, dan perbaikannya di cabang lain dengan `// [FIXED-Axx] penjelasan`. Jangan menaruh celah di luar cabang mode.
- Format pesan commit: `feat(cp5): dashboard pemilik`, `fix(a07): rate limit login`, `docs: README`.
- **Jangan pernah commit** `.env`, kredensial, connection string, atau isi folder `uploads/`.

## Troubleshooting

| Masalah | Penyebab dan solusi |
|---|---|
| `ExperimentalWarning: Type Stripping is an experimental feature` | Normal di Node 24. Aman diabaikan |
| `SECURITY WARNING: The SSL modes 'prefer', 'require', and 'verify-ca'...` | Ganti `sslmode=require` menjadi `sslmode=verify-full` di `DATABASE_URL` |
| `Environment variable DATABASE_URL/JWT_SECRET belum diisi` | `.env` belum dibuat atau belum disimpan. Lihat langkah [Buat file `.env`](#2-buat-file-env) |
| `EADDRINUSE: address already in use :::4000` | Server lain sudah memakai port 4000. Matikan terminal lama (Ctrl+C) atau ganti `PORT` di `.env` |
| `ERR_UNKNOWN_FILE_EXTENSION ".ts"` atau error sintaks saat `npm run dev` | Versi Node.js di bawah 24. Perbarui Node.js |
| Web menampilkan "Tidak dapat terhubung ke server" | Backend belum menyala. Jalankan `npm run dev` di folder `backend` |
| Pita "MODE BEFORE" tampil tapi perilaku API seperti mode after (atau sebaliknya) | `SECURITY_MODE` (backend) dan `VITE_SECURITY_MODE` (web) berbeda. Samakan, lalu restart keduanya |
| `SECURITY_MODE=before dilarang saat NODE_ENV=production` | Pengaman bekerja: mode before hanya untuk lokal. Hapus `NODE_ENV=production` atau pakai mode after |
| `JWT_SECRET minimal 32 karakter acak di mode after` | Buat ulang `JWT_SECRET` dengan perintah di bagian [Buat file `.env`](#2-buat-file-env) |
| Login ditolak "Terlalu banyak percobaan login" | Rate limit mode after (10 gagal / 15 menit per IP). Tunggu, atau restart server saat pengembangan |
| Web terus kembali ke halaman Masuk | Token di browser sudah tidak berlaku (mis. `JWT_SECRET` diganti). Masuk ulang |
| Request ke Neon lambat di awal | Database Neon tidur saat tidak dipakai dan butuh beberapa detik untuk bangun. Coba lagi |
