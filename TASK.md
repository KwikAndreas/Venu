# TASK.md — Aplikasi Booking Lapangan Olahraga (Secure Application Development)

> Dokumen ini adalah **sumber kebenaran** untuk Claude Code. Baca juga `DESIGN.md` sebelum mengerjakan UI apa pun.
> Nama aplikasi: **Venu** (plesetan dari "Venue").

---

## 0. Cara Kerja untuk Claude Code (WAJIB DIBACA)

1. **Kerjakan satu checkpoint per giliran.** Setelah satu checkpoint selesai: commit, centang checklist di file ini, tulis ringkasan singkat di bagian "Progress Log" paling bawah, lalu **BERHENTI dan tunggu persetujuan user** sebelum lanjut. Jangan mengerjakan beberapa checkpoint sekaligus.
2. **User adalah pemula** di stack ini (biasanya memakai Next.js dan Flutter). Jelaskan perintah terminal yang dijalankan, sebutkan di folder mana perintah itu dijalankan, dan jelaskan hal baru secara singkat.
3. Gunakan **TypeScript (mode `strict`, ESM)** di semua proyek (backend, web, mobile) dan terapkan **Clean Code**: nama jelas, fungsi kecil satu tugas, struktur folder per fitur/lapisan, tanpa duplikasi, error ditangani eksplisit. Pakai ESLint + Prettier. Backend dijalankan langsung dengan Node v24 (type stripping), jadi hindari sintaks yang tidak bisa di-strip seperti `enum` dan `namespace` (pakai union type).
4. Satu commit per checkpoint minimal, dengan pesan jelas (contoh: `feat(cp2): auth register & login`).
5. Jangan pernah commit `.env`, kredensial, atau connection string. Sediakan `.env.example`.
6. Jika ada keputusan yang belum ditentukan di dokumen ini, **tanyakan ke user**, jangan menebak.
7. Perbarui checklist dan Progress Log di file ini setiap checkpoint selesai.

---

## 1. Konteks Proyek

Tugas kelompok matakuliah **Secure Application Development**. Mahasiswa membuat aplikasi sesuai misi **Asta Cita** pemerintah Prabowo-Gibran. Kelompok ini memilih kategori **olahraga** (Asta Cita nomor 4: penguatan SDM, termasuk prestasi olahraga).

Aplikasi yang dipilih: **platform booking lapangan olahraga** (futsal, badminton, basket) berbentuk **website** (utama) dan **mobile app** (opsional, jika waktu cukup). Fitur inti: registrasi dan login, pencarian lapangan, pemesanan, pembayaran (simulasi), dan dashboard pemilik lapangan.

Aplikasi diuji dengan **OWASP Top 10:2025** pada dua kondisi: **Before** (tanpa praktik keamanan, ada celah yang disengaja) dan **After** (setelah menerapkan Secure Application Development).

## 2. Objektif

- Membuat aplikasi booking lapangan yang berfungsi penuh.
- Melakukan pengujian lengkap terhadap **10 kategori OWASP Top 10:2025** pada versi Before.
- Menerapkan **Secure Application Development** (secure SDLC) untuk memperbaiki temuan.
- Menguji ulang (After) dan membandingkan hasilnya secara terukur.
- Menulis kode yang menerapkan prinsip **Clean Code** dan bertipe kuat (TypeScript strict).

## 3. Tujuan

- Menunjukkan perbedaan nyata antara aplikasi yang dibuat tanpa dan dengan praktik keamanan.
- Menghasilkan bukti (screenshot, log, laporan tool) untuk setiap kategori OWASP.
- Menghasilkan laporan Before vs After yang bisa dipresentasikan.

---

## 4. Tech Stack (sudah diputuskan)

| Lapisan | Teknologi |
|---|---|
| Bahasa | TypeScript (`strict`, ESM) di semua proyek; ESLint + Prettier |
| Backend | Node.js + Express (REST API) |
| Database | PostgreSQL di **Neon** (online), driver `pg` |
| Web | React (Vite) + Tailwind CSS |
| Mobile (opsional) | Expo (React Native) + NativeWind |
| Auth | Dibuat sendiri di Express (JWT atau session), hash password dengan `bcrypt` di versi After |
| Tool uji | OWASP ZAP, Burp Suite Community, Semgrep, `npm audit` / OWASP Dependency-Check |

