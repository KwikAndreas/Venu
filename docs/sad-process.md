# Proses Secure Application Development — Venu (CP9)

> **Ditujukan untuk:** dosen/penguji dan anggota kelompok. Dokumen ini menjelaskan penerapan **Secure SDLC** pada aplikasi **Venu** (booking lapangan olahraga): dari kebutuhan keamanan, pemodelan ancaman (STRIDE), secure coding, verifikasi (SAST/DAST/dependency check), sampai konfigurasi aman. Hasil pengujiannya ada di [`before/README.md`](before/README.md) dan [`after/README.md`](after/README.md).

## 1. Ikhtisar

Venu dibuat dalam dua kondisi pada **satu basis kode**, dipilih lewat saklar `SECURITY_MODE`:
- **Before** (`before`) — celah OWASP ditanam sengaja (`[VULN-Axx]`), hanya untuk uji lokal.
- **After** (`after`, default) — perbaikan aktif (`[FIXED-Axx]`).

Pendekatan Secure SDLC yang dipakai mengikuti lima tahap: **Requirements → Design (Threat Modeling) → Secure Coding → Verification → Secure Configuration & Deployment.**

## 2. Kebutuhan keamanan (Security Requirements)

| Kode | Kebutuhan | Kategori OWASP terkait |
|---|---|---|
| SR-1 | Setiap akses data (booking, pembayaran, lapangan) harus memeriksa **kepemilikan & peran** di server. | A01 |
| SR-2 | Rahasia (kredensial, connection string) **tidak** boleh di kode; error ke klien harus generik. | A02 |
| SR-3 | Dependensi harus bebas kerentanan **kritis/tinggi** dan terkunci lockfile. | A03 |
| SR-4 | Password disimpan dengan hash **lambat + salt** (bcrypt/argon2); transport terenkripsi (HTTPS). | A04 |
| SR-5 | Semua input dari klien **divalidasi**; query ke DB **terparameter**; output di-encode. | A05 |
| SR-6 | Keputusan bisnis (harga, ketersediaan slot) dihitung & ditegakkan **di server**. | A06 |
| SR-7 | Autentikasi: kebijakan password, token kedaluwarsa + dapat dicabut, rate limit, pesan seragam. | A07 |
| SR-8 | Upload berkas: validasi tipe dari **isi** berkas, ganti nama, batas ukuran. | A08 |
| SR-9 | Event keamanan (login gagal, aksi admin) **dicatat** dan memicu alert sederhana. | A09 |
| SR-10 | Kondisi error ditangani terpusat dan **fail-secure** (rollback, tolak bila ragu). | A10 |

## 3. Arsitektur & Diagram Alur Data (DFD)

```
                      (Internet / LAN)
  ┌───────────┐  HTTPS  ┌──────────────────────────────────────────┐  TLS   ┌──────────────┐
  │  Browser  │ ───────▶│  Backend Express (Node v24, TypeScript)   │ ─────▶ │  PostgreSQL  │
  │  (React)  │◀─────── │  ┌────────────────────────────────────┐   │ ◀───── │   (Neon)     │
  │  Mobile   │  JSON   │  │ security mw (helmet, cors)          │   │        └──────────────┘
  │  (Expo)   │         │  │ auth mw (JWT verify, requireRole)   │   │              ▲
  └───────────┘         │  │ modul: auth, venues, bookings,      │   │   berkas     │
        │   Bearer JWT  │  │        payments, owner, admin,      │   │   upload     │
        └──────────────▶│  │        reviews, audit               │   │ ┌────────────┴───────┐
                        │  │ error-handler terpusat              │   │ │ backend/uploads/   │
                        │  └────────────────────────────────────┘   │ │  venues/ (publik)  │
                        └──────────────────────────────────────────┘ │  payments/ (privat)│
                                                                      └────────────────────┘

  Trust boundary 1: Browser/Mobile  ↔  Backend  (semua input klien = tidak tepercaya)
  Trust boundary 2: Backend  ↔  Database & Filesystem (query terparameter, path aman)
```

**Aset yang dilindungi:** kredensial & hash password, data pribadi penyewa, bukti pembayaran, integritas harga/booking, ketersediaan layanan.

## 4. Pemodelan Ancaman (STRIDE)

STRIDE memetakan ancaman per elemen DFD. Kolom terakhir menautkan ke mitigasi `[FIXED-Axx]` yang sudah diterapkan di mode after.

