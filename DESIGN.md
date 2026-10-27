# DESIGN.md — Sistem Desain Venu: "Night Match"

Satu bahasa visual untuk **web** (React + Tailwind) dan **mobile** (Expo + NativeWind).
Gaya: **sporty, energik, tegas** — seperti papan skor dan lapangan di bawah lampu stadion malam. Gelap sebagai dasar, satu warna "volt" yang menyala untuk aksi, huruf condensed tebal kapital untuk judul, angka besar ala papan skor.

> Riwayat: versi awal (Ivory/Navy/Emas + Playfair, gaya luxury) diganti pada 2026-10-27 atas permintaan user karena terasa generik dan kurang sporty.

---

## 1. Prinsip

1. **Seperti papan skor:** informasi penting (harga, jam, angka statistik) tampil besar dan tegas memakai huruf condensed dan angka tabular.
2. **Volt hanya untuk aksi dan sorotan:** warna aksen dipakai hemat untuk CTA, status aktif, dan angka kunci. Bila semua menyala, tidak ada yang menonjol.
3. **Gerak maju:** garis diagonal, panah, dan judul miring memberi kesan dinamis. Pakai secukupnya, jangan di setiap elemen.
4. **Mudah dibaca:** kontras memenuhi WCAG AA, target sentuh minimal 44px, isi teks tetap huruf biasa (bukan kapital semua).
5. **Aman secara UX:** pesan error login generik (tidak membocorkan email terdaftar atau tidak), konfirmasi sebelum aksi destruktif.
6. **Konsisten lintas platform:** token warna, huruf, jarak, dan radius sama persis di web dan mobile.

---

## 2. Warna — Aturan 60 / 30 / 10

Palet: **Ink & Asphalt (dasar gelap) · Chalk (teks & garis) · Volt (aksen)**.

| Peran       | Porsi   | Token       | Hex       | Dipakai untuk                                                  |
| ----------- | ------- | ----------- | --------- | -------------------------------------------------------------- |
| **Dasar**   | **60%** | `ink`       | `#0B0D10` | Latar halaman, navbar, footer                                  |
|             |         | `surface`   | `#14181D` | Kartu, panel, modal, baris tabel                               |
|             |         | `surface-2` | `#1C2128` | Input, header tabel, hover, chip tidak aktif                   |
| **Isi**     | **30%** | `fg`        | `#F2F4F1` | Teks utama, judul, ikon                                        |
|             |         | `muted`     | `#9AA3AE` | Teks sekunder, label, placeholder                              |
|             |         | `line`      | `#2A3039` | Garis kartu, pemisah, border input                             |
| **Aksen**   | **10%** | `volt`      | `#C6FF1A` | Tombol aksi utama, indikator aktif, slot dipilih, angka sorot |
|             |         | `volt-600`  | `#A8E000` | Hover/pressed tombol volt                                      |

**Semantik (status)** — warna terang karena dipakai di atas latar gelap:

| Token     | Hex       | Pakai                                   |
| --------- | --------- | --------------------------------------- |
| `success` | `#34D399` | Dikonfirmasi, lunas                     |
| `warning` | `#FFB020` | Menunggu, menunggu verifikasi           |
| `danger`  | `#FF5C5C` | Ditolak, dibatalkan, gagal, hapus       |
| `info`    | `#4DA3FF` | Selesai, informasi netral               |

Badge status: teks warna semantik + latar warna yang sama dengan opasitas 12% + garis kiri 2px warna yang sama.

**Aturan penggunaan (penting):**

- Gelap (Ink/Asphalt) mendominasi ±60% layar, teks/garis Chalk ±30%, Volt **tidak lebih dari ~10%**.
- **Teks di atas tombol Volt selalu Ink** (`#0B0D10`), kontras ±16:1.
- Volt boleh dipakai sebagai warna teks di atas latar gelap (kontras ±16:1), tetapi **jangan untuk paragraf**, hanya angka sorot, label aktif, dan tautan pendek.
- Status tidak boleh hanya mengandalkan warna: selalu sertakan ikon atau label teks.
- Tidak ada mode terang di versi ini. `color-scheme: dark` dipakai agar kontrol bawaan browser (kalender, scrollbar) ikut gelap.

Kontras yang sudah dicek: Chalk di Ink ±18:1, Muted di Asphalt ±7:1, Danger di Asphalt ±5.9:1, Volt di Ink ±16:1.

---

## 3. Tipografi

| Peran           | Font                                  | Dipakai untuk                                        |
| --------------- | ------------------------------------- | ---------------------------------------------------- |
| Display / judul | **Barlow Condensed** (600, 700, 800, 800 italic) | Judul halaman, angka statistik, harga, jam slot, label tombol, navigasi |
| UI / isi        | **Barlow** (400, 500, 600, 700)       | Paragraf, deskripsi, isi form, isi tabel             |

Pemasangan:

- Web: `@fontsource/barlow-condensed` dan `@fontsource/barlow`.
- Mobile: `@expo-google-fonts/barlow-condensed` dan `@expo-google-fonts/barlow`.

