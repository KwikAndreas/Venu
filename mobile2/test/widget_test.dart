import 'package:flutter_test/flutter_test.dart';
import 'package:mobile2/core/booking_rules.dart';
import 'package:mobile2/core/format.dart';
import 'package:mobile2/core/models.dart';
import 'package:mobile2/screens/venue_screen.dart';

Venue _venue(int id, int harga, {double? rating, int ulasan = 0}) => Venue(
  id: id,
  nama: 'Lapangan $id',
  sport: Sport.futsal,
  alamat: '-',
  kota: 'Jakarta',
  hargaPerJam: harga,
  jamBuka: '08:00',
  jamTutup: '22:00',
  fasilitas: const [],
  fotoUrl: null,
  deskripsi: null,
  ratingRata: rating,
  jumlahUlasan: ulasan,
  slotKosong: null,
);

void main() {
  group('nextSelection (pilihan jam berurutan)', () {
    test('ketuk slot pertama memulai pilihan', () => expect(nextSelection([], 3), [3]));
    test('slot di samping memperpanjang', () => expect(nextSelection([3, 4], 5), [3, 4, 5]));
    test('ketuk ujung memendekkan', () => expect(nextSelection([3, 4, 5], 5), [3, 4]));
    test('slot jauh memulai pilihan baru', () => expect(nextSelection([3, 4], 8), [8]));
  });

  test('decisionBadges memberi label Termurah pada harga terendah', () {
    final badges = decisionBadges([_venue(1, 150000), _venue(2, 90000), _venue(3, 120000)]);
    expect(badges, {2: 'Termurah'});
  });

  test('addDays melewati pergantian bulan', () {
    expect(addDays('2026-10-31', 1), '2026-11-01');
  });
}
