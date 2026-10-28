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
| Mobile (opsional) | Expo (React Native) + StyleSheet bertoken (lihat DESIGN.md §10) |
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

**Versi Before/After memakai saklar mode, bukan branch terpisah** (keputusan user 2026-10-27):
- Satu kode di branch `main`. Mode dipilih lewat `SECURITY_MODE=before|after` di `backend/.env` dan `VITE_SECURITY_MODE=before|after` di `web/.env` (keduanya harus sama). Kosong = `after`.
- Setiap celah ditulis berpasangan di lokasi yang sama: cabang `if (isBeforeMode)` bertanda `// [VULN-Axx]`, cabang aman bertanda `// [FIXED-Axx]`.
- Backend dijalankan langsung tanpa build, jadi kedua cabang ada di kode sumber dan mode dipilih saat runtime. Web dibangun Vite; `VITE_SECURITY_MODE` diganti nilai tetap saat build sehingga cabang mode lain **dibuang dari bundle**.
- Pengaman mode before: server menolak jalan bila `NODE_ENV=production`, selalu listen di `127.0.0.1`, mencetak peringatan di terminal, dan web menampilkan pita "MODE BEFORE".
- Tag Git tetap dipakai sebagai arsip laporan: `v1-before` (kode saat pengujian Before dibekukan) dan `v2-after`.

Neon: pakai fitur **database branching**, satu branch database untuk Before dan satu untuk After (ganti `DATABASE_URL` saat berpindah mode), agar data uji dan format hash password tidak bercampur.

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

## 7. Katalog Celah Disengaja (hanya aktif di `SECURITY_MODE=before`)

Setiap celah **wajib** diberi komentar penanda di kode: `// [VULN-Axx] penjelasan singkat`, dan perbaikannya di sebelahnya `// [FIXED-Axx] penjelasan singkat`, supaya mudah dilacak saat pengujian dan perbaikan. Semua celah ini adalah **material pembelajaran**.

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
- Hanya dijalankan **di komputer lokal** dengan **data dummy**. **Jangan di-deploy ke internet publik.** (Ditegakkan oleh pengaman mode before: tolak `NODE_ENV=production`, listen hanya di `127.0.0.1`.)
- Deploy apa pun wajib `SECURITY_MODE=after` dan `VITE_SECURITY_MODE=after` (atau dikosongkan).
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
- [x] Register, login, logout, endpoint `GET /me`
- [x] Middleware auth, peran `penyewa`/`pemilik`/`admin`
- [x] Seed data dummy (1 admin, 1 pemilik, 2 penyewa)
- **Selesai bila:** login berhasil dan peran terbaca. (Di branch Before, sertakan celah A04 dan A07 sesuai katalog.)

### CP3 — Lapangan (venues)
- [x] CRUD lapangan (pemilik), daftar dan detail (publik), pencarian dan filter
- [x] Seed 8–10 lapangan dummy (futsal, badminton, basket)
- **Selesai bila:** daftar, detail, pencarian, dan CRUD jalan. (Before: celah A01 dan A05.)

### CP4 — Booking dan pembayaran
- [x] Cek ketersediaan slot, buat dan batalkan booking, riwayat
- [x] Pembayaran simulasi dan upload bukti bayar
- **Selesai bila:** alur booking sampai bayar jalan end-to-end lewat API. (Before: celah A06, A08, A10.)

### CP5 — Dashboard pemilik, admin, ulasan
- [x] Endpoint statistik pemilik, kelola booking masuk
- [x] Panel admin dasar, ulasan lapangan
- **Selesai bila:** semua endpoint fitur di Bagian 6 tersedia. (Before: celah A01, A05 pada ulasan, A02.)