| STRIDE | Ancaman pada Venu | Contoh | Mitigasi (OWASP) |
|---|---|---|---|
| **S**poofing | Memalsukan identitas / menebak akun terdaftar | User enumeration lewat pesan login; token tak kedaluwarsa | Pesan login seragam, token `exp`+`jti`, rate limit **(A07)** |
| **T**ampering | Mengubah data dalam transit atau parameter | Harga dikirim dari klien; SQLi mengubah query; upload berkas berbahaya | Harga dihitung server, query terparameter, validasi magic bytes **(A05, A06, A08)** |
| **R**epudiation | Menyangkal aksi karena tak ada jejak | Brute force tanpa log; aksi admin tak tercatat | Audit log + alert **(A09)** |
| **I**nformation Disclosure | Membocorkan data sensitif | IDOR booking/bukti bayar; stack trace; password MD5; sniffing HTTP | Cek kepemilikan, error generik, bcrypt, HTTPS **(A01, A02, A04)** |
| **D**enial of Service | Membebani / menggagalkan layanan | Login brute force; upload besar; error tak tertangani → crash | Rate limit, batas ukuran upload, error handler terpusat **(A07, A08, A10)** |
| **E**levation of Privilege | Menaikkan hak akses | Registrasi sebagai `admin`; akses endpoint admin tanpa peran; SSRF ke internal | Allowlist peran, `requireRole`, validasi tujuan URL **(A01)** |

## 5. Secure Coding (penerapan di kode)

- **Bahasa & tipe:** TypeScript `strict`, ESM; fungsi kecil satu tugas; struktur per modul (`routes → service → repository`).
- **Validasi input terpusat:** `lib/request.ts` + `*.input.ts` tiap modul (tipe, format tanggal/jam, sport, peran).
- **Akses data:** query **terparameter** di seluruh repository; pembangun `WHERE` aman di `lib/sql-where.ts`.
- **Auth:** `middleware/auth.ts` (`requireAuth`, `requireRole`), JWT di `lib/jwt.ts`, kebijakan password & bcrypt di `lib/password.ts`.
- **Error:** satu `error-handler.ts` memetakan error PostgreSQL ke status aman, pesan generik ke klien, detail hanya ke log server.
- **Saklar aman-default:** `SECURITY_MODE` kosong = `after`; mode before menolak `NODE_ENV=production` dan hanya `127.0.0.1`.
- **Rahasia:** `.env` (di-`gitignore`), disediakan `.env.example`; tidak ada kredensial di kode.

## 6. Verifikasi (SAST / DAST / Dependency Check)

| Jenis | Alat | Lingkup | Status |
|---|---|---|---|
| **SAST** (analisis statik) | Semgrep (`p/owasp-top-ten`, `p/javascript`), `tsc --noEmit`, ESLint | `backend/src`, `web/src` | `tsc` **bersih**; Semgrep dijalankan kelompok (alat GUI, lihat `before/README.md` §4) |
| **DAST** (uji dinamis) | `curl` harness (otomatis), OWASP ZAP / Burp | API `http://127.0.0.1:4000` | Harness **otomatis lengkap** (10 kategori, `before/raw/transcript.txt` & `after/raw/transcript.txt`); ZAP/Burp = screenshot kelompok |
| **Dependency check** | `npm audit` | `backend/package.json` | Before: **11 vuln (2 kritis)**; After: 0 kritis setelah perbaikan (`DEPS-A03.md`) |
| **Verifikasi transport** | Wireshark | Loopback saat login | Membuktikan A04 (kredensial plaintext di HTTP before) |

## 7. Konfigurasi & Deployment Aman

- **Header:** `helmet` (CSP, HSTS, `X-Content-Type-Options`, `frame-ancestors`), `x-powered-by` dimatikan.
- **CORS:** hanya origin pada `CORS_ORIGINS`.
- **HTTPS:** di produksi `trust proxy` + redirect 308 ke HTTPS + HSTS.
- **Rahasia produksi:** `JWT_SECRET` ≥ 32 karakter acak (diwajibkan di mode after), `SEED_PASSWORD` tidak di kode.
- **Pembatasan mode before:** tidak boleh di-deploy (ditolak saat `NODE_ENV=production`, hanya `127.0.0.1`), ditandai pita "MODE BEFORE" di web.
- **Database:** koneksi `sslmode=verify-full`; branch Neon terpisah untuk Before/After agar data uji & format hash tidak bercampur.

## 8. Keterlacakan (traceability)

Tiap celah punya pasangan penanda di kode: `// [VULN-Axx]` (cabang before) dan `// [FIXED-Axx]` (cabang after) di lokasi yang sama, sehingga mudah diaudit. Peta lokasi ada di tabel [`before/README.md`](before/README.md) §2, dan bukti sebelum/sesudah di [`after/README.md`](after/README.md) §2.
