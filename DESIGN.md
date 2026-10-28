# DESIGN.md — Sistem Desain Venu: "Galeri Banding"

Satu bahasa visual untuk **web** (React + Tailwind) dan **mobile** (Expo + StyleSheet bertoken).
Gaya: **modern, tenang, elegan namun membumi**. Bukan neon, bukan glass. Nyaman di **mode terang dan gelap**. Tujuan utama layout: pengguna bisa **langsung menimbang lapangan mana yang dipilih**.

> Riwayat: (1) Ivory/Navy/Emas + Playfair, (2) "Night Match" sporty gelap. Keduanya diganti pada 2026-10-27 atas permintaan user karena terasa generik/terlalu padat. Versi ini adalah kombinasi preview Opsi A (banding cepat) + Opsi B (galeri foto) yang dipilih user.

---

## 1. Prinsip

1. **Membantu memutuskan:** harga, rating, fasilitas, dan jam kosong selalu di posisi yang sama pada setiap kartu, sehingga mata bisa membandingkan tanpa membaca ulang. Fitur **Bandingkan** menyandingkan 2–3 lapangan dan menandai nilai terbaik per baris.
2. **On point, tidak padat:** satu informasi tampil sekali. Konteks yang sudah ada di judul (tanggal, jam) tidak diulang di setiap kartu. Label yang sama di semua item (mis. "Baru") tidak ditampilkan.
3. **Satu status, satu arti:** status booking dan pembayaran digabung menjadi **satu** label yang menjelaskan keadaan sebenarnya (lihat §5 Status). Tidak boleh ada dua badge yang saling mengulang.
4. **Yang penting tanpa scroll:** status booking aktif tampil sebagai strip di atas judul halaman Cari, plus angka di menu "Booking saya".
5. **Tanpa penjelasan tambahan (no-commentary):** antarmuka harus bisa dipahami tanpa legenda atau teks bantuan; tombol hanya muncul bila aksinya memang bisa dilakukan saat itu (mis. "Batalkan" hilang setelah jadwal dimulai, "Beri ulasan" muncul setelah jadwal selesai).
6. **Aman secara UX:** pesan error login generik, konfirmasi sebelum aksi destruktif, aksi destruktif tidak bersaing visual dengan aksi utama.

---

## 2. Warna

Dasar netral hangat, satu aksen **hijau lapangan**. Setiap token punya nilai terang dan gelap; komponen hanya memakai nama token sehingga otomatis benar di kedua mode.

| Token          | Terang    | Gelap     | Dipakai untuk                                         |
| -------------- | --------- | --------- | ----------------------------------------------------- |
| `bg`           | `#FBFAF7` | `#151412` | Latar halaman                                         |
| `surface`      | `#F3F1EC` | `#1D1B19` | Latar lembut: segmen, chip, strip, header tabel       |
| `raised`       | `#FFFFFF` | `#221F1C` | Kartu, panel, modal, input                            |
| `line`         | `#E7E3DA` | `#312D29` | Garis pemisah, border kartu & input                   |
| `fg`           | `#1D1B17` | `#EEEAE3` | Teks utama, tombol netral                             |
| `muted`        | `#6C665C` | `#A39B8F` | Teks sekunder, label                                  |
| `accent`       | `#1F6B45` | `#86C7A1` | Aksi utama, jam kosong, pilihan aktif, nilai terbaik  |
| `accent-soft`  | `#E6F0EA` | `#1B2A22` | Latar chip jam kosong & penanda "terbaik"             |
| `on-accent`    | `#FFFFFF` | `#0F1712` | Teks di atas tombol aksen                             |
| `warning`(+soft) | `#8A5A0B` / `#FBF1DD` | `#E8BD6C` / `#2C2417` | Menunggu pembayaran/konfirmasi |
| `success`(+soft) | = accent | = accent | Terkonfirmasi, sedang berlangsung |
| `danger`(+soft)  | `#B42318` / `#FDECEA` | `#F19A8F` / `#2F1C1A` | Ditolak, hapus, batalkan |
| `info`(+soft)    | `#2F5B8A` / `#E8EFF7` | `#9CC0E6` / `#1B2430` | Informasi netral |

**Aturan penggunaan:**
- Aksen hanya untuk: tombol aksi utama (satu per layar), chip jam kosong, item terpilih, dan penanda nilai terbaik.
- Status selalu teks + titik berwarna, tidak hanya warna.
- Pengganti foto: gradasi lembut per cabang olahraga (`--app-img-futsal`, `--app-img-badminton`, `--app-img-basket`), ikut tema.
- Tema mengikuti perangkat sampai pengguna memilih sendiri lewat tombol bulan/matahari di navbar (disimpan di `localStorage`).