Skala (web / mobile):

| Token   | Web     | Mobile  | Font             | Gaya                               |
| ------- | ------- | ------- | ---------------- | ---------------------------------- |
| Display | 72 / 68 | 44 / 42 | Barlow Condensed | 800 italic, KAPITAL, tracking -1%  |
| H1      | 48 / 48 | 34 / 36 | Barlow Condensed | 800, KAPITAL                       |
| H2      | 30 / 34 | 24 / 28 | Barlow Condensed | 700, KAPITAL                       |
| H3      | 20 / 26 | 18 / 24 | Barlow Condensed | 700, KAPITAL, tracking +2%         |
| Score   | 40 / 40 | 32 / 32 | Barlow Condensed | 800, angka tabular                 |
| Body    | 16 / 24 | 16 / 24 | Barlow           | 400                                |
| Small   | 14 / 20 | 14 / 20 | Barlow           | 400                                |
| Label   | 12 / 16 | 12 / 16 | Barlow Condensed | 700, KAPITAL, tracking +12%        |

Judul dan label boleh kapital semua. Paragraf, isi form, dan pesan error **tidak** kapital semua.

---

## 4. Jarak, Radius, Garis

- **Grid jarak 4px.** Skala: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Radius kecil dan tegas:** `sm` 2px (badge), `md` 4px (tombol, input, chip), `lg` 8px (kartu, modal). Jangan lebih bulat.
- **Garis lebih dari bayangan:** border 1px `line`. Bayangan hanya untuk modal dan toast: `0 16px 40px rgba(0,0,0,0.5)`.
- **Aksen diagonal:** pola garis miring 45° (`repeating-linear-gradient`) dipakai untuk latar placeholder foto, slot tidak tersedia, dan dekorasi hero.
- **Lebar konten web:** maksimum 1200px, tengah. Mobile: padding horizontal 16.

---

## 5. Komponen

**Tombol** (label Barlow Condensed 700, kapital, tracking +4%)

- _Primer (CTA):_ latar Volt, teks Ink, hover Volt 600, ikon panah di kanan. Satu CTA utama per layar.
- _Sekunder:_ latar `surface-2`, border `line`, teks `fg`, hover border `fg`.
- _Ghost:_ tanpa latar, teks `fg`, hover latar `surface-2`.
- _Destruktif:_ latar Danger, teks Ink. _Pemicu destruktif di daftar:_ garis Danger, teks Danger. Selalu dengan konfirmasi.
- Tinggi 44px (40px untuk ukuran kecil di tabel). Fokus: ring Volt 2px offset 2px.

**Input**

- Latar `surface-2`, border `line`, radius 4, tinggi 44px, teks `fg`. Fokus: border Volt. Error: border Danger + pesan di bawah dengan ikon.
- Label selalu di atas input (Barlow Condensed, kapital kecil).

**Baris lapangan ("fixture")** — pengganti kartu seragam

- Satu baris per lapangan: nomor urut besar (`01`), foto kecil 16:9 atau placeholder bergaris diagonal, nama KAPITAL condensed, kota + badge olahraga, rating, harga besar di kanan, panah. Hover: border kiri Volt dan latar `surface-2`.
- Di mobile, baris menjadi tumpukan vertikal dengan harga tetap menonjol.

**Badge**

- Status: teks semantik + latar 12% + garis kiri 2px, label kapital condensed, disertai ikon kecil.
- Olahraga: garis `line`, teks `fg`, kapital condensed.

**Navigasi**

- _Web:_ navbar Ink tinggi 64px, logo "VENU" condensed 800 italic dengan garis miring Volt, menu kapital condensed, menu aktif ditandai bar Volt 3px di bawah.
- _Mobile:_ bottom tab bar Ink, ikon aktif Volt, tidak aktif `muted`.

**Papan skor (statistik)**

- Angka besar Barlow Condensed 800 (token Score), label kapital kecil `muted`, garis atas 2px Volt pada kartu yang paling penting saja.

**Tabel**

- Header `surface-2` dengan label kapital, baris dipisah garis `line`, hover `surface-2`. Aksi baris berupa ikon di kanan.

**Pemilih slot jam**

- Kotak 44px berisi jam condensed: tersedia (`surface-2`, border `line`), dipilih (latar Volt, teks Ink), tidak tersedia (pola diagonal, teks `muted` dicoret, nonaktif). Jangan hanya mengandalkan warna.

**Modal / Toast / Empty state / Skeleton**

- Modal: panel `surface` radius 8, border `line`, overlay hitam 70%. Toast: `surface-2` dengan garis kiri warna status + ikon, 3 detik. Empty state: ikon bergaris besar, judul H2, satu tombol aksi. Loading memakai skeleton (`surface-2` berdenyut), bukan spinner layar penuh.

**Banner mode keamanan**

- Saat aplikasi berjalan di mode `before` (rentan), tampil pita peringatan berpola diagonal Warning di atas navbar: "MODE BEFORE — RENTAN, HANYA UNTUK PENGUJIAN LOKAL".

---

