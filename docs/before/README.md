# Pengujian Before — OWASP Top 10:2025 (CP8)

> **Ditujukan untuk:** dosen/penguji mata kuliah *Secure Application Development* dan anggota kelompok.
> Dokumen ini merangkum hasil pengujian **versi Before** aplikasi **Venu** (platform booking lapangan olahraga), yaitu versi dengan celah keamanan yang **sengaja ditanam** sebagai bahan pembelajaran. Perbandingan dengan versi After ada di [`../after/README.md`](../after/README.md).

## 1. Lingkungan pengujian

| Hal | Nilai |
|---|---|
| Mode | `SECURITY_MODE=before` (celah aktif) |
| Server | `http://127.0.0.1:4000` — hanya localhost (pengaman mode before) |
| Banner server | `Venu API berjalan di http://127.0.0.1:4000 — mode BEFORE` |
| Database | PostgreSQL (Neon), data dummy |
| Tanggal uji | 2026-11-16 |
| Alat | `curl` (otomatis, lihat `raw/transcript.txt`), `npm audit`, server "canary" untuk SSRF. OWASP ZAP & Semgrep: lihat §4. |

Seluruh langkah otomatis dijalankan ulang oleh skrip harness dan tercatat lengkap di **[`raw/transcript.txt`](raw/transcript.txt)**. Data uji (akun `sectest-*`) dibuat saat pengujian lalu **dihapus** setelahnya, sehingga database kembali bersih.

## 2. Ringkasan temuan (10/10 kategori rentan)

| ID | OWASP 2025 | Lokasi kode | Cara uji singkat | Bukti (hasil Before) | Risiko |
|---|---|---|---|---|---|
| A01 | Broken Access Control | `modules/bookings/booking.service.ts`, `modules/payments/payment.service.ts`, `modules/auth/auth.routes.ts`, `lib/url-image.ts` | IDOR `GET /bookings/:id` & `GET /payments/:id/proof` milik orang lain; daftar `role:"admin"`; SSRF `POST /venues/:id/photo-url` | Booking & bukti bayar orang lain **terbaca (200)**; akun **admin** berhasil dibuat; server **menembak layanan internal** (canary kena) | **Kritis** |
| A02 | Security Misconfiguration | `middleware/security.ts`, `middleware/error-handler.ts` | Cek header `GET /ping`; picu error `GET /tidak-ada` | `X-Powered-By: Express`, `Access-Control-Allow-Origin: *`, **tanpa** CSP/HSTS; **stack trace + path file bocor** ke klien | Tinggi |
| A03 | Software Supply Chain | `backend/package.json` (`lodash@4.17.11`, `minimist@0.0.8`) | `npm audit` | **11 kerentanan (2 kritis:** lodash & minimist *prototype pollution***)** | **Kritis** |
| A04 | Cryptographic Failures | `lib/password.ts`, `server.ts` | Lihat `password_hash` di DB; server HTTP polos | Hash **MD5 tanpa salt** (`33b2e7f4…`, 32 hex); jalan **HTTP** (bisa disadap Wireshark) | Tinggi |
| A05 | Injection (SQLi + XSS) | `modules/venues/venue.repository.ts`; `web` `VenueReviews.tsx` | `GET /venues?q=' OR '1'='1' --`; `q='`; komentar ulasan berisi `<script>` | Bypass filter → **semua baris bocor**; `q='` → **error SQL bocor** (injectable); komentar dirender sebagai HTML (stored XSS) | **Kritis** |
| A06 | Insecure Design | `modules/bookings/booking.input.ts`, `booking.service.ts` | Booking dengan `total_harga:1`; dua booking slot sama | Harga **Rp1 dipercaya**; **double booking** slot sama berhasil (201/201) | Tinggi |
| A07 | Authentication Failures | `modules/auth/*`, `lib/jwt.ts` | Login email asing vs password salah; daftar password `123`; decode token; logout lalu pakai token | **Pesan beda** (user enumeration); password **lemah diterima**; token **tanpa `exp`**; logout **tidak mencabut** token | Tinggi |
| A08 | Data Integrity Failures | `lib/storage.ts` | Upload `evil.html` menyamar `image/png` | **Diterima**, disimpan dengan **nama asli** `evil.html`, dan **tersaji berisi `<script>`** | Tinggi |
| A09 | Logging & Alerting Failures | `modules/audit/audit.service.ts` | Login gagal → hitung baris `audit_logs` | **Delta 0** — serangan **tidak tercatat**, tidak ada alert | Sedang |
| A10 | Mishandling of Exceptional Conditions | `modules/owner/owner.service.ts` | Owner konfirmasi booking **tanpa** bukti bayar | **200 → status `dikonfirmasi`** (fail-open, tanpa transaksi) | Tinggi |

## 3. Rincian bukti per kategori

Nilai di bawah dikutip langsung dari `raw/transcript.txt`.

### A01 — Broken Access Control
- **Privilege escalation:** `POST /auth/register` dengan `"role":"admin"` → `HTTP 201`, `user.role = admin`.
- **IDOR booking:** Penyewa B memanggil `GET /bookings/<id milik A>` → `HTTP 200`, mengembalikan data booking + info pembayaran milik A.
- **IDOR bukti bayar:** Penyewa B `GET /payments/<id milik A>/proof` → `HTTP 200`, berkas 70 byte terunduh.
- **SSRF:** Owner `POST /venues/:id/photo-url` dengan `{"url":"http://127.0.0.1:9099/ssrf-proof"}` → server **benar-benar mengakses** URL internal; berkas `raw/ssrf-canary-hits.txt` mencatat `GET /ssrf-proof`.