---

## 3. Tipografi

Satu keluarga huruf: **Plus Jakarta Sans** (400, 500, 600, 700, 800), karya desainer Indonesia. Semua teks *sentence case*, tanpa huruf kapital semua.

| Token     | Web     | Mobile  | Weight | Tracking |
| --------- | ------- | ------- | ------ | -------- |
| Display   | 44 / 50 | 32 / 38 | 800    | -3%      |
| H1        | 34 / 40 | 28 / 34 | 800    | -3%      |
| H2        | 22 / 30 | 20 / 28 | 700    | -2%      |
| H3        | 17 / 24 | 17 / 24 | 700    | -1%      |
| Body      | 15–16 / 24 | 15 / 22 | 400–500 | 0   |
| Label     | 13 / 18 | 13 / 18 | 500    | 0        |

Angka (harga, jam) memakai `tabular-nums` agar sejajar saat dibandingkan.

---

## 4. Jarak, Radius, Bayangan

- **Grid jarak 4px.** Skala: 4, 8, 12, 16, 20, 24, 32, 40, 56.
- **Radius:** tombol, pil filter, badge = penuh (`999px`); input & chip = 12px; kartu = 16–18px; panel besar/tabel banding = 24px.
- **Bayangan** hanya satu (`shadow-soft`) untuk elemen yang mengambang: tab aktif, panel jadwal, baki Bandingkan, menu, modal.
- **Lebar konten:** maksimum 1160px. Padding horizontal 20px (mobile) / 32px (web).

---

## 5. Komponen

**Tombol** (`components/ui/styles.ts`): `primary` (aksen), `neutral` (fg di atas bg; "Masuk", baki), `secondary` (bergaris), `ghost`, `danger`, `danger-outline`, `danger-ghost` (aksi destruktif sekunder seperti "Batalkan"). Tinggi 44px (36px kecil). Label *sentence case*.

**Pil filter**: select/input asli berbentuk pil (`PILL_CLASSES`), satu baris; di layar sempit digeser horizontal, tidak menumpuk.

**Kartu lapangan** (`VenueCard`): foto 16:10 radius 18px → nama + rating (hanya bila ada ulasan) → kota · 2 fasilitas utama → garis → "Jam kosong" (maks 3 chip + "+n") di kiri, harga per jam di kanan. Pojok kiri atas: maks **satu** label bantu ("Rating tertinggi", "Favorit penyewa", "Termurah"). Pojok kanan atas: toggle "+ Bandingkan" / "✓ Dibandingkan".

**Baki Bandingkan**: pil melayang di bawah layar, berisi thumbnail, "n lapangan dipilih", tombol hapus, dan "Bandingkan" (aktif mulai 2 lapangan, maks 3).

**Tabel Bandingkan**: kolom per lapangan sama lebar (`table-fixed`), baris: harga per jam, total 2 jam, rating, jam kosong, jam buka, setiap fasilitas (✓ Ada / —). Nilai terbaik diberi penanda hijau ("Termurah", "Tertinggi", "Paling fleksibel").

**Status booking** (`lib/booking-stage.ts` → `StatusBadge`), satu label per booking:

| Penyewa melihat               | Pemilik melihat        | Kondisi                                  |
| ----------------------------- | ---------------------- | ---------------------------------------- |
| Menunggu pembayaran           | Belum dibayar          | status menunggu, belum ada bukti         |
| Menunggu konfirmasi pemilik   | Perlu dikonfirmasi     | status menunggu, bukti terkirim          |
| Terkonfirmasi                 | Terkonfirmasi          | dikonfirmasi, belum mulai                |
| Sedang berlangsung            | Sedang berlangsung     | dikonfirmasi, jam main sedang berjalan   |
| Selesai                       | Selesai                | jadwal sudah lewat                       |
| Ditolak pemilik               | Ditolak                | ditolak                                  |
| Dibatalkan                    | Dibatalkan             | dibatalkan                               |

**Strip booking aktif**: status + nama lapangan + jadwal booking terdekat, "+n booking lain" bila ada, dan satu aksi ("Bayar sekarang" / "Lihat detail" / "Lihat semua").

**Pemilih jam**: kotak 44px. Kosong = bergaris tipis, dipilih = aksen, terisi = dicoret & nonaktif. Tanpa legenda.

**Segmen** (cabang olahraga, tab dashboard, filter status): wadah `surface` berbentuk pil, item aktif terangkat (`raised` + `shadow-soft`).

**Modal / Toast / Empty state / Skeleton**: modal panel `raised` radius 16; toast bergaris kiri aksen, 3 detik; empty state ikon kecil dalam lingkaran + judul + satu kalimat + satu aksi; loading memakai skeleton.

