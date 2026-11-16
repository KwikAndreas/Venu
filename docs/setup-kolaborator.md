# Panduan Setup untuk Kolaborator — Venu

> **Untuk:** teman yang baru di-*invite* sebagai collaborator dan ingin menjalankan proyek **Venu** (platform booking lapangan olahraga) di laptopnya.
> **Repo:** <https://github.com/KwikAndreas/Venu.git>
> Ikuti urut dari atas. Perintah di sini untuk **Windows (PowerShell)**; di macOS/Linux sama saja, tinggal ganti cara set environment variable kalau perlu (dicatat di bawah).

---

## 0. Yang harus terpasang dulu (prasyarat)

| Alat | Versi | Cek | Unduh |
|---|---|---|---|
| **Node.js** | **≥ 24** (wajib — backend dijalankan langsung tanpa build) | `node -v` | <https://nodejs.org> (pilih versi 24+) |
| **npm** | ikut Node | `npm -v` | — |
| **Git** | mana saja terbaru | `git --version` | <https://git-scm.com> |
| (opsional) **Expo Go** | untuk uji mobile di HP | — | App Store / Play Store |

> ⚠️ **Node harus 24 ke atas.** Kalau di bawah itu, backend tidak akan jalan (dipakai fitur *type stripping* Node 24 untuk menjalankan TypeScript langsung). Cek dengan `node -v`.

---

## 1. Clone repo

Buka terminal di folder tempat kamu mau menyimpan proyek (mis. `Documents`), lalu:

```powershell
git clone https://github.com/KwikAndreas/Venu.git
cd Venu
```

Kalau Git minta login GitHub, masuk pakai akun yang sudah di-*invite* sebagai collaborator.

Isi folder utama:
- `backend/` — server API (Express + TypeScript)
- `web/` — website (React + Vite)
- `mobile/` — aplikasi mobile Expo (opsional)
- `docs/` — laporan & panduan (termasuk file ini)

---

## 2. Setup Backend (wajib — jalankan ini dulu)

Semua perintah di bagian ini dijalankan **di dalam folder `backend/`**.

```powershell
cd backend
npm install
```

### 2a. Buat file `.env`

File `.env` berisi rahasia, jadi **tidak ikut di repo**. Salin dari templatenya:

```powershell
Copy-Item .env.example .env
```

> macOS/Linux: `cp .env.example .env`

Lalu buka `backend/.env` dan isi nilainya. Acuan ada di [`../backend/.env.example`](../backend/.env.example). Yang penting:

| Variabel | Isi dengan |
|---|---|
| `SECURITY_MODE` | `after` (versi aman — default). Pakai `before` hanya saat menguji celah OWASP. |
| `DATABASE_URL` | **Connection string PostgreSQL dari Neon** — lihat 2b di bawah. |
| `JWT_SECRET` | String acak **minimal 32 karakter** (mode `after` mewajibkan ini). Cara bikin ada di bawah. |
| `PORT` | biarkan `4000`. |
| `CORS_ORIGINS` | biarkan `http://localhost:5173`. |
| `HOST` | biarkan `127.0.0.1` untuk lokal. |

**Membuat `JWT_SECRET` acak** (jalankan, lalu salin hasilnya ke `.env`):

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

### 2b. Database (Neon)

Backend butuh database PostgreSQL di **Neon**. Dua pilihan — **pilih salah satu**:

- **Pilihan A (paling mudah): minta `DATABASE_URL` ke pemilik repo.**
  Minta dia mengirim connection string Neon lewat **chat pribadi** (jangan lewat commit/GitHub — itu rahasia). Tempel ke `DATABASE_URL` di `.env`. Dengan ini kamu ikut database yang sama.

- **Pilihan B: buat database Neon sendiri (gratis).**
  1. Daftar di <https://neon.tech>, buat satu project.
  2. Buka **Connect** → salin **connection string**.
  3. Tempel ke `DATABASE_URL`, lalu **ganti** `sslmode=require` menjadi `sslmode=verify-full`.
  4. Buat tabel dan data contoh:
     ```powershell
     npm run db:migrate
     npm run db:seed
     ```
     `db:migrate` membuat tabel; `db:seed` mengisi akun & lapangan contoh. Password akun seed ditampilkan sekali di terminal saat `db:seed` (atur lewat `SEED_PASSWORD` di `.env` kalau mau tentukan sendiri).

> Kalau pakai **Pilihan A**, biasanya tabel & data sudah ada, jadi `db:migrate`/`db:seed` **tidak perlu** diulang (tanya dulu ke pemilik repo supaya tidak menimpa data).

