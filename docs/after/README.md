# Pengujian After — OWASP Top 10:2025 (CP10)

> **Ditujukan untuk:** dosen/penguji mata kuliah *Secure Application Development* dan anggota kelompok.
> Dokumen ini mengulang **pengujian yang sama persis** dengan versi Before ([`../before/README.md`](../before/README.md)), tetapi pada **versi After** (`SECURITY_MODE=after`), yaitu setelah menerapkan *Secure Application Development*. Prosesnya dijelaskan di [`../sad-process.md`](../sad-process.md).

## 1. Lingkungan pengujian

| Hal | Nilai |
|---|---|
| Mode | `SECURITY_MODE=after` (celah ditutup) |
| Server | `http://127.0.0.1:4000` |
| Database | PostgreSQL (Neon), data dummy |
| Tanggal uji | 2026-11-16 |
| Skenario & alat | **identik** dengan Before (`curl`, canary SSRF). Transkrip lengkap: **[`raw/transcript.txt`](raw/transcript.txt)** |

## 2. Tabel perbandingan Before vs After

Setiap baris memakai **skenario, endpoint, dan payload yang sama**. "Rentan" = serangan berhasil; "Aman" = serangan ditolak.

| ID | Uji | Before (hasil) | After (hasil) | Status |
|---|---|---|---|---|
| A01 | Daftar `role:"admin"` | `201` akun admin dibuat | `400 "Peran harus penyewa atau pemilik"` | ✅ Teratasi |
| A01 | IDOR `GET /bookings/:id` orang lain | `200` data bocor | `404 "Booking tidak ditemukan"` | ✅ Teratasi |
| A01 | IDOR `GET /payments/:id/proof` orang lain | `200` + berkas | `404` | ✅ Teratasi |
| A01 | SSRF `POST /venues/:id/photo-url` → internal | server menembak internal (**canary kena**) | `400 "Tujuan URL tidak diizinkan"` (**0 hit**) | ✅ Teratasi |
| A02 | Header keamanan | `X-Powered-By` ada, CORS `*`, tanpa CSP | **CSP, HSTS, nosniff, X-Frame** ada; `X-Powered-By` hilang; CORS dibatasi | ✅ Teratasi |
| A02 | Stack trace saat error | field `stack` + path bocor | hanya `{"message":…}` generik | ✅ Teratasi |
| A03 | `npm audit` | **11 vuln (2 kritis:** lodash, minimist**)** | **0 kritis** (sisa 9 *moderate* hanya di `devDependencies` lint, tak masuk produksi) | ✅ Teratasi |
| A04 | Format `password_hash` | MD5 `33b2e7f4…` (32 hex) | **bcrypt** `$2b$12$…` (60 char) | ✅ Teratasi |
| A05 | `q=' OR '1'='1' --` | `10` baris (semua bocor) | `0` (diperlakukan literal) | ✅ Teratasi |
| A05 | `q='` (error-based) | `500` + error SQL bocor | `200 {"venues":[]}` tanpa error | ✅ Teratasi |
| A06 | Booking `total_harga:1` | tersimpan `1` | server hitung → `100000` | ✅ Teratasi |
| A06 | Double booking slot sama | `201` (dobel) | `409 "Slot sudah dibooking orang lain"` | ✅ Teratasi |
| A07 | Enumerasi (email asing vs pw salah) | `404` vs `401` (beda) | `401 "Email atau password salah"` (sama) | ✅ Teratasi |
| A07 | Registrasi password `123` | `201` diterima | `400 "Password minimal 8 karakter"` | ✅ Teratasi |
| A07 | Klaim `exp` pada token | **tidak ada** | **ada** `exp` + `jti` | ✅ Teratasi |
| A07 | Token setelah logout | `GET /me` → `200` | `GET /me` → `401` (dicabut) | ✅ Teratasi |
| A08 | Upload `evil.html` sebagai gambar | `200`, tersaji `<script>` | `400` ditolak | ✅ Teratasi |
| A09 | `audit_logs` setelah login gagal | delta `0` | delta `1` (tercatat) | ✅ Teratasi |
| A10 | Konfirmasi booking tanpa bukti bayar | `200` `dikonfirmasi` (fail-open) | `409 "Penyewa belum mengirim bukti bayar"` | ✅ Teratasi |