**Dilarang:** Laravel/PHP. **Tidak dipakai:** Firebase, Supabase.

## 5. Struktur Repo

Satu repo Git, tiga proyek terpisah:

```
booking-lapangan/
├── backend/   Express + Neon
├── web/       React + Vite + Tailwind
├── mobile/    Expo (opsional)
├── TASK.md
├── DESIGN.md
└── docs/      laporan, bukti uji, screenshot
```

Branching Git:
- `main`: dasar dan dokumen.
- `before`: versi dengan celah disengaja (di-tag `v1-before` saat dibekukan).
- `after`: versi yang sudah diamankan (di-tag `v2-after`).

Neon: pakai fitur **database branching**, satu branch database untuk Before dan satu untuk After, agar data uji tidak bertabrakan.

---

## 6. Fitur

**Peran:** `penyewa` (user), `pemilik` (owner lapangan), `admin`.

**Penyewa**
- Registrasi, login, logout, edit profil
- Cari dan filter lapangan (jenis olahraga, nama, harga, lokasi)
- Lihat detail lapangan dan slot jam tersedia
- Booking slot per jam, batalkan booking
- Pembayaran (simulasi) dan upload bukti bayar
- Riwayat booking dan ulasan lapangan

**Pemilik lapangan**
- Dashboard ringkasan (jumlah booking, pendapatan, okupansi)
- CRUD lapangan, harga, jam operasional, upload foto
- Lihat dan kelola booking yang masuk (konfirmasi atau tolak)

**Admin**
- Kelola user dan lapangan, lihat log aktivitas

**Skema database minimal**
- `users` (id, nama, email, password_hash, role, created_at)
- `venues` (id, owner_id, nama, jenis_olahraga, alamat, harga_per_jam, foto_url, deskripsi)
- `bookings` (id, user_id, venue_id, tanggal, jam_mulai, jam_selesai, status, total_harga)
- `payments` (id, booking_id, jumlah, status, bukti_url, created_at)
- `reviews` (id, user_id, venue_id, rating, komentar, created_at)
- `audit_logs` (id, user_id, aksi, detail, ip, created_at) — dipakai terutama di versi After

---

## 7. Katalog Celah Disengaja (hanya di branch `before`)

Setiap celah **wajib** diberi komentar penanda di kode: `// [VULN-Axx] penjelasan singkat`, supaya mudah dilacak saat pengujian dan perbaikan. Semua celah ini adalah **material pembelajaran**.

| ID | OWASP 2025 | Celah yang disengaja (Before) | Perbaikan (After) |
|---|---|---|---|
| VULN-A01 | Broken Access Control (termasuk SSRF) | Tidak ada pengecekan kepemilikan pada `booking_id`/`venue_id` (IDOR); endpoint admin tidak cek peran; fitur impor foto dari URL tanpa batasan tujuan | Cek kepemilikan dan peran di server untuk tiap request; allowlist tujuan URL |
| VULN-A02 | Security Misconfiguration | Stack trace tampil ke klien, CORS terbuka total, akun default, tanpa header keamanan | Error generik ke klien, CORS dibatasi, `helmet`, hapus akun default |
| VULN-A03 | Software Supply Chain Failures | Beberapa dependensi versi lama yang diketahui rentan, tanpa lockfile ketat | Update dependensi, `npm audit` bersih, lockfile dikunci, CI check |
| VULN-A04 | Cryptographic Failures | Password disimpan dengan hash lemah (MD5) atau plain text; berjalan tanpa HTTPS | `bcrypt`/`argon2`, paksa HTTPS di produksi, enkripsi data sensitif |
| VULN-A05 | Injection | Pencarian lapangan memakai query string yang digabung (SQLi); komentar ulasan tidak di-encode (XSS) | Query terparameter, encode output, validasi input (mis. `zod`/`joi`) |
| VULN-A06 | Insecure Design | Harga dikirim dari klien dan dipercaya; slot bisa dibooking dobel (race condition); tanpa batas percobaan | Harga dihitung server, constraint unik atau lock transaksi, batas percobaan |
| VULN-A07 | Authentication Failures | Tanpa rate limit login, password lemah diterima, token tidak kedaluwarsa, pesan error membocorkan keberadaan email | Rate limit, kebijakan password, token kedaluwarsa, pesan error generik |
| VULN-A08 | Software or Data Integrity Failures | Upload menerima tipe file apa saja, nama file asli dipakai, tanpa verifikasi | Allowlist tipe dan ukuran, ganti nama file, simpan aman |
| VULN-A09 | Security Logging and Alerting Failures | Tidak ada log login gagal atau aksi admin | Audit log, pencatatan event penting, alert sederhana untuk pola mencurigakan |
| VULN-A10 | Mishandling of Exceptional Conditions | Error tidak tertangani (crash), pembayaran gagal tetapi status tetap "lunas" (fail open) | Penanganan error terpusat, fail secure, rollback transaksi |

