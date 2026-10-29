// Aturan booking, sama dengan backend (booking.service.ts) dan web/src/lib. Backend tetap
// memvalidasi ulang; aturan di sini hanya agar antarmuka tidak menawarkan aksi yang pasti ditolak.
import 'format.dart';
import 'models.dart';

const maxBookingHours = 4;
const maxDaysAhead = 30;
const maxUploadBytes = 2 * 1024 * 1024;

enum StageTone { warning, success, danger, neutral }

/// Satu status yang dibaca pengguna, gabungan status booking + status pembayaran.
class Stage {
  const Stage(this.label, this.tone);
  final String label;
  final StageTone tone;
}

bool hasStarted(BookingSummary booking) {
  final today = todayInJakarta();
  return booking.tanggal.compareTo(today) < 0 ||
      (booking.tanggal == today && booking.jamMulai.compareTo(timeInJakarta()) <= 0);
}

bool hasEnded(BookingSummary booking) {
  final today = todayInJakarta();
  return booking.tanggal.compareTo(today) < 0 ||
      (booking.tanggal == today && booking.jamSelesai.compareTo(timeInJakarta()) <= 0);
}

/// Sudut pandang penyewa: apa yang sedang terjadi dengan booking saya?
Stage renterStage(BookingSummary booking) {
  switch (booking.status) {
    case BookingStatus.menunggu:
      return booking.paymentStatus == PaymentStatus.menunggu
          ? const Stage('Menunggu konfirmasi pemilik', StageTone.warning)
          : const Stage('Menunggu pembayaran', StageTone.warning);
    case BookingStatus.dikonfirmasi:
      if (hasEnded(booking)) return const Stage('Selesai', StageTone.neutral);
      if (hasStarted(booking)) return const Stage('Sedang berlangsung', StageTone.success);
      return const Stage('Terkonfirmasi', StageTone.success);
    case BookingStatus.selesai:
      return const Stage('Selesai', StageTone.neutral);
    case BookingStatus.ditolak:
      return const Stage('Ditolak pemilik', StageTone.danger);
    case BookingStatus.dibatalkan:
      return const Stage('Dibatalkan', StageTone.neutral);
  }
}

/// Booking yang masih "berjalan": menunggu, atau terkonfirmasi dan belum selesai.
bool isActiveBooking(BookingSummary booking) =>
    booking.status == BookingStatus.menunggu ||
    (booking.status == BookingStatus.dikonfirmasi && !hasEnded(booking));

/// Bisa dibatalkan selama belum dimulai.
bool canCancel(BookingSummary booking) =>
    (booking.status == BookingStatus.menunggu || booking.status == BookingStatus.dikonfirmasi) &&
    !hasStarted(booking);

int byStartTime(BookingSummary a, BookingSummary b) =>
    '${a.tanggal}${a.jamMulai}'.compareTo('${b.tanggal}${b.jamMulai}');

const _minReviewsForBadge = 3;

/// Satu label bantu keputusan per kartu (sama dengan web/src/lib/decision-badges.ts).
/// Prioritas: rating tertinggi → paling banyak diulas → termurah.
Map<int, String> decisionBadges(List<Venue> venues) {
  final badges = <int, String>{};
  if (venues.length < 2) return badges;
  void assign(Venue? venue, String label) {
    if (venue != null) badges.putIfAbsent(venue.id, () => label);
  }

  final reviewed = venues
      .where((v) => v.ratingRata != null && v.jumlahUlasan >= _minReviewsForBadge)
      .toList();
  if (reviewed.isNotEmpty) {
    assign(
      (reviewed.toList()..sort((a, b) => b.ratingRata!.compareTo(a.ratingRata!))).first,
      'Rating tertinggi',
    );
    assign(
      (reviewed.toList()..sort((a, b) => b.jumlahUlasan.compareTo(a.jumlahUlasan))).first,
      'Favorit penyewa',
    );
  }
  assign(
    (venues.toList()..sort((a, b) => a.hargaPerJam.compareTo(b.hargaPerJam))).first,
    'Termurah',
  );
  return badges;
}