**Hasil: 10/10 kategori berubah dari Rentan → Aman.**

## 3. Bagaimana setiap celah ditutup (pasangan `[FIXED-Axx]`)

| ID | Perbaikan inti |
|---|---|
| A01 | Cek kepemilikan pada tiap akses booking/pembayaran (milik orang lain → 404); allowlist peran saat registrasi; validasi tujuan URL anti-SSRF (tolak loopback/privat/link-local/metadata) di `lib/url-image.ts`. |
| A02 | `helmet` (CSP, HSTS, nosniff, frame-ancestors), `x-powered-by` dimatikan, CORS dibatasi `CORS_ORIGINS`; error handler mengirim pesan generik & hanya log di server. |
| A03 | Hapus/upgrade `lodash` & `minimist` yang rentan; `npm audit` bersih; lockfile terkunci (lihat `backend/DEPS-A03.md`). |
| A04 | `bcrypt` cost 12 + rehash otomatis hash MD5 lama saat login; HTTPS + HSTS dipaksa di produksi. |
| A05 | Query **terparameter** (`$1,$2,…`) untuk pencarian; output komentar ulasan dirender sebagai teks (bukan HTML). |
| A06 | Total harga **dihitung server** dari harga lapangan; booking dalam transaksi terkunci + cek bentrok slot. |
| A07 | Pesan/los waktu login seragam (anti-enumeration), kebijakan password, token `exp` 2 jam + `jti`, denylist token saat logout, rate limit login/registrasi. |
| A08 | Verifikasi tipe dari **magic bytes**, nama berkas diganti UUID, penyimpanan aman + anti path-traversal. |
| A09 | `recordAudit`/`recordFailedLogin` aktif; alert saat 5 login gagal/15 menit dari satu IP. |
| A10 | Konfirmasi booking dalam **satu transaksi** dengan syarat bukti bayar; gagal → rollback (*fail secure*). |

## 4. Catatan A03 (versi After)

A03 tidak bisa diaktif/nonaktifkan lewat saklar runtime (menyangkut berkas dependensi), sehingga dibedakan lewat **tag Git**: `v1-before` masih memin `lodash@4.17.11` & `minimist@0.0.8`. Untuk versi After, kedua paket **sudah dihapus** (`npm uninstall lodash minimist`; keduanya tidak di-impor aplikasi). `npm audit` kini melaporkan **0 kritis & 0 high** (sisa 9 *moderate* berasal dari `devDependencies` toolchain ESLint/`typescript-eslint`, tidak ikut ke bundel produksi). Keluaran tersimpan di [`raw/npm-audit-after.txt`](raw/npm-audit-after.txt). Langkah lengkap: [`../../backend/DEPS-A03.md`](../../backend/DEPS-A03.md).

## 5. Uji ulang GUI (anggota kelompok)

Ulangi langkah §4 pada [`../before/README.md`](../before/README.md) (OWASP ZAP/Burp, Semgrep, Wireshark) pada mode after dan simpan ke folder ini: hasil yang diharapkan adalah **alert hilang / jauh berkurang**, header keamanan muncul di ZAP, Semgrep bersih pada jalur yang diperbaiki, dan Wireshark tidak lagi menampilkan kredensial (bila diuji lewat HTTPS/produksi).

## 6. Kesimpulan After

Dengan menerapkan *Secure Application Development*, **seluruh 10 kategori OWASP Top 10:2025 yang sebelumnya rentan kini tertutup**, diuji dengan skenario yang sama. Rangkuman dan grafik ada di laporan akhir [`../laporan.md`](../laporan.md).