**Aturan keamanan untuk versi Before:**
- Hanya dijalankan **di komputer lokal** dengan **data dummy**. **Jangan di-deploy ke internet publik.**
- Jangan pakai password, email, atau data asli siapa pun.
- Jangan memasukkan kredensial Neon produksi atau pribadi ke dalam kode.

---

## 8. Checkpoint

Format: kerjakan satu checkpoint, verifikasi "Selesai bila", commit, **berhenti dan lapor**.

### CP0 — Persiapan lingkungan
- [x] Cek `node -v`, `npm -v`, `git --version`
- [x] Buat struktur folder (`backend`, `web`, `docs`), `git init`, `.gitignore` (isi `node_modules`, `.env`)
- [x] Buat branch `main`, commit awal berisi `TASK.md` dan `DESIGN.md`
- **Selesai bila:** struktur repo ada dan commit awal berhasil.

### CP1 — Backend dasar + koneksi Neon
- [x] Inisialisasi `backend` (`express`, `pg`, `dotenv`, `cors`), sediakan `.env.example`
- [x] Endpoint `GET /ping`
- [x] Koneksi ke Neon (user mengisi `DATABASE_URL` sendiri di `.env`)
- [x] File SQL skema (`backend/db/schema.sql`) dan skrip untuk menjalankannya
- **Selesai bila:** `GET /ping` OK dan semua tabel terbuat di Neon.

### CP2 — Autentikasi dan peran
- [ ] Register, login, logout, endpoint `GET /me`
- [ ] Middleware auth, peran `penyewa`/`pemilik`/`admin`
- [ ] Seed data dummy (1 admin, 1 pemilik, 2 penyewa)
- **Selesai bila:** login berhasil dan peran terbaca. (Di branch Before, sertakan celah A04 dan A07 sesuai katalog.)

### CP3 — Lapangan (venues)
- [ ] CRUD lapangan (pemilik), daftar dan detail (publik), pencarian dan filter
- [ ] Seed 8–10 lapangan dummy (futsal, badminton, basket)
- **Selesai bila:** daftar, detail, pencarian, dan CRUD jalan. (Before: celah A01 dan A05.)

### CP4 — Booking dan pembayaran
- [ ] Cek ketersediaan slot, buat dan batalkan booking, riwayat
- [ ] Pembayaran simulasi dan upload bukti bayar
- **Selesai bila:** alur booking sampai bayar jalan end-to-end lewat API. (Before: celah A06, A08, A10.)

### CP5 — Dashboard pemilik, admin, ulasan
- [ ] Endpoint statistik pemilik, kelola booking masuk
- [ ] Panel admin dasar, ulasan lapangan
- **Selesai bila:** semua endpoint fitur di Bagian 6 tersedia. (Before: celah A01, A05 pada ulasan, A02.)

### CP6 — Web UI (ikuti `DESIGN.md`)
- [ ] Setup `web` (Vite + React + Tailwind) dan token desain dari `DESIGN.md`
- [ ] Halaman: Beranda, Cari Lapangan, Detail + pilih slot, Checkout, Riwayat, Login/Register, Dashboard Pemilik, Panel Admin
- [ ] Responsif (mobile, tablet, desktop)
- **Selesai bila:** seluruh alur bisa dipakai dari browser dan tampilan sesuai `DESIGN.md`.

### CP7 — Bekukan versi Before
- [ ] Pastikan semua celah di Bagian 7 ada dan bertanda `[VULN-Axx]`
- [ ] Merge ke branch `before`, buat tag `v1-before`
- [ ] Buat branch database Neon khusus Before
- **Selesai bila:** tag `v1-before` ada dan checklist celah lengkap 10 kategori.