### A02 — Security Misconfiguration
- Header `GET /ping`: `X-Powered-By: Express` dan `Access-Control-Allow-Origin: *` (CORS terbuka total), tanpa CSP/HSTS/nosniff.
- `GET /tidak-ada-XXXX` → `HTTP 404` dengan field **`stack`** berisi jejak lengkap termasuk path absolut `…/backend/src/middleware/error-handler.ts:41`.

### A03 — Software Supply Chain Failures
- `npm audit`: **11 vulnerabilities (9 moderate, 2 critical)**. Kritis: `lodash` & `minimist` (*Prototype Pollution*). Lihat `raw/npm-audit-before.txt`. Detail cara & perbaikan: [`../../backend/DEPS-A03.md`](../../backend/DEPS-A03.md).

### A04 — Cryptographic Failures
- `password_hash` di DB: `33b2e7f44f3c403ba522549936ddf2f9` — **32 heksadesimal = MD5 tanpa salt**, sangat mudah dipecahkan (rainbow table).
- Server melayani **HTTP** polos → kredensial bisa disadap di jaringan (Wireshark, lihat §4).

### A05 — Injection
- **Boolean SQLi:** `GET /venues?q=' OR '1'='1' --` → **10 lapangan** (seluruh baris) lolos filter.
- **Error-based SQLi:** `GET /venues?q='` → `HTTP 500` dengan pesan `unterminated quoted string at or near "' ORDER BY v.created_at…"` → membuktikan input masuk mentah ke SQL.
- **Stored XSS:** komentar ulasan dirender via `dangerouslySetInnerHTML` di web, sehingga `<script>` pada komentar dieksekusi di browser korban (uji manual di UI).

### A06 — Insecure Design
- `POST /bookings` dengan `total_harga:1` pada slot Rp100.000 → `GET /bookings/:id` menampilkan `total_harga = 1` (harga klien dipercaya).
- Dua booking pada slot **08:00–09:00 yang sama** → keduanya `HTTP 201` (tidak ada lock/cek bentrok).

### A07 — Authentication Failures
- Login email tak terdaftar → `HTTP 404 "Email tidak terdaftar"`; email terdaftar + password salah → `HTTP 401 "Password salah"` ⇒ **user enumeration**.
- Registrasi password `"123"` → `HTTP 201` (diterima).
- Payload JWT: `{"role":"penyewa","iat":…,"sub":"36"}` — **tanpa `exp`** (berlaku selamanya).
- Login → `logout` (`HTTP 200`) → `GET /me` dengan token lama → **`HTTP 200`** (token tak dicabut).

### A08 — Software/Data Integrity Failures
- `POST /venues/:id/photo` meng-upload `evil.html` (`Content-Type: image/png` palsu) → `HTTP 200`, `foto_url = /uploads/venues/evil.html` (**nama asli dipertahankan**).
- `GET /uploads/venues/evil.html` → `HTTP 200` berisi `<html><script>alert(document.cookie)</script>…`.

### A09 — Security Logging & Alerting Failures
- Jumlah baris `audit_logs` **sebelum = sesudah** satu login gagal (**delta 0**) ⇒ percobaan brute force tidak meninggalkan jejak dan tidak memicu alert.

### A10 — Mishandling of Exceptional Conditions
- `POST /owner/bookings/:id/confirm` untuk booking **tanpa** pembayaran → `HTTP 200`, status menjadi `dikonfirmasi` (**fail-open**, tanpa transaksi).

## 4. Uji manual tambahan (dilakukan anggota kelompok — alat GUI)

Alat berikut **tidak otomatis** di harness ini dan disarankan dijalankan + di-screenshot oleh kelompok sebagai bukti tambahan:

1. **OWASP ZAP / Burp Suite** — *Automated Scan* ke `http://127.0.0.1:4000`.
   - Konfirmasi A02 (header hilang, CORS `*`), A05 (fuzz `q`/`lokasi` dengan payload SQLi), A01 (ganti `:id` pada `/bookings`, `/payments`).
   - Simpan laporan HTML ZAP ke `docs/before/zap-report.html` + screenshot alert.
2. **Semgrep** (tidak terpasang di mesin ini) — jalankan:
   ```
   npx semgrep --config p/owasp-top-ten --config p/javascript backend/src web/src > docs/before/semgrep-before.txt
   ```
   Harapan: temuan SQLi string-concat (`venue.repository.ts`), `dangerouslySetInnerHTML` (web), MD5 (`password.ts`).
3. **Wireshark** (A04) — rekam loopback saat login di mode before; tampilkan **email & password terlihat plaintext** pada paket HTTP POST `/auth/login`. Simpan screenshot ke `docs/before/`.

## 5. Kesimpulan Before

Seluruh **10 kategori OWASP Top 10:2025** terbukti rentan pada versi Before dengan bukti terukur. Semua celah bertanda `[VULN-Axx]` di kode dan dinyalakan oleh `SECURITY_MODE=before`. Perbaikan dan pengujian ulang (After) ada di [`../after/README.md`](../after/README.md).
