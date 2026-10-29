// Format tampilan (versi Dart dari web/src/lib/format.ts). Semua waktu mengacu ke WIB.
import 'package:intl/intl.dart';

const _locale = 'id_ID';
const _jakartaOffset = Duration(hours: 7);

final _rupiah = NumberFormat.currency(locale: _locale, symbol: 'Rp ', decimalDigits: 0);

String formatRupiah(int amount) => _rupiah.format(amount);

DateTime _parseDate(String date) => DateTime.parse('${date}T00:00:00');

/// "2026-11-05" → "Kam, 5 Nov 2026"
String formatDate(String date) => DateFormat('EEE, d MMM y', _locale).format(_parseDate(date));

/// "2026-10-31" → "Sab, 31 Okt"
String formatShortDate(String date) => DateFormat('EEE, d MMM', _locale).format(_parseDate(date));

/// "2026-10-31" → "Sab"
String formatWeekday(String date) => DateFormat('EEE', _locale).format(_parseDate(date));

/// "2026-10-31" → "Sabtu"
String formatLongWeekday(String date) => DateFormat('EEEE', _locale).format(_parseDate(date));

/// "2026-10-31" → "31 Okt"
String formatDayMonth(String date) => DateFormat('d MMM', _locale).format(_parseDate(date));

String formatMonth(String date) => DateFormat('MMM', _locale).format(_parseDate(date));

String formatDateTime(DateTime value) =>
    DateFormat('d MMM y, HH.mm', _locale).format(value.toUtc().add(_jakartaOffset));

/// 4.8 → "4,8"
String formatRating(double rating) => NumberFormat('0.0', _locale).format(rating);

DateTime _nowJakarta() => DateTime.now().toUtc().add(_jakartaOffset);

/// Tanggal hari ini (YYYY-MM-DD) menurut WIB, sama dengan acuan backend.
String todayInJakarta() => DateFormat('yyyy-MM-dd').format(_nowJakarta());

/// Jam saat ini (JJ:MM) menurut WIB.
String timeInJakarta() => DateFormat('HH:mm').format(_nowJakarta());

String addDays(String date, int days) {
  final value = DateTime.utc(
    int.parse(date.substring(0, 4)),
    int.parse(date.substring(5, 7)),
    int.parse(date.substring(8, 10)) + days,
  );
  return DateFormat('yyyy-MM-dd').format(value);
}

int _minutes(String time) => int.parse(time.substring(0, 2)) * 60 + int.parse(time.substring(3, 5));

int hoursBetween(String start, String end) => (_minutes(end) - _minutes(start)) ~/ 60;