### CP6 — Web UI (ikuti `DESIGN.md`)
- [x] Setup `web` (Vite + React + Tailwind) dan token desain dari `DESIGN.md`
- [x] Halaman: Beranda, Cari Lapangan, Detail + pilih slot, Checkout, Riwayat, Login/Register, Dashboard Pemilik, Panel Admin
- [x] Responsif (mobile, tablet, desktop)
- **Selesai bila:** seluruh alur bisa dipakai dari browser dan tampilan sesuai `DESIGN.md`.

### CP7 — Bekukan versi Before
- [x] Saklar `SECURITY_MODE` / `VITE_SECURITY_MODE` + pengaman mode before (dikerjakan lebih awal, 2026-10-27)
- [ ] Pastikan semua celah di Bagian 7 ada dan bertanda `[VULN-Axx]` (aktif saat `SECURITY_MODE=before`)
- [ ] Buat tag `v1-before`
- [ ] Buat branch database Neon khusus Before
- **Selesai bila:** tag `v1-before` ada dan checklist celah lengkap 10 kategori.

### CP8 — Pengujian Before (OWASP Top 10:2025)
- [ ] Uji tiap kategori A01–A10, simpan bukti di `docs/before/`
- [ ] Jalankan OWASP ZAP, `npm audit`, dan Semgrep, simpan laporannya
- [ ] Isi tabel temuan (kategori, lokasi, cara uji, bukti, tingkat risiko)
- **Selesai bila:** `docs/before/` berisi bukti untuk 10 kategori.

### CP9 — Penerapan Secure Application Development (mode `after`)
- [ ] Dokumentasikan tahap SDLC aman di `docs/sad-process.md`: requirements keamanan, threat modeling sederhana (STRIDE + diagram alur data), secure coding, verifikasi (SAST/DAST/dependency check), konfigurasi aman
- [ ] Setiap `[VULN-Axx]` punya pasangan `[FIXED-Axx]` yang aktif saat `SECURITY_MODE=after` (sebagian sudah dikerjakan bersama saklar mode: A01 registrasi, A02, A04, A07)
- **Selesai bila:** semua celah di katalog punya perbaikan dan commit-nya terhubung ke ID-nya.

### CP10 — Pengujian After dan Laporan
- [ ] Ulangi pengujian **persis sama** dengan CP8 (skenario dan tool sama), simpan di `docs/after/`
- [ ] Buat tabel perbandingan Before vs After per kategori dan grafik jumlah temuan
- [ ] Buat draf laporan akhir (`docs/laporan.md`): latar belakang Asta Cita no. 4, desain, proses SAD, hasil, kesimpulan
- [ ] Tag `v2-after`
- **Selesai bila:** laporan dan bukti Before/After lengkap.

