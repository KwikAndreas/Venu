# DESIGN.md — Sistem Desain Venu

Satu bahasa visual untuk **web** (React + Tailwind) dan **mobile** (Expo + NativeWind).
Gaya: **enterprise, modern, elegan, kesan luxury** — tenang, rapi, banyak ruang kosong, detail halus. Bukan gaya "gamer" atau penuh warna.

---

## 1. Prinsip

1. **Tenang dan lapang:** ruang putih lega, hirarki jelas, tidak ramai.
2. **Emas hanya untuk hal penting:** aksen dipakai hemat (aksi utama, sorotan, status penting).
3. **Konsisten lintas platform:** token warna, huruf, jarak, dan radius sama persis di web dan mobile.
4. **Mudah dibaca:** kontras memenuhi WCAG AA, target sentuh minimal 44px.
5. **Aman secara UX:** pesan error generik untuk login (tidak membocorkan email terdaftar atau tidak), konfirmasi sebelum aksi destruktif.

---

## 2. Warna — Aturan 60 / 30 / 10

Palet: **Ivory (utama) · Midnight Navy (sekunder) · Champagne Gold (aksen)**.

| Peran        | Porsi   | Nama           | Hex       | Dipakai untuk                                                   |
| ------------ | ------- | -------------- | --------- | --------------------------------------------------------------- |
| **Utama**    | **60%** | Ivory          | `#F7F4EE` | Latar halaman, area konten luas                                 |
|              |         | Surface        | `#FFFFFF` | Kartu, modal, input                                             |
| **Sekunder** | **30%** | Midnight Navy  | `#0F1B2D` | Navbar, header, hero, footer, teks utama, tombol sekunder       |
|              |         | Navy 800       | `#1B2B45` | Panel gelap, hover navy                                         |
|              |         | Navy 600       | `#2C4163` | Garis atau ikon pada latar gelap                                |
| **Aksen**    | **10%** | Champagne Gold | `#C9A24B` | Tombol aksi utama (CTA), sorotan, ikon penting, indikator aktif |
|              |         | Gold 600       | `#A8842F` | Hover/pressed pada emas                                         |
|              |         | Gold 300       | `#E3C77D` | Garis tipis, dekorasi                                           |
|              |         | Gold 100       | `#F5EBCF` | Latar badge atau sorotan lembut                                 |

**Netral dan semantik**

| Token      | Hex       | Pakai                                  |
| ---------- | --------- | -------------------------------------- |
| Text muted | `#5B6574` | Teks sekunder pada latar Ivory/putih   |
| Border     | `#E3DDD0` | Garis kartu, input, pemisah            |
| Success    | `#2F7D5B` | Booking dikonfirmasi, pembayaran lunas |
| Warning    | `#B7791F` | Menunggu pembayaran                    |
| Danger     | `#B3382C` | Error, batal, hapus                    |
| Info       | `#2C5282` | Informasi netral                       |

**Aturan penggunaan (penting):**

- Ivory mendominasi sekitar 60% layar, Navy sekitar 30%, Gold **tidak lebih dari ~10%**.
- **Jangan pakai teks emas di atas Ivory atau putih** (kontras kurang). Emas di latar terang hanya sebagai garis, ikon, atau latar tombol.
- Teks di atas tombol emas: **Midnight Navy** (kontras sekitar 7:1).
- Teks di atas Navy: Ivory (`#F7F4EE`). Emas boleh untuk teks/ikon pada latar Navy (kontras sekitar 7:1).
- Status jangan hanya pakai warna: sertakan ikon atau label teks.
- **Dark mode (opsional):** tukar porsi, Navy jadi 60% (latar), Ivory jadi teks, Gold tetap 10%.

---

## 3. Tipografi

| Peran           | Font                         | Dipakai untuk                                |
| --------------- | ---------------------------- | -------------------------------------------- |
| Display / judul | **Playfair Display** (serif) | Judul hero, H1, H2, angka besar di dashboard |
| UI / isi        | **Inter** (sans-serif)       | Semua teks lain: body, tombol, label, tabel  |

Pemasangan:

- Web: `@fontsource/playfair-display` dan `@fontsource/inter`.
- Mobile: `@expo-google-fonts/playfair-display` dan `@expo-google-fonts/inter`.

Skala (web / mobile):

