# Venu Mobile — versi Flutter (eksperimen pembanding)

Aplikasi penyewa yang sama dengan [`mobile/`](../mobile) (Expo), dibuat ulang dengan Flutter untuk
membandingkan kedua teknologi. Fitur: splash "matrix" yang membentuk `venu.`, cari lapangan, detail +
pilih jam, pesan, unggah bukti bayar, Booking saya (batalkan/bayar), akun, tema terang/gelap.

**Design system Venu, bukan Material/Cupertino.** `MaterialApp` hanya dipakai sebagai kerangka
(navigasi, input teks, aksesibilitas). Semua tampilan memakai komponen sendiri di `lib/ui/`
(tombol pil, pil pilihan, segmen, kartu, badge status, dialog, bilah tab) dengan token dari
[DESIGN.md](../DESIGN.md); efek riak Material dimatikan dan perpindahan halaman memakai pudar +
geser halus, bukan gaya geser iOS.

## Menjalankan

```bash
cd mobile2
flutter pub get

# Chrome (paling cepat untuk mencoba). Backend harus mengizinkan origin web ini:
#   CORS_ORIGINS=http://localhost:8090 di backend/.env (mode after)
flutter run -d chrome --web-port 8090

# HP Android lewat kabel USB (backend tetap 127.0.0.1, bisa mode before maupun after)
adb reverse tcp:4000 tcp:4000
flutter run --dart-define=API_URL=http://localhost:4000

# HP Android lewat Wi-Fi (mode after, backend HOST=0.0.0.0)
flutter run --dart-define=API_URL=http://192.168.x.x:4000
```

Tanpa `API_URL`: web memakai `http://localhost:4000`, emulator Android memakai `http://10.0.2.2:4000`.
Alamat yang sedang dipakai tampil di tab **Akun**.

| `--dart-define` | Fungsi |
|---|---|
| `API_URL=...` | Alamat backend |
| `SECURITY_MODE=before` | Samakan dengan backend: pita peringatan + pesan login asli dari API (celah A07) |
| `DEVICE_PREVIEW=true` | Bingkai berbagai perangkat dari paket `device_preview` |

## Pemeriksaan

```bash
flutter analyze   # lint (flutter_lints)
flutter test      # unit test aturan booking & format
```

## Struktur `lib/`

```
core/     config, api_client (http), storage (flutter_secure_storage), models, format, booking_rules
state/    controllers (tema, login, booking aktif) + app_scope (InheritedWidget)
theme/    tokens.dart — warna, jarak, radius, skala tipe (sama dengan web & Expo)
ui/       komponen design system Venu + matrix_splash.dart
screens/  home_shell (3 tab), search, venue, checkout, bookings, account, auth
```

## Catatan keamanan

- Token login disimpan dengan `flutter_secure_storage` (Android Keystore), bukan teks biasa.
- `android:usesCleartextTraffic="true"` hanya karena backend lokal berjalan di HTTP. Versi produksi
  wajib HTTPS dan atribut ini harus dihapus (A04).
- Komentar ulasan ditampilkan sebagai teks biasa, jadi stored XSS (A05) tidak berlaku di aplikasi ini.

## Perbandingan singkat dengan versi Expo

| Aspek | Expo (`mobile/`) | Flutter (`mobile2/`) |
|---|---|---|
| Bahasa | TypeScript, berbagi logika dengan web (`lib/` disalin) | Dart, logika ditulis ulang |
| Menjalankan di HP | Expo Go, pindai QR (tanpa build) | `flutter run` (build APK debug) |
| Gaya | StyleSheet + token | Widget kustom + token |
| Splash matrix | Elemen `<Text>` diperbarui tiap 50 ms | `CustomPainter` digambar tiap frame |
| Web | react-native-web (DOM) | CanvasKit (kanvas) |