### CP11 — Mobile (OPSIONAL, kerjakan hanya jika user meminta)
- [x] Setup `mobile` (Expo SDK 58 + StyleSheet bertoken, pengganti NativeWind) memakai token dari `DESIGN.md`
- [x] Layar inti: Login, Cari, Detail + slot, Riwayat, Booking
- [ ] Uji alur booking di Expo Go pada HP (menunggu user; sudah lolos di pratinjau web 390px)
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
- **2026-10-27 — CP2 selesai.** **Keputusan user:** autentikasi **JWT** (header `Authorization: Bearer`), hash password Before **MD5**. Endpoint: `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me`. Struktur per modul (`modules/auth`, `modules/users`: routes → service → repository), middleware `requireAuth`/`requireRole`, `HttpError` + error handler terpusat + 404 handler. `npm run db:seed` membuat 4 akun dummy (`admin@venu.test`/`admin123`, `pemilik@venu.test`/`pemilik123`, `penyewa1|2@venu.test`/`penyewa123`). Diuji end-to-end via curl. Celah yang ditandai: `[VULN-A04]` MD5 tanpa salt (`lib/password.ts`), HTTP tanpa HTTPS (`server.ts`); `[VULN-A07]` token tanpa kedaluwarsa (`lib/jwt.ts`), password lemah diterima, pesan login membedakan email/password (`auth.service.ts`), tanpa rate limit, logout tidak mencabut token (`auth.routes.ts`); `[VULN-A01]` role dari klien saat register (bisa daftar sebagai admin); `[VULN-A02]` stack trace ke klien (`error-handler.ts`), akun default (`db-seed.ts`). `PATCH /me` (edit profil) dikerjakan di CP5.
- **2026-10-27 — CP3 selesai.** Modul `modules/venues` (input → routes → service → repository). Endpoint: `GET /venues` (publik; filter `jenis`, `q` nama, `lokasi` kota/alamat, `harga_min`, `harga_max`, `urut` = terbaru/harga_terendah/harga_tertinggi/nama), `GET /venues/:id` (publik, + `nama_pemilik`), `GET /venues/mine`, `POST /venues`, `PATCH /venues/:id`, `DELETE /venues/:id` (khusus pemilik, hanya lapangan miliknya; milik orang lain dijawab 404). Error handler memetakan pelanggaran constraint PostgreSQL ke 400/409. `npm run db:seed` menambah 9 lapangan dummy (3 futsal, 3 badminton, 3 basket; Jakarta/Bandung/Surabaya) milik `pemilik@venu.test`. 16 skenario diuji via curl. **Catatan terbuka:** fitur lapangan di CP3 dibuat dengan implementasi aman (query terparameter, cek kepemilikan); celah sengaja A01/A05 untuk lapangan **belum ditanam**, perlu diputuskan kelompok sebelum CP7. Upload foto lapangan menyusul bersama upload bukti bayar (CP4); saat ini `foto_url` berupa URL http(s).
- **2026-10-27 — CP4 selesai.** Modul `bookings` dan `payments`. Endpoint: `GET /venues/:id/slots?tanggal=` (publik, slot per jam sesuai jam operasional, waktu WIB), `POST /bookings`, `GET /bookings/mine`, `GET /bookings/:id`, `POST /bookings/:id/cancel` (penyewa, hanya miliknya), `POST /bookings/:id/payment` (multipart: `metode` = transfer/e_wallet/qris + file `bukti`), `GET /payments/:id/proof` (penyewa pembayar, pemilik lapangan, admin), `POST /venues/:id/photo` (pemilik, file `foto`). **Keputusan:** slot 1 jam, maks 4 jam per booking, maks 30 hari ke depan, maks 3 booking belum dibayar per penyewa; status `menunggu`/`dikonfirmasi` memegang slot; pembayaran berstatus `menunggu` sampai diverifikasi pemilik (CP5); membatalkan booking menggagalkan pembayaran yang menunggu. Upload: maks 2 MB, jenis dicek dari isi file (magic bytes), nama acak UUID, disimpan di `backend/uploads/` (diabaikan Git); foto lapangan publik di `/uploads/venues`, bukti bayar tidak publik. Ditambah `withTransaction` (rollback otomatis) dan listener error pada pool DB. 21 skenario diuji via curl termasuk 6 request bersamaan untuk slot yang sama (1 berhasil, 5 ditolak 409); data uji sudah dibersihkan. **Catatan terbuka:** seperti CP3, alur ini dibuat dengan implementasi aman; celah sengaja A06/A08/A10 untuk booking, upload, dan pembayaran **belum ditanam**, perlu diputuskan kelompok sebelum CP7.
- **2026-10-27 — CP5 selesai.** Modul baru `owner`, `admin`, `reviews`, `audit`; edit profil di `users`. Endpoint: `PATCH /me`, `PUT /me/password` (wajib password lama); `GET /owner/stats` (periode default 30 hari: jumlah booking, menunggu, terkonfirmasi, pendapatan dari pembayaran lunas, okupansi jam terpakai/jam tersedia, per lapangan), `GET /owner/bookings`, `POST /owner/bookings/:id/confirm` (wajib ada bukti bayar; booking → dikonfirmasi + pembayaran → lunas dalam satu transaksi), `POST /owner/bookings/:id/reject`; `GET/POST /venues/:id/reviews`, `DELETE /reviews/:id`; `GET /admin/summary`, `GET /admin/users`, `PATCH /admin/users/:id/role`, `DELETE /admin/users/:id`, `GET /admin/venues`, `DELETE /admin/venues/:id`, `GET /admin/audit-logs`. **Keputusan:** ulasan hanya oleh penyewa yang punya booking dikonfirmasi/selesai sampai hari ini, satu per lapangan (unique index `uq_reviews_user_venue`); admin tidak bisa mengubah peran/menghapus akunnya sendiri; menghapus lapangan/user ikut menghapus file upload terkait; data lapangan kini memuat `rating_rata` dan `jumlah_ulasan`. Audit log mencatat register, login berhasil/gagal, ubah profil/password, konfirmasi/tolak booking, aksi admin; alert sederhana bila 5 login gagal dari satu IP dalam 15 menit. Refactor: penyusun WHERE terparameter dipindah ke `lib/sql-where.ts`. README diperbarui. 19 skenario diuji via curl; data uji dihapus (audit log uji dibiarkan karena bersifat catatan permanen). **Catatan terbuka:** fitur CP5 dibuat dengan implementasi aman dan audit log sudah aktif, sehingga celah A01/A05 (ulasan)/A02 baru dan A09 (tanpa log) dari katalog **belum ditanam**; gabungkan dengan catatan CP3/CP4 untuk diputuskan kelompok sebelum CP7. Penanda `[VULN-Axx]` yang sudah ada (A01 register, A02, A04, A06 skema, A07) tetap utuh.
- **2026-10-27 — CP6 selesai.** Web React 19 + Vite 8 + Tailwind v4 + react-router v8 + lucide-react + font Inter/Playfair (`@fontsource`). Token desain di `web/src/index.css` (DESIGN.md §10). 10 rute: `/`, `/cari`, `/lapangan/:id`, `/masuk`, `/daftar`, `/booking/:id/bayar`, `/riwayat`, `/profil`, `/pemilik` (tab Ringkasan / Booking masuk / Lapangan saya), `/admin` (tab Pengguna / Lapangan / Log aktivitas). Komponen bersama: Button, Field (label di atas + error berikon), Badge status (tint + ikon), Modal/ConfirmDialog (wajib sebelum aksi destruktif), Toast 3 detik, Skeleton, EmptyState, Tabs, Table, SlotPicker 44px, VenueCard. **Keputusan:** TypeScript web diturunkan dari 7.0 ke 6.0 (sama dengan backend) karena `typescript-eslint` belum mendukung TS 7; oxlint bawaan template diganti ESLint + Prettier sesuai aturan no. 3; `tsconfig.app.json` dijadikan `strict`; Vite dev proxy `/api` dan `/uploads` → `localhost:4000` (web tidak bergantung pada CORS); token JWT disimpan di `localStorage` (kandidat perbaikan di After: cookie httpOnly); UI menampilkan pesan login generik sesuai DESIGN.md §1 (API Before tetap membocorkan, jadi A07 tetap bisa diuji lewat API); parameter `?next=` divalidasi agar tidak menjadi open redirect; bukti bayar ditampilkan lewat fetch + Blob karena butuh token. Ditambah token tint status (`*-50`, `*-700`) karena teks Warning `#B7791F` di latar terang tidak lolos AA; dicatat di DESIGN.md §2 dan §10. Verifikasi: typecheck, lint, `vite build`, smoke test proxy + 51 modul, dan screenshot 10 halaman × (desktop 1280 / mobile 390) via Chrome headless tanpa error console; satu bug ditemukan dan diperbaiki (tombol Batalkan tampil Navy, kini varian `danger-outline`). Data contoh untuk screenshot sudah dihapus.
- **2026-10-27 — Revisi CP6: redesign "Night Match".** **Keputusan user:** tampilan lama (Ivory/Navy/Emas + Playfair) terasa generik, diganti gaya sporty "Night Match": dasar gelap Ink/Asphalt, aksen Volt `#C6FF1A`, judul Barlow Condensed 800 (italic untuk display) kapital, isi Barlow, radius kecil 2/4/8px, pola garis diagonal, angka ala papan skor. DESIGN.md ditulis ulang total (token semantik `ink`, `surface`, `surface-2`, `line`, `fg`, `muted`, `volt`, status terang untuk latar gelap). Perubahan tata letak: kartu lapangan seragam diganti daftar "fixture" bernomor; beranda dengan hero display + pemilih olahraga besar + panel papan skor + langkah bernomor; filter pencarian jadi strip horizontal dengan tab olahraga; blok tanggal ala jadwal pertandingan di Riwayat/Checkout; ringkasan booking bergaya tiket; StatCard jadi papan skor (sorotan Volt untuk satu angka terpenting). Varian tombol disederhanakan (`primary`, `secondary`, `danger`, `danger-outline`, `ghost`). Diverifikasi ulang dengan screenshot desktop/mobile tanpa error console.
- **2026-10-27 — Saklar mode keamanan Before/After.** **Keputusan user:** satu kode dengan saklar `.env`, menggantikan branch `before`/`after` (Bagian 5 dan CP7/CP9 diperbarui). Backend: `SECURITY_MODE=before|after` (kosong = after) di `config/env.ts` + `isBeforeMode`; pengaman: tolak `NODE_ENV=production` di mode before, listen paksa `127.0.0.1`, banner peringatan di terminal; mode after mewajibkan `JWT_SECRET` ≥ 32 karakter. Pasangan `[VULN]`/`[FIXED]` yang dibuat: **A01** peran registrasi (allowlist penyewa/pemilik); **A02** CORS (`CORS_ORIGINS`), header `helmet`, `X-Powered-By` dimatikan (`middleware/security.ts`), error generik tanpa stack + log server (`error-handler.ts`), akun seed tanpa password bawaan (`SEED_PASSWORD` atau acak); **A04** bcrypt cost 12 + rehash otomatis hash MD5 lama saat login, HTTPS wajib di produksi (`trust proxy` + redirect + HSTS); **A07** token 2 jam + `jti`, logout mencabut token (denylist di memori), kebijakan password (8+ huruf & angka, bukan nama email) untuk registrasi dan ganti password, pesan + status + waktu respons login seragam (bcrypt dummy), rate limit login 10/15 menit & registrasi 10/jam per IP. Dependensi baru: `bcryptjs`, `helmet`, `express-rate-limit`. Web: `VITE_SECURITY_MODE` (`lib/security-mode.ts`), pita "MODE BEFORE", pesan login asli API ditampilkan hanya di mode before; terbukti di-build hanya memuat cabang mode yang dipilih. Proxy Vite diarahkan ke `127.0.0.1:4000`. Ditemukan & diperbaiki saat pengembangan: `verifyPassword` menjadi async sehingga pengecekan password lama di ganti-password wajib `await`. Diuji: 21 skenario before vs after via curl + uji rehash MD5→bcrypt; data uji dihapus. **Catatan terbuka (tetap):** celah katalog yang belum punya cabang `[VULN]` (A01 IDOR/SSRF lapangan & booking, A03, A05, A06 harga/booking dobel, A08, A09, A10) masih perlu diputuskan kelompok sebelum CP7.
- **2026-10-27 — Revisi CP6: desain "Galeri Banding" (kombinasi Opsi A+B).** **Keputusan user:** gaya "Night Match" terasa padat/khas AI; diminta modern tanpa neon/glass, nyaman di mode terang & gelap, tidak padat, membantu menimbang lapangan, dan tanpa UI berulang (mis. "Menunggu | Menunggu verifikasi"). Proses: 3 preview HTML (A banding cepat, B galeri foto, C jadwal sekilas) → user memilih kombinasi A+B → preview kombinasi direvisi (strip booking aktif dipindah dari bawah ke atas judul + angka di menu) → diterapkan. Perubahan: token warna terang/gelap (`--app-*` + `@theme inline`), tombol tema + ikut tema perangkat (`theme/`), font Plus Jakarta Sans; beranda `/` kini halaman Cari (kartu foto berisi jam kosong & harga sejajar, label bantu "Rating tertinggi/Favorit penyewa/Termurah", toggle Bandingkan + baki melayang); halaman baru `/bandingkan` (tabel 2–3 lapangan, nilai terbaik ditandai); **status tunggal** `lib/booking-stage.ts` (penyewa: Menunggu pembayaran / Menunggu konfirmasi pemilik / Terkonfirmasi / Sedang berlangsung / Selesai / Ditolak pemilik / Dibatalkan; pemilik: Belum dibayar / Perlu dikonfirmasi / …) dipakai di strip, Booking saya, checkout, dan tabel pemilik (dua kolom status → satu); strip booking aktif + angka di navbar (`bookings/`); aksi hanya muncul bila valid menurut jam WIB (Batalkan sebelum mulai, Beri ulasan setelah selesai, form ulasan hanya untuk penyewa yang sudah bermain & belum mengulas); teks *sentence case* dan sapaan "kamu". Backend: `GET /venues?tanggal=&mulai=` mengembalikan `slot_kosong` per lapangan dalam satu query (`summarizeAvailability`). `useApi` mendapat parameter `scope` agar data user lama tidak tampil untuk user baru. DESIGN.md ditulis ulang. Diverifikasi: typecheck, lint, screenshot 9 halaman × (terang, gelap) + 4 halaman mobile tanpa error console; temuan dari screenshot yang diperbaiki: foto detail hilang, legenda slot usang, "Baru" berulang di tiap kartu, filter terlipat dua baris, status di strip ambigu saat banyak booking, tombol Batalkan & Beri ulasan muncul saat booking sedang berlangsung, tombol Batalkan tidak merah. Data contoh (booking 11 & 12) dihapus; booking milik user (ID 10) tidak disentuh.
- **2026-10-28 — Melengkapi katalog celah A01, A03, A05, A06, A08, A09, A10.** **Keputusan user:** ini UAS Secure Application Development, jadi 10 celah OWASP memang harus dibuat untuk diuji (Burp/ZAP/Wireshark/Semgrep/npm audit) dan dibandingkan Before vs After. Semua ditambahkan sebagai pasangan `[VULN-Axx]`/`[FIXED-Axx]` yang dinyalakan `SECURITY_MODE` (kecuali A03), hanya aktif lokal. **A05 Injection:** SQLi di pencarian lapangan (q/lokasi digabung ke SQL — `venue.repository.ts`), stored XSS komentar ulasan via `dangerouslySetInnerHTML` (`VenueReviews.tsx`); diuji UNION SELECT membocorkan email+hash. **A01 BAC:** IDOR baca booking & bukti bayar milik orang lain (`booking.service.ts`, `payment.service.ts`), SSRF impor foto dari URL apa pun `POST /venues/:id/photo-url` (`lib/url-image.ts`, blokir loopback/privat/link-local/metadata di after). **A06 Insecure Design:** harga total dari klien dipercaya + tanpa lock/cek bentrok/batas (booking dobel), after hitung server + transaksi terkunci. **A08 Data Integrity:** upload terima tipe apa pun & pakai nama file asli (`lib/storage.ts`; mis. evil.html → /uploads), after cek magic bytes + nama UUID; `resolveUpload` kini anti path-traversal berbasis containment. **A09 Logging:** `recordAudit`/`recordFailedLogin` no-op di before (tanpa jejak & alert). **A10 Exceptional Conditions:** `confirmBooking` before fail-open tanpa transaksi (booking dikonfirmasi walau tanpa bukti bayar), after satu transaksi + fail secure. **A03 Supply Chain:** tak bisa lewat saklar runtime → pakai tag Git; pin `lodash@4.17.11` & `minimist@0.0.8` (tak diimpor) agar `npm audit` menampilkan 2 kerentanan critical; `backend/DEPS-A03.md` menjelaskan cara uji & perbaikan (hapus/upgrade di `v2-after`). Tiap kategori diuji di kedua mode via curl (IDOR 200↔404, SSRF fetch internal↔ditolak, harga Rp1↔dipaksa, dobel 201/201↔201/409, upload evil.html 201↔400, audit 0↔6, konfirmasi tanpa bukti 200/dikonfirmasi↔409/menunggu). Data uji dibersihkan. Commit terpisah per kategori: a05 `585f0be`, a01 `96ab161`, a06 `fd92b20`, a08 `e2d0a1b`, a09+a10 `15ee9e5`, a03 `a98f579`. **Status: 10/10 kategori punya pasangan [VULN]/[FIXED].** Siap CP7 (bekukan Before: tag `v1-before`, branch DB Neon).
- **2026-10-28 — CP11 Mobile (Expo).** **Keputusan user:** mobile dikerjakan sekarang. Template `create-expo-app` diganti total; error TS di `app-tabs.web.tsx` (ref `TabTriggerSlotProps` tidak cocok dengan `Pressable` RN 0.88) hilang bersama template. **Keputusan teknis:** NativeWind diganti StyleSheet bertoken (`src/constants/theme.ts`, nama/nilai sama dengan web) karena NativeWind stabil masih Tailwind 3 dan v5 masih RC, belum terbukti di SDK 58/RN 0.88; DESIGN.md §10 diperbarui. Aplikasi khusus penyewa: tab **Cari** (strip booking aktif di atas, judul "Main di mana …?", cari nama, segmen olahraga, pemilih tanggal geser, pil kota, kartu foto + jam kosong + harga + satu label bantu), **Booking saya** (Mendatang / Selesai & dibatalkan, satu status, Batalkan dengan konfirmasi native, Bayar sekarang; angka di tab), **Akun** (profil, tema Perangkat/Terang/Gelap, keluar, alamat server); layar `venue/[id]` (info, fasilitas, pilih tanggal & jam berurutan maks 4 jam, ulasan baca-saja, bar bawah total + "Pesan sekarang") dan `booking/[id]` (ringkasan, metode simulasi, unggah bukti dari galeri via `expo-image-picker`, status setelah terkirim); `login`/`register` sebagai modal (pendaftaran selalu peran penyewa). Logika dibagi dengan web: `booking-stage`, `format`, `booking-rules`, `decision-badges` disalin dari `web/src/lib`. Keamanan: token di `expo-secure-store` (bukan teks biasa); pasangan `[VULN-A07]`/`[FIXED-A07]` pesan login sama dengan web lewat `EXPO_PUBLIC_SECURITY_MODE` (+ pita peringatan mode before); komentar ulasan dirender `<Text>` sehingga XSS A05 tidak berlaku di mobile. Alamat API: `EXPO_PUBLIC_API_URL` atau otomatis dari `hostUri` Expo; README menjelaskan tiga cara koneksi (Wi-Fi + `HOST=0.0.0.0`, USB + `adb reverse` untuk mode before, emulator). Verifikasi: `tsc --noEmit`, `expo lint`, Prettier; pratinjau Expo web 390px via Chrome DevTools Protocol (terang & gelap) dengan backend kedua di port 4001: alur pilih 2 jam → Pesan → checkout → status "Menunggu konfirmasi pemilik" di checkout & strip, pesan login generik, tanpa error console. Temuan yang diperbaiki: nama lapangan berulang di header detail, label tab terpotong (tinggi tab bar kini dari safe area). **Belum diverifikasi:** jalannya di Expo Go pada HP (upload bukti native memakai `{ uri, name, type }`). Data uji (user 19, booking 26, payment 12 + file) dihapus.