| Token   | Web     | Mobile  | Font     | Weight |
| ------- | ------- | ------- | -------- | ------ |
| Display | 48 / 56 | 32 / 40 | Playfair | 600    |
| H1      | 36 / 44 | 28 / 36 | Playfair | 600    |
| H2      | 28 / 36 | 22 / 30 | Playfair | 600    |
| H3      | 20 / 28 | 18 / 26 | Inter    | 600    |
| Body    | 16 / 24 | 16 / 24 | Inter    | 400    |
| Small   | 14 / 20 | 14 / 20 | Inter    | 400    |
| Caption | 12 / 16 | 12 / 16 | Inter    | 500    |

Judul memakai letter-spacing normal; label huruf kapital kecil (caption) boleh `tracking-wider`.

---

## 4. Jarak, Radius, Bayangan

- **Grid jarak 4px.** Skala: 4, 8, 12, 16, 24, 32, 48, 64.
- **Radius:** kecil 8 (input, badge), sedang 12 (tombol, kartu kecil), besar 16 (kartu, modal). Jangan lebih bulat dari itu.
- **Border:** 1px `#E3DDD0`. Utamakan garis halus daripada bayangan tebal.
- **Bayangan** (lembut, hanya untuk elemen terangkat):
  - Kartu: `0 1px 2px rgba(15,27,45,0.06)`
  - Hover/modal: `0 8px 24px rgba(15,27,45,0.10)`
- **Lebar konten web:** maksimum 1200px, tengah. Mobile: padding horizontal 16.

---

## 5. Komponen

**Tombol**

- _Primer (CTA):_ latar Gold `#C9A24B`, teks Navy, hover Gold 600. Satu CTA utama per layar.
- _Sekunder:_ latar Navy, teks Ivory, hover Navy 800.
- _Ghost/Outline:_ border Navy 1px, teks Navy, hover latar Gold 100.
- _Destruktif:_ latar Danger, teks putih, selalu dengan konfirmasi.
- Tinggi 44px (mobile), 40–44px (web). Fokus: ring emas 2px dengan offset 2px.

**Input**

- Latar putih, border `#E3DDD0`, radius 8, tinggi 44px. Fokus: border Gold + ring emas lembut. Error: border Danger + pesan di bawah dengan ikon.
- Label selalu di atas input, bukan hanya placeholder.

**Kartu lapangan**

- Foto rasio 16:9 di atas, radius 16, border halus. Judul Playfair H3, harga dengan angka tebal, badge jenis olahraga (latar Gold 100, teks Navy). Hover (web): naik 2px dengan bayangan hover.

**Badge status booking**

- Menunggu: Warning, Dikonfirmasi: Success, Dibatalkan: Danger, Selesai: Navy 600. Latar tint lembut, teks gelap, disertai ikon kecil.

**Navigasi**

- _Web:_ navbar Navy tinggi 64px, logo Playfair berwarna Ivory dengan aksen Gold, menu aktif ditandai garis bawah Gold.
- _Mobile:_ bottom tab bar latar Navy, ikon aktif Gold, tidak aktif Navy 600/Ivory 60%.

**Tabel (dashboard pemilik)**

- Header latar Ivory, teks caption huruf kapital kecil, baris bergaris tipis, zebra sangat halus. Aksi baris berupa ikon di kanan.

**Kartu statistik (dashboard)**

- Angka besar Playfair, label caption muted, ikon di kiri atas dalam lingkaran Gold 100.

**Pemilih slot jam**

- Chip 44px: tersedia (putih, border), dipilih (Navy, teks Ivory, garis Gold), tidak tersedia (Ivory gelap, teks muted, dicoret). Jangan hanya mengandalkan warna.

**Modal / Toast / Empty state / Skeleton**

- Modal: kartu putih radius 16 dengan overlay Navy 50%. Toast: Navy dengan ikon status, muncul 3 detik. Empty state: ilustrasi garis sederhana, judul Playfair, satu tombol aksi. Loading memakai skeleton, bukan spinner penuh layar.

---

## 6. Ikon dan Gambar

- Ikon: **Lucide** (`lucide-react` di web, `lucide-react-native` di mobile), stroke 1.5–2, ukuran 20/24.
- Foto lapangan: terang, bersih, tanpa overlay mencolok. Gunakan gradien Navy tipis di bagian bawah foto hanya bila ada teks di atasnya.
- Jangan campur gaya ikon (hanya satu keluarga).

