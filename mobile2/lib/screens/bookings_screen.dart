import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/api_client.dart';
import '../core/booking_rules.dart';
import '../core/format.dart';
import '../core/models.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import '../ui/booking_widgets.dart';
import '../ui/controls.dart';
import '../ui/dialogs.dart';
import '../ui/feedback.dart';
import '../ui/layout.dart';
import '../ui/loader.dart';
import '../ui/primitives.dart';
import 'auth_screens.dart';
import 'checkout_screen.dart';

Future<List<BookingSummary>> _fetchMine() async {
  final data = await ApiClient.get('/bookings/mine');
  return (data['bookings'] as List)
      .map((json) => BookingSummary.fromJson(json as Map<String, dynamic>))
      .toList();
}

class BookingsScreen extends StatelessWidget {
  const BookingsScreen({super.key, required this.visit, required this.onOpenSearch});

  /// Bertambah tiap tab dibuka; status bisa berubah di luar layar ini (pemilik mengonfirmasi).
  final int visit;
  final VoidCallback onOpenSearch;

  @override
  Widget build(BuildContext context) {
    final user = AppScope.auth(context).user;
    final Widget content;
    if (user == null) {
      content = const SignInPrompt(description: 'Booking yang kamu pesan akan muncul di sini.');
    } else if (user.role != Role.penyewa) {
      content = const EmptyState(
        icon: LucideIcons.calendarX2,
        title: 'Khusus akun penyewa',
        description: 'Kelola booking masuk lewat dashboard pemilik di versi web.',
      );
    } else {
      content = ApiLoader<List<BookingSummary>>(
        requestKey: 'user:${user.id}#$visit',
        load: _fetchMine,
        placeholder: const Column(
          children: [
            Skeleton(height: 120),
            SizedBox(height: Space.md),
            Skeleton(height: 120),
          ],
        ),
        builder: (context, bookings, reload) =>
            _BookingList(bookings: bookings, reload: reload, onOpenSearch: onOpenSearch),
      );
    }

    return VenuScreen(
      child: ScrollBody(
        children: [
          Semantics(header: true, child: const VenuText('Booking saya', variant: TextVariant.h1)),
          content,
        ],
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  const _BookingList({required this.bookings, required this.reload, required this.onOpenSearch});

  final List<BookingSummary> bookings;
  final VoidCallback reload;
  final VoidCallback onOpenSearch;

  Future<void> _cancel(BuildContext context, BookingSummary booking) async {
    final confirmed = await confirmAction(
      context,
      title: 'Batalkan booking ini?',
      message:
          '${booking.venueNama}, ${formatDate(booking.tanggal)} pukul ${booking.jamMulai}. Bukti bayar yang belum diverifikasi ikut dibatalkan.',
      confirmLabel: 'Ya, batalkan',
    );
    if (!confirmed || !context.mounted) return;
    try {
      await ApiClient.post('/bookings/${booking.id}/cancel');
      reload();
      if (context.mounted) AppScope.bookings(context).reload();
    } on ApiException catch (error) {
      if (context.mounted) notify(context, title: 'Gagal membatalkan', message: error.message);
    }
  }

  Future<void> _pay(BuildContext context, BookingSummary booking) async {
    await Navigator.of(context).push(venuRoute(CheckoutScreen(bookingId: booking.id)));
    reload();
  }

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      return EmptyState(
        icon: LucideIcons.calendarX2,
        title: 'Belum ada booking',
        description: 'Lapangan yang kamu pesan akan muncul di sini.',
        action: VenuButton(label: 'Cari lapangan', onPressed: onOpenSearch),
      );
    }
    final upcoming = bookings.where(isActiveBooking).toList()..sort(byStartTime);
    final past = bookings.where((booking) => !isActiveBooking(booking)).toList();

    Widget section(String title, List<BookingSummary> items) {
      if (items.isEmpty) return const SizedBox.shrink();
      return Padding(
        padding: const EdgeInsets.only(bottom: Space.xxl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Semantics(header: true, child: VenuText(title, variant: TextVariant.h3)),
            for (final booking in items) ...[
              const SizedBox(height: Space.md),
              BookingRow(
                booking: booking,
                onCancel: () => _cancel(context, booking),
                onPay: () => _pay(context, booking),
              ),
            ],
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [section('Mendatang', upcoming), section('Selesai & dibatalkan', past)],
    );
  }
}
