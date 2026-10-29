// Bentuk data respons API backend (sama dengan web/src/lib/types.ts).

enum Sport {
  futsal('Futsal'),
  badminton('Badminton'),
  basket('Basket');

  const Sport(this.label);
  final String label;

  static Sport parse(String value) => Sport.values.byName(value);
}

enum Role {
  penyewa('Penyewa'),
  pemilik('Pemilik'),
  admin('Admin');

  const Role(this.label);
  final String label;
}

enum PaymentMethod {
  transfer('Transfer bank'),
  eWallet('E-wallet'),
  qris('QRIS');

  const PaymentMethod(this.label);
  final String label;

  /// Nilai yang dikirim ke API.
  String get apiValue => this == PaymentMethod.eWallet ? 'e_wallet' : name;
}

int _int(Object? value) => value is int ? value : int.parse('$value');

double? _doubleOrNull(Object? value) => value == null ? null : double.parse('$value');

/// "08:00:00" → "08:00"
String _time(Object? value) => '$value'.substring(0, 5);

/// "2026-10-29T00:00:00.000Z" atau "2026-10-29" → "2026-10-29"
String _date(Object? value) => '$value'.substring(0, 10);

class User {
  const User({required this.id, required this.nama, required this.email, required this.role});

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: _int(json['id']),
    nama: json['nama'] as String,
    email: json['email'] as String,
    role: Role.values.byName(json['role'] as String),
  );

  final int id;
  final String nama;
  final String email;
  final Role role;
}

class Venue {
  const Venue({
    required this.id,
    required this.nama,
    required this.sport,
    required this.alamat,
    required this.kota,
    required this.hargaPerJam,
    required this.jamBuka,
    required this.jamTutup,
    required this.fasilitas,
    required this.fotoUrl,
    required this.deskripsi,
    required this.ratingRata,
    required this.jumlahUlasan,
    required this.slotKosong,
  });

  factory Venue.fromJson(Map<String, dynamic> json) => Venue(
    id: _int(json['id']),
    nama: json['nama'] as String,
    sport: Sport.parse(json['jenis_olahraga'] as String),
    alamat: json['alamat'] as String,
    kota: json['kota'] as String,
    hargaPerJam: _int(json['harga_per_jam']),
    jamBuka: _time(json['jam_buka']),
    jamTutup: _time(json['jam_tutup']),
    fasilitas: (json['fasilitas'] as List).cast<String>(),
    fotoUrl: json['foto_url'] as String?,
    deskripsi: json['deskripsi'] as String?,
    ratingRata: _doubleOrNull(json['rating_rata']),
    jumlahUlasan: _int(json['jumlah_ulasan'] ?? 0),
    slotKosong: (json['slot_kosong'] as List?)?.cast<String>(),
  );

  final int id;
  final String nama;
  final Sport sport;
  final String alamat;
  final String kota;
  final int hargaPerJam;
  final String jamBuka;
  final String jamTutup;
  final List<String> fasilitas;
  final String? fotoUrl;
  final String? deskripsi;
  final double? ratingRata;
  final int jumlahUlasan;

  /// Jam mulai yang masih kosong; hanya ada bila daftar diminta dengan ?tanggal=.
  final List<String>? slotKosong;
}

class Slot {
  const Slot({required this.jamMulai, required this.jamSelesai, required this.tersedia});

  factory Slot.fromJson(Map<String, dynamic> json) => Slot(
    jamMulai: _time(json['jam_mulai']),
    jamSelesai: _time(json['jam_selesai']),
    tersedia: json['tersedia'] as bool,
  );

  final String jamMulai;
  final String jamSelesai;
  final bool tersedia;
}

enum BookingStatus { menunggu, dikonfirmasi, ditolak, dibatalkan, selesai }

enum PaymentStatus { menunggu, lunas, gagal }

class BookingSummary {
  const BookingSummary({
    required this.id,
    required this.venueId,
    required this.tanggal,
    required this.jamMulai,
    required this.jamSelesai,
    required this.status,
    required this.totalHarga,
    required this.venueNama,
    required this.venueKota,
    required this.sport,
    required this.paymentStatus,
  });

  factory BookingSummary.fromJson(Map<String, dynamic> json) => BookingSummary(
    id: _int(json['id']),
    venueId: _int(json['venue_id']),
    tanggal: _date(json['tanggal']),
    jamMulai: _time(json['jam_mulai']),
    jamSelesai: _time(json['jam_selesai']),
    status: BookingStatus.values.byName(json['status'] as String),
    totalHarga: _int(json['total_harga']),
    venueNama: json['venue_nama'] as String,
    venueKota: json['venue_kota'] as String,
    sport: Sport.parse(json['jenis_olahraga'] as String),
    paymentStatus: json['payment_status'] == null
        ? null
        : PaymentStatus.values.byName(json['payment_status'] as String),
  );

  final int id;
  final int venueId;
  final String tanggal;
  final String jamMulai;
  final String jamSelesai;
  final BookingStatus status;
  final int totalHarga;
  final String venueNama;
  final String venueKota;
  final Sport sport;
  final PaymentStatus? paymentStatus;

  /// Menunggu pembayaran (belum ada bukti, atau bukti sebelumnya ditolak).
  bool get needsPayment =>
      status == BookingStatus.menunggu &&
      (paymentStatus == null || paymentStatus == PaymentStatus.gagal);
}

class Review {
  const Review({
    required this.id,
    required this.namaUser,
    required this.rating,
    required this.komentar,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) => Review(
    id: _int(json['id']),
    namaUser: json['nama_user'] as String,
    rating: _int(json['rating']),
    komentar: json['komentar'] as String?,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  final int id;
  final String namaUser;
  final int rating;
  final String? komentar;
  final DateTime createdAt;
}