## 7. Gerak (Motion)

- Durasi 150–250ms, easing `ease-out`. Hanya untuk transisi hover, fokus, buka/tutup modal, dan perpindahan halaman halus.
- Hormati `prefers-reduced-motion` (web) dan pengaturan reduce motion (mobile).
- Tidak ada animasi berkedip atau memantul.

## 8. Aksesibilitas

- Kontras minimal WCAG AA (teks biasa 4.5:1). Pasangan warna di Bagian 2 sudah memenuhi bila aturannya diikuti.
- Semua elemen interaktif dapat difokus dan punya ring fokus terlihat.
- Gambar punya teks alternatif. Form punya label dan pesan error yang dibacakan pembaca layar.
- Target sentuh minimal 44x44.

---

## 9. Layar Utama

| Layar             | Isi pokok                                                                                       |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Beranda           | Hero Navy dengan judul Playfair + pencarian cepat (olahraga, tanggal), daftar lapangan unggulan |
| Cari Lapangan     | Filter (olahraga, harga, lokasi), grid kartu                                                    |
| Detail Lapangan   | Galeri, info, fasilitas, pemilih tanggal dan slot, ringkasan harga, CTA "Pesan Sekarang"        |
| Checkout          | Ringkasan booking, metode bayar (simulasi), upload bukti bayar                                  |
| Riwayat           | Daftar booking dengan badge status, aksi batalkan                                               |
| Login / Register  | Kartu terpusat di latar Ivory, pesan error generik                                              |
| Dashboard Pemilik | Kartu statistik, tabel booking masuk, kelola lapangan                                           |
| Panel Admin       | Tabel user dan lapangan, log aktivitas                                                          |

---

## 10. Token Implementasi

**Web — Tailwind v4 (`web/src/index.css`)**

```css
@import "tailwindcss";

@theme {
  --color-ivory: #f7f4ee;
  --color-surface: #ffffff;
  --color-navy-900: #0f1b2d;
  --color-navy-800: #1b2b45;
  --color-navy-600: #2c4163;
  --color-gold-500: #c9a24b;
  --color-gold-600: #a8842f;
  --color-gold-300: #e3c77d;
  --color-gold-100: #f5ebcf;
  --color-muted: #5b6574;
  --color-line: #e3ddd0;
  --color-success: #2f7d5b;
  --color-warning: #b7791f;
  --color-danger: #b3382c;
  --color-info: #2c5282;

  --font-display: "Playfair Display", serif;
  --font-sans: "Inter", system-ui, sans-serif;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

body {
  background: var(--color-ivory);
  color: var(--color-navy-900);
  font-family: var(--font-sans);
}
```

**Mobile — NativeWind (`mobile/tailwind.config.js`)**
Pakai nama dan nilai warna yang sama persis. Cek dokumentasi NativeWind untuk versi yang terpasang karena cara konfigurasinya dapat berbeda antar versi.

```js
theme: {
  extend: {
    colors: {
      ivory: '#F7F4EE', surface: '#FFFFFF',
      navy: { 900: '#0F1B2D', 800: '#1B2B45', 600: '#2C4163' },
      gold: { 500: '#C9A24B', 600: '#A8842F', 300: '#E3C77D', 100: '#F5EBCF' },
      muted: '#5B6574', line: '#E3DDD0',
      success: '#2F7D5B', warning: '#B7791F', danger: '#B3382C', info: '#2C5282',
    },
    fontFamily: { display: ['PlayfairDisplay_600SemiBold'], sans: ['Inter_400Regular'] },
    borderRadius: { sm: '8px', md: '12px', lg: '16px' },
  },
},
```

**Aturan konsistensi:** jika sebuah token diubah, ubah di **kedua** tempat dan di dokumen ini.

---

## 11. Checklist Visual (sebelum menyelesaikan CP6 / CP11)

- [ ] Komposisi warna kira-kira 60 Ivory / 30 Navy / 10 Gold
- [ ] Tidak ada teks emas di atas latar terang
- [ ] Judul memakai Playfair, selain itu Inter
- [ ] Satu CTA emas utama per layar
- [ ] Kontras dan ring fokus lolos AA
- [ ] Tampilan web dan mobile terasa satu keluarga