### CP8 — Pengujian Before (OWASP Top 10:2025)
- [ ] Uji tiap kategori A01–A10, simpan bukti di `docs/before/`
- [ ] Jalankan OWASP ZAP, `npm audit`, dan Semgrep, simpan laporannya
- [ ] Isi tabel temuan (kategori, lokasi, cara uji, bukti, tingkat risiko)
- **Selesai bila:** `docs/before/` berisi bukti untuk 10 kategori.

### CP9 — Penerapan Secure Application Development (branch `after`)
- [ ] Buat branch `after` dari `v1-before`
- [ ] Dokumentasikan tahap SDLC aman di `docs/sad-process.md`: requirements keamanan, threat modeling sederhana (STRIDE + diagram alur data), secure coding, verifikasi (SAST/DAST/dependency check), konfigurasi aman
- [ ] Perbaiki seluruh celah sesuai katalog, hapus komentar `[VULN-Axx]` atau ganti jadi `[FIXED-Axx]`
- **Selesai bila:** semua celah di katalog punya perbaikan dan commit-nya terhubung ke ID-nya.

### CP10 — Pengujian After dan Laporan
- [ ] Ulangi pengujian **persis sama** dengan CP8 (skenario dan tool sama), simpan di `docs/after/`
- [ ] Buat tabel perbandingan Before vs After per kategori dan grafik jumlah temuan
- [ ] Buat draf laporan akhir (`docs/laporan.md`): latar belakang Asta Cita no. 4, desain, proses SAD, hasil, kesimpulan
- [ ] Tag `v2-after`
- **Selesai bila:** laporan dan bukti Before/After lengkap.

### CP11 — Mobile (OPSIONAL, kerjakan hanya jika user meminta)
- [ ] Setup `mobile` (Expo + NativeWind) memakai token dari `DESIGN.md`
- [ ] Layar inti: Login, Cari, Detail + slot, Riwayat, Booking
- **Selesai bila:** alur booking jalan di Expo Go.

---

## 9. Definition of Done (keseluruhan)

- Seluruh checkpoint CP0–CP10 tercentang (CP11 opsional).
- 10 kategori OWASP Top 10:2025 teruji di Before dan After dengan bukti.
- Repo bersih: tanpa rahasia, ada `README.md` cara menjalankan, tag `v1-before` dan `v2-after`.
- UI konsisten dengan `DESIGN.md`.
- Kode lolos typecheck (`tsc --noEmit`) dan lint tanpa error.

---

## 10. Progress Log

> Claude Code: tambahkan satu entri per checkpoint selesai (tanggal, ringkasan, keputusan penting).

- **2026-10-27 — CP0 selesai.** Lingkungan: Node v24.1.0, npm 11.4.1, git 2.46.0. Branch `master` diganti `main`. Struktur `backend/`, `web/`, `docs/` dibuat; `.gitignore` mencakup `node_modules`, `.env*` (kecuali `.env.example`), `dist`, `uploads`, log. **Keputusan:** beralih dari JavaScript ke **TypeScript strict + Clean Code** di semua proyek (aturan no. 3 diperbarui); backend memakai ESM (`"type": "module"`) dan dijalankan dengan type stripping Node v24. `web/` memakai template Vite React-TS yang sudah ada. `mobile/` sengaja belum di-commit sampai CP11.
- **2026-10-27 — CP1 selesai.** Backend TypeScript strict dijalankan langsung oleh Node v24 (`npm run dev` / `start`), plus `typecheck`, `lint` (ESLint + typescript-eslint strict), `format` (Prettier). Struktur: `src/config/env.ts` (validasi env), `src/db/pool.ts`, `src/routes/health.routes.ts`, `src/app.ts`, `src/server.ts`. `GET /ping` OK. `db/schema.sql` (idempotent) + `npm run db:migrate` membuat 6 tabel di Neon branch `main`. **Keputusan:** ID memakai integer identity berurutan (memudahkan demo IDOR); status sebagai `VARCHAR + CHECK` (booking: menunggu/dikonfirmasi/ditolak/dibatalkan/selesai; payment: menunggu/lunas/gagal); kolom tambahan `venues.kota`, `jam_buka`, `jam_tutup`, `fasilitas`, `payments.metode`. Celah yang sudah ditandai: `[VULN-A02]` CORS terbuka (`app.ts`), `[VULN-A06]` tanpa constraint anti-booking-dobel dan penanda `[VULN-A04]` kolom password (`schema.sql`). Koneksi DB memakai `sslmode=verify-full`.