### 2c. Jalankan backend

```powershell
npm run dev
```

Berhasil kalau terminal menampilkan kira-kira:

```
Venu API berjalan di http://127.0.0.1:4000 — mode AFTER
```

Uji cepat di terminal lain: `curl http://127.0.0.1:4000/ping` → harus membalas OK.
Biarkan terminal ini tetap jalan.

---

## 3. Setup Web (website)

Buka **terminal baru** (biarkan backend tetap jalan), lalu dari folder utama `Venu/`:

```powershell
cd web
npm install
npm run dev
```

Buka alamat yang muncul (biasanya <http://localhost:5173>). Web sudah otomatis meneruskan permintaan API ke backend di port 4000 (lewat proxy Vite), jadi **tidak perlu** mengatur apa pun untuk bisa login.

**`.env` web opsional.** Hanya perlu kalau mau mengubah mode tampilan keamanan. Kalau mau: salin [`../web/.env.example`](../web/.env.example) menjadi `web/.env`, dan pastikan `VITE_SECURITY_MODE` **sama** dengan `SECURITY_MODE` di backend. Setelah mengubahnya, **restart** `npm run dev`.

---

## 4. Mobile (Expo) — opsional

Hanya kalau kamu ingin menjalankan versi HP. Dari folder utama:

```powershell
cd mobile
npm install
npx expo start
```

Scan QR dengan aplikasi **Expo Go** di HP. Supaya HP bisa menghubungi backend di laptop, backend harus dijalankan dengan `HOST=0.0.0.0` (hanya boleh di mode `after`). Detail cara koneksi (Wi-Fi / kabel USB / emulator) ada di [`../mobile/README.md`](../mobile/README.md) dan [`../mobile/.env.example`](../mobile/.env.example).

---

## 5. Alur kerja sehari-hari (biar tidak bentrok)

Karena kalian berdua menggarap repo yang sama, biasakan pola ini:

**Sebelum mulai kerja — tarik perubahan terbaru:**
```powershell
git pull
```

**Setelah selesai sebuah bagian — simpan & kirim:**
```powershell
git add -A
git commit -m "pesan singkat yang jelas"
git pull        # tarik dulu kalau ada perubahan baru dari teman
git push
```

> Tips: kerjakan di **branch** sendiri agar aman, lalu buka Pull Request di GitHub:
> ```powershell
> git checkout -b nama-fitur-kamu
> # ...kerja, commit...
> git push -u origin nama-fitur-kamu
> ```

Kalau `git pull` mengeluh *"local changes would be overwritten"*, simpan dulu perubahanmu sementara:
```powershell
git stash      # sembunyikan perubahan
git pull
git stash pop  # kembalikan perubahan
```

---

## 6. Catatan penting

- **Jangan pernah commit file `.env`** — isinya rahasia (connection string, JWT secret). File ini sudah diabaikan Git (`.gitignore`), jadi aman selama kamu tidak memaksanya.
- File `TASK.md` dan `DESIGN.md` **tidak ada di repo** (sengaja). Kalau butuh, minta langsung ke pemilik repo.
- **Dua terminal:** satu untuk `backend` (`npm run dev`), satu untuk `web` (`npm run dev`). Keduanya harus jalan bersamaan agar website berfungsi.
- Untuk pengujian keamanan OWASP (Before/After), lihat panduan terpisah: [`panduan-pengujian.md`](panduan-pengujian.md).

---

## 7. Kalau macet (troubleshooting)

| Masalah | Solusi |
|---|---|
| `node -v` di bawah 24 | Pasang Node 24+ dari nodejs.org, tutup & buka ulang terminal. |
| Backend error soal `JWT_SECRET` | Isi `JWT_SECRET` di `backend/.env` minimal 32 karakter (pakai perintah di 2a). |
| Backend tak bisa konek DB | Cek `DATABASE_URL` benar dan `sslmode=verify-full`. Pastikan project Neon aktif. |
| Web bisa dibuka tapi login gagal / data kosong | Pastikan **backend sedang jalan** di terminal lain (port 4000). |
| `npm install` gagal | Pastikan berada di folder yang benar (`backend`, `web`, atau `mobile`), lalu ulangi. |
| Port 4000 / 5173 dipakai | Tutup aplikasi lain yang memakainya, atau ubah `PORT` di `.env` (backend). |

Selamat mencoba! Kalau ada yang tidak jalan, kirim pesan error lengkapnya ke pemilik repo.
