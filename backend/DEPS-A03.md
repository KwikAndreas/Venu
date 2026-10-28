# Catatan Dependensi — A03 Software Supply Chain Failures

Celah A03 **tidak** bisa dinyalakan lewat `SECURITY_MODE` seperti celah lain, karena ini sifat
dari versi paket yang terpasang (lockfile), bukan logika runtime. Karena itu A03 memakai **tag Git**:

- **Before (`v1-before`):** dependensi di bawah sengaja dipin ke versi lama yang diketahui rentan.
- **After (`v2-after`):** dependensi diperbarui hingga `npm audit` bersih.

## [VULN-A03] Dependensi rentan yang sengaja dipin (mode Before)

Di `package.json` (versi dipin persis, tanpa `^`, agar tidak otomatis naik):

| Paket      | Versi    | Contoh advisory                                   |
| ---------- | -------- | ------------------------------------------------- |
| `lodash`   | 4.17.11  | Prototype Pollution (GHSA-jf85-cpcp-j695), Command Injection via `_.template`, ReDoS |
| `minimist` | 0.0.8    | Prototype Pollution (GHSA-vh95-rmgr-6w4m, GHSA-xvch-5gv4-984h) |

Kedua paket **tidak diimpor** di kode aktif (`src/`); keduanya hanya ada untuk menghasilkan temuan
nyata saat diuji dengan `npm audit`, OWASP Dependency-Check, atau Semgrep. Jadi aplikasi tetap
berjalan sama di mode before maupun after.

Bukti Before:

```bash
cd backend
npm audit                       # menampilkan 2 kerentanan critical (lodash, minimist)
npm audit --json > ../docs/before/npm-audit.json
```

## [FIXED-A03] Perbaikan (mode After / tag v2-after)

```bash
cd backend
npm uninstall lodash minimist   # paket tidak dipakai → cukup dihapus
# atau, bila memang ingin memakainya: npm install lodash@latest minimist@latest
npm audit                       # harus "found 0 vulnerabilities"
npm audit --json > ../docs/after/npm-audit.json
```

Prinsip Secure SDLC yang ditunjukkan: kunci versi dependensi (lockfile), pindai kerentanan secara
rutin (`npm audit` / Dependency-Check di CI), dan perbarui paket yang rentan.