## 6. Ikon dan Gambar

- Ikon: **Lucide** (`lucide-react` di web, `lucide-react-native` di mobile), stroke 1.75–2, ukuran 16/20/24.
- Foto lapangan: tampil tanpa filter berlebihan. Gradien Ink tipis di bawah foto hanya bila ada teks di atasnya.
- Placeholder tanpa foto: pola diagonal + inisial olahraga besar (mis. "FUT").
- Jangan campur gaya ikon (hanya satu keluarga).

## 7. Gerak (Motion)

- Durasi 150–200ms, easing `ease-out`. Untuk hover, fokus, buka/tutup modal, dan geser panah CTA 2px saat hover.
- Hormati `prefers-reduced-motion` (web) dan pengaturan reduce motion (mobile).
- Tidak ada animasi berkedip atau memantul.

## 8. Aksesibilitas

- Kontras minimal WCAG AA (teks biasa 4.5:1). Pasangan warna di Bagian 2 sudah memenuhi bila aturannya diikuti.
- Semua elemen interaktif dapat difokus dan punya ring fokus Volt yang terlihat.
- Gambar punya teks alternatif. Form punya label dan pesan error yang dibacakan pembaca layar.
- Target sentuh minimal 44x44.

---

## 9. Layar Utama

| Layar             | Isi pokok                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| Beranda           | Hero judul display miring + pilihan olahraga besar + pencarian cepat, strip papan skor (jumlah lapangan/kota), daftar fixture lapangan |
| Cari Lapangan     | Strip filter horizontal (olahraga, nama, lokasi, harga, urutan), daftar fixture                                |
| Detail Lapangan   | Judul besar, info & fasilitas, panel jadwal (tanggal, grid slot, ringkasan harga ala papan skor), CTA "Pesan"  |
| Checkout          | Ringkasan booking ala tiket, metode bayar (simulasi), upload bukti bayar                                       |
| Riwayat           | Daftar booking ala tiket dengan badge status, aksi bayar/batal/ulas                                             |
| Login / Register  | Panel terpusat di latar Ink berpola diagonal, pesan error generik                                              |
| Dashboard Pemilik | Papan skor statistik, tabel booking masuk, kelola lapangan                                                     |
| Panel Admin       | Papan skor ringkasan, tabel user dan lapangan, log aktivitas                                                   |

---

## 10. Token Implementasi

**Web — Tailwind v4 (`web/src/index.css`)**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0b0d10;
  --color-surface: #14181d;
  --color-surface-2: #1c2128;
  --color-line: #2a3039;
  --color-fg: #f2f4f1;
  --color-muted: #9aa3ae;
  --color-volt: #c6ff1a;
  --color-volt-600: #a8e000;
  --color-success: #34d399;
  --color-warning: #ffb020;
  --color-danger: #ff5c5c;
  --color-info: #4da3ff;

  --font-display: "Barlow Condensed", "Arial Narrow", sans-serif;
  --font-sans: "Barlow", system-ui, sans-serif;

  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 8px;

  --shadow-pop: 0 16px 40px rgba(0, 0, 0, 0.5);
}

html {
  color-scheme: dark;
}

body {
  background: var(--color-ink);
  color: var(--color-fg);
  font-family: var(--font-sans);
}
```

**Mobile — NativeWind (`mobile/tailwind.config.js`)**
Pakai nama dan nilai warna yang sama persis. Cek dokumentasi NativeWind untuk versi yang terpasang karena cara konfigurasinya dapat berbeda antar versi.

```js
theme: {
  extend: {
    colors: {
      ink: '#0B0D10', surface: '#14181D', 'surface-2': '#1C2128', line: '#2A3039',
      fg: '#F2F4F1', muted: '#9AA3AE',
      volt: { DEFAULT: '#C6FF1A', 600: '#A8E000' },
      success: '#34D399', warning: '#FFB020', danger: '#FF5C5C', info: '#4DA3FF',
    },
    fontFamily: {
      display: ['BarlowCondensed_800ExtraBold'],
      'display-italic': ['BarlowCondensed_800ExtraBold_Italic'],
      sans: ['Barlow_400Regular'],
    },
    borderRadius: { sm: '2px', md: '4px', lg: '8px' },
  },
},
```

**Aturan konsistensi:** jika sebuah token diubah, ubah di **kedua** tempat dan di dokumen ini.

---

## 11. Checklist Visual (sebelum menyelesaikan CP6 / CP11)

Status web diperiksa lewat screenshot desktop 1280px dan mobile 390px (2026-10-27). Mobile app (CP11) belum dibuat.

- [x] Komposisi kira-kira 60 gelap / 30 teks & garis / 10 Volt
- [x] Volt hanya untuk CTA, indikator aktif, dan angka sorot (tidak untuk paragraf)
- [x] Judul, label, angka memakai Barlow Condensed; isi memakai Barlow
- [x] Satu CTA Volt utama per layar
- [x] Kontras dan ring fokus lolos AA
- [ ] Tampilan web dan mobile terasa satu keluarga (menunggu CP11)
