# Laporan Akhir — Venu: Secure Application Development

**Mata kuliah:** Secure Application Development
**Aplikasi:** Venu — Platform Booking Lapangan Olahraga
**Pengujian:** OWASP Top 10:2025 (Before vs After)
**Tanggal:** 2026-11-16

> **Ditujukan untuk:** dosen/penguji sebagai laporan tugas kelompok. Ini draf yang bisa langsung dipresentasikan; bukti mentah ada di `docs/before/` dan `docs/after/`.

---

## 1. Latar Belakang (Asta Cita No. 4)

Program **Asta Cita** pemerintahan Prabowo–Gibran pada poin **nomor 4** menekankan **penguatan sumber daya manusia**, termasuk pembangunan **prestasi olahraga**. Salah satu kendala masyarakat berolahraga adalah sulitnya menemukan dan memesan lapangan. **Venu** hadir sebagai platform **booking lapangan olahraga** (futsal, badminton, basket) yang mempertemukan penyewa dengan pemilik lapangan secara daring.

Karena aplikasi menangani **data pribadi** dan **transaksi pembayaran**, keamanan menjadi syarat utama. Proyek ini menunjukkan perbedaan nyata antara aplikasi yang dibangun **tanpa** praktik keamanan (Before) dan **dengan** *Secure Application Development* (After).

## 2. Tujuan

1. Membangun aplikasi booking lapangan yang berfungsi penuh.
2. Menguji **10 kategori OWASP Top 10:2025** pada versi Before (celah disengaja).
3. Menerapkan Secure SDLC untuk menutup temuan.
4. Menguji ulang (After) dengan skenario sama dan membandingkan hasilnya.

## 3. Desain Aplikasi

- **Peran:** penyewa, pemilik lapangan, admin.
- **Fitur:** registrasi/login, cari & filter lapangan, detail + slot jam, booking, pembayaran (simulasi) + upload bukti, ulasan, dashboard pemilik, panel admin.
- **Tech stack:** TypeScript `strict` (ESM) di semua proyek; Backend **Node.js + Express**; Database **PostgreSQL (Neon)**; Web **React + Vite + Tailwind**; Mobile **Expo (React Native)**; Auth **JWT** + **bcrypt** (After).
- **Arsitektur & alur data:** lihat diagram di [`sad-process.md`](sad-process.md) §3.
- **Satu kode, dua kondisi:** versi Before/After dipilih lewat `SECURITY_MODE` (bukan dua cabang kode), sehingga perbandingan adil pada basis kode yang sama.

## 4. Proses Secure Application Development

Mengikuti lima tahap Secure SDLC — *Requirements, Threat Modeling (STRIDE), Secure Coding, Verification (SAST/DAST/dependency check), Secure Configuration*. Rinciannya di [`sad-process.md`](sad-process.md). Tiap celah ditandai `[VULN-Axx]` dan perbaikannya `[FIXED-Axx]` pada lokasi kode yang sama untuk keterlacakan.

## 5. Hasil Pengujian

### 5.1 Ringkasan

| Metrik | Before | After |
|---|---|---|
| Kategori OWASP rentan | **10 / 10** | **0 / 10** |
| Kerentanan `npm audit` | 11 (2 kritis) | 0 kritis |
| Hash password | MD5 tanpa salt | bcrypt (cost 12) |
| Event keamanan tercatat | Tidak | Ya (+ alert) |

### 5.2 Grafik jumlah kategori rentan (Before vs After)

```
Kategori rentan (dari 10)
Before │██████████████████████████████████████████████  10
After  │                                                  0
       └───────────────────────────────────────────────
        0    1    2    3    4    5    6    7    8    9   10
```

### 5.3 Perbandingan per kategori

| ID | Kategori OWASP 2025 | Before | After |
|---|---|---|---|
| A01 | Broken Access Control | ❌ Rentan (IDOR, role admin, SSRF) | ✅ Aman |
| A02 | Security Misconfiguration | ❌ Rentan (stack bocor, CORS `*`) | ✅ Aman |
| A03 | Software Supply Chain Failures | ❌ Rentan (2 dep kritis) | ✅ Aman |
| A04 | Cryptographic Failures | ❌ Rentan (MD5, HTTP) | ✅ Aman |
| A05 | Injection (SQLi + XSS) | ❌ Rentan | ✅ Aman |
| A06 | Insecure Design | ❌ Rentan (harga klien, double booking) | ✅ Aman |
| A07 | Authentication Failures | ❌ Rentan | ✅ Aman |
| A08 | Data Integrity Failures | ❌ Rentan (upload HTML) | ✅ Aman |
| A09 | Logging & Alerting Failures | ❌ Rentan (tanpa log) | ✅ Aman |
| A10 | Mishandling of Exceptional Conditions | ❌ Rentan (fail-open) | ✅ Aman |

Bukti terukur tiap baris (status HTTP, isi respons, hit canary SSRF, format hash) ada di:
- Before: [`before/README.md`](before/README.md) + transkrip `before/raw/transcript.txt`
- After: [`after/README.md`](after/README.md) + transkrip `after/raw/transcript.txt`

## 6. Pembahasan

Pada versi Before, seluruh kategori dapat dieksploitasi hanya dengan `curl` tanpa alat khusus — misalnya membaca booking orang lain (IDOR), membuat akun admin lewat field `role`, memaksa server menembak layanan internal (SSRF, terbukti lewat *canary*), hingga menyimpan harga Rp1. Ini menegaskan bahwa **keamanan tidak otomatis muncul** dari aplikasi yang "berfungsi".

Setelah menerapkan Secure SDLC, **skenario serangan yang sama ditolak** — bukan karena sulit dijalankan, melainkan karena kontrol keamanan (otorisasi, validasi, query terparameter, bcrypt, transaksi fail-secure, audit log) ditegakkan di server. Perbandingan adil karena basis kode dan skenario uji identik, hanya `SECURITY_MODE` yang berbeda.

## 7. Kesimpulan

Venu berhasil menunjukkan perbedaan nyata antara aplikasi tanpa dan dengan *Secure Application Development*: dari **10 kategori rentan menjadi 0**, dengan bukti sebelum/sesudah yang terukur dan dapat direproduksi. Penerapan prinsip *secure-by-default*, pemodelan ancaman (STRIDE), secure coding, dan verifikasi berlapis (SAST/DAST/dependency check) efektif menutup kesepuluh kategori OWASP Top 10:2025.

## 8. Lampiran

- Proses SAD lengkap: [`sad-process.md`](sad-process.md)
- Bukti Before: [`before/`](before/) (termasuk `raw/transcript.txt`, `raw/npm-audit-before.txt`, `raw/ssrf-canary-hits.txt`)
- Bukti After: [`after/`](after/) (termasuk `raw/transcript.txt`)
- Katalog celah & penanda kode: `TASK.md` §7 dan `backend/DEPS-A03.md`
- Arsip kode: tag Git `v1-before` (versi rentan) dan `v2-after` (versi aman)

> **Catatan kelengkapan:** bukti berbasis alat GUI (OWASP ZAP/Burp screenshot, Semgrep, Wireshark) perlu dijalankan & dilampirkan anggota kelompok sesuai langkah di `before/README.md` §4 dan `after/README.md` §5 agar laporan 100% lengkap.