**Banner mode keamanan**: pita `warning-soft` di atas navbar saat `VITE_SECURITY_MODE=before`.

---

## 6. Ikon dan Gambar

- Ikon: **Lucide**, stroke 1.75–2, ukuran 16/18/20.
- Foto lapangan ditampilkan apa adanya; tanpa foto memakai gradasi per cabang olahraga.

## 7. Gerak

- 150–200ms `ease-out` untuk hover, fokus, pergantian tema, panah CTA bergeser 2px.
- Hormati `prefers-reduced-motion`.

## 8. Aksesibilitas

- Kontras minimal WCAG AA di kedua tema; ring fokus aksen 2px offset 2px.
- Semua kontrol bisa difokus; segmen memakai `role="radiogroup"`/`tablist` yang sesuai; status tidak hanya warna.
- Target sentuh minimal 44×44 (kecuali kontrol sekunder di tabel: 40px).

---

## 9. Layar Utama

| Layar             | Isi pokok                                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Cari (beranda `/`) | Strip booking aktif, judul "Main di mana …?", pencarian nama + urutan, segmen olahraga + pil kota/tanggal/jam/harga, galeri kartu, baki Bandingkan |
| Bandingkan        | Tabel 2–3 lapangan berdampingan dengan penanda nilai terbaik                                                |
| Detail Lapangan   | Foto besar, info & fasilitas, ulasan; panel jadwal (tanggal, jam, total, "Pesan sekarang")                   |
| Checkout          | Ringkasan booking, metode bayar (simulasi), unggah bukti                                                    |
| Booking saya      | "Mendatang" dan "Selesai & dibatalkan", satu status per booking, aksi sesuai keadaan                         |
| Masuk / Daftar    | Kartu terpusat, pesan error generik                                                                         |
| Dashboard Pemilik | Statistik, booking masuk (satu kolom status), kelola lapangan                                               |
| Panel Admin       | Statistik, pengguna, lapangan, log aktivitas                                                                |

---

## 10. Token Implementasi

**Web — Tailwind v4 (`web/src/index.css`)**: nilai di variabel `--app-*` (`:root` = terang, `[data-theme='dark']` = gelap), lalu dipetakan ke nama Tailwind lewat `@theme inline` (`--color-bg: var(--app-bg)`, dst.). Tema awal dipasang skrip kecil di `web/index.html` agar tidak berkedip.

**Mobile — StyleSheet bertoken (`mobile/src/constants/theme.ts`)**: nama token sama dengan web dalam camelCase (`bg`, `surface`, `raised`, `line`, `fg`, `muted`, `accent`, `accentSoft`, `onAccent`, `warning(Soft)`, `danger(Soft)`, `info(Soft)`) dengan nilai kolom "Terang"/"Gelap" di §2 (`PALETTES.light` / `PALETTES.dark`). Komponen membaca warna lewat `useTheme()`; tema ikut perangkat sampai pengguna memilih di tab Akun (disimpan di perangkat). Tipe memakai `TYPE_SCALE` (kolom Mobile di §3) dengan Plus Jakarta Sans dari `@expo-google-fonts/plus-jakarta-sans`; ikon `lucide-react-native`. Pengganti foto memakai warna datar per cabang olahraga (RN tidak punya gradasi bawaan).

> Keputusan CP11: NativeWind tidak dipakai. Versi stabilnya (4.x) dibuat untuk Tailwind 3 dan versi 5 masih RC, sementara mobile memakai Expo SDK 58 / React Native 0.88; StyleSheet bertoken memberi hasil visual yang sama dan pasti berjalan di Expo Go.

**Aturan konsistensi:** jika sebuah token diubah, ubah di **kedua** tempat dan di dokumen ini.

---

## 11. Checklist Visual (sebelum menyelesaikan CP6 / CP11)

Diperiksa lewat screenshot desktop 1280px (terang & gelap) dan mobile 390px, 2026-10-27.

- [x] Tidak ada informasi atau badge yang berulang dalam satu kartu/baris
- [x] Status booking aktif terlihat tanpa scroll
- [x] Aksen hanya untuk aksi utama, jam kosong, pilihan, dan nilai terbaik
- [x] Satu aksi utama per layar; aksi destruktif tidak menonjol
- [x] Semua teks *sentence case*, sapaan konsisten ("kamu")
- [x] Mode terang dan gelap sama-sama terbaca (kontras AA)
- [x] Tampilan web dan mobile terasa satu keluarga (CP11, diperiksa lewat pratinjau 390px terang & gelap, 2026-10-28)
