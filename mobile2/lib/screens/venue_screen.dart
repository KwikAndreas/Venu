import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/api_client.dart';
import '../core/booking_rules.dart';
import '../core/format.dart';
import '../core/models.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import '../ui/controls.dart';
import '../ui/dialogs.dart';
import '../ui/feedback.dart';
import '../ui/layout.dart';
import '../ui/loader.dart';
import '../ui/primitives.dart';
import '../ui/venue_widgets.dart';
import 'auth_screens.dart';
import 'checkout_screen.dart';

/// Pilihan slot selalu berurutan (sama dengan web): ketuk slot di samping pilihan memperpanjang,
/// ketuk ujung memendekkan, ketuk slot lain memulai pilihan baru.
List<int> nextSelection(List<int> current, int index) {
  if (current.isEmpty) return [index];
  final first = current.first;
  final last = current.last;
  if (index == first && index == last) return [];
  if (index == first) return current.sublist(1);
  if (index == last) return current.sublist(0, current.length - 1);
  if (index == first - 1) return [index, ...current];
  if (index == last + 1) return [...current, index];
  return [index];
}

class VenueScreen extends StatelessWidget {
  const VenueScreen({super.key, required this.venueId, required this.initialDate});

  final int venueId;
  final String initialDate;

  @override
  Widget build(BuildContext context) {
    // Nama lapangan sudah jadi judul besar di halaman, jadi bilah atas tidak mengulangnya.
    return ApiLoader<Venue>(
      requestKey: venueId,
      load: () async => Venue.fromJson(
        (await ApiClient.get('/venues/$venueId'))['venue'] as Map<String, dynamic>,
      ),
      placeholder: const VenuScreen(
        showBack: true,
        child: Padding(
          padding: EdgeInsets.all(Space.screen),
          child: Column(
            children: [
              Skeleton(aspectRatio: 16 / 10, radius: Radii.card),
              SizedBox(height: Space.lg),
              Skeleton(height: 28),
            ],
          ),
        ),
      ),
      builder: (context, venue, _) => _BookingView(venue: venue, initialDate: initialDate),
    );
  }
}

class _BookingView extends StatefulWidget {
  const _BookingView({required this.venue, required this.initialDate});

  final Venue venue;
  final String initialDate;

  @override
  State<_BookingView> createState() => _BookingViewState();
}

class _BookingViewState extends State<_BookingView> {
  late String _tanggal = widget.initialDate;
  List<Slot> _slots = const [];
  List<int> _selection = const [];
  bool _limitHit = false;
  bool _submitting = false;
  final _slotsLoader = GlobalKey<ApiLoaderState<List<Slot>>>();

  Venue get _venue => widget.venue;

  void _changeDate(String date) => setState(() {
    _tanggal = date;
    _selection = const [];
    _limitHit = false;
  });

  void _toggle(Slot slot) {
    final next = nextSelection(_selection, _slots.indexOf(slot));
    setState(() {
      _limitHit = next.length > maxBookingHours;
      if (!_limitHit) _selection = next;
    });
  }

  Future<void> _book() async {
    final auth = AppScope.auth(context);
    if (auth.user == null) {
      await Navigator.of(context).push(venuRoute(const LoginScreen()));
      return;
    }
    if (_selection.isEmpty) return;
    setState(() => _submitting = true);
    try {
      final data = await ApiClient.post('/bookings', {
        'venue_id': _venue.id,
        'tanggal': _tanggal,
        'jam_mulai': _slots[_selection.first].jamMulai,
        'jam_selesai': _slots[_selection.last].jamSelesai,
      });
      if (!mounted) return;
      AppScope.bookings(context).reload();
      setState(() => _selection = const []);
      final bookingId = (data['booking'] as Map<String, dynamic>)['id'] as int;
      Navigator.of(context).push(venuRoute(CheckoutScreen(bookingId: bookingId)));
    } on ApiException catch (error) {
      if (!mounted) return;
      notify(context, title: 'Booking gagal', message: error.message);
      if (error.status == 409) {
        setState(() => _selection = const []);
        _slotsLoader.currentState?.reload();
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<List<Slot>> _loadSlots() async {
    final data = await ApiClient.get('/venues/${_venue.id}/slots?tanggal=$_tanggal');
    final slots = (data['slots'] as List)
        .map((json) => Slot.fromJson(json as Map<String, dynamic>))
        .toList();
    _slots = slots;
    return slots;
  }

  @override
  Widget build(BuildContext context) {
    final user = AppScope.auth(context).user;
    final isRenter = user?.role == Role.penyewa;
    final hours = _selection.length;
    final selected = {for (final index in _selection) _slots[index].jamMulai};

    final String schedule;
    if (hours > 0) {
      schedule =
          '${formatShortDate(_tanggal)} · ${_slots[_selection.first].jamMulai}–${_slots[_selection.last].jamSelesai}';
    } else if (user != null && !isRenter) {
      schedule = 'Pemesanan khusus akun penyewa';
    } else {
      schedule = 'Pilih jam main';
    }

    return VenuScreen(
      showBack: true,
      bottom: _BottomBar(
        schedule: schedule,
        total: formatRupiah(hours * _venue.hargaPerJam),
        buttonLabel: user == null ? 'Masuk untuk memesan' : 'Pesan sekarang',
        loading: _submitting,
        onPressed: user == null || (hours > 0 && isRenter) ? _book : null,
      ),
      child: ListView(
        padding: const EdgeInsets.only(bottom: Space.xxxl),
        children: [
          VenuePhoto(venue: _venue, radius: 0),
          Padding(
            padding: const EdgeInsets.fromLTRB(Space.screen, Space.xl, Space.screen, 0),
            child: _VenueInfo(venue: _venue),
          ),
          const _SectionDivider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: Space.screen),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Semantics(
                  header: true,
                  child: const VenuText('Pilih jadwal', variant: TextVariant.h2),
                ),
                const SizedBox(height: Space.xs),
                VenuText(
                  '${formatRupiah(_venue.hargaPerJam)} per jam · maksimal $maxBookingHours jam berturut-turut',
                  variant: TextVariant.small,
                  tone: _limitHit ? TextTone.warning : TextTone.muted,
                ),
              ],
            ),
          ),
          const SizedBox(height: Space.lg),
          DateStrip(value: _tanggal, onChanged: _changeDate),
          const SizedBox(height: Space.lg),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: Space.screen),
            child: ApiLoader<List<Slot>>(
              key: _slotsLoader,
              requestKey: _tanggal,
              load: _loadSlots,
              placeholder: const Skeleton(height: 148),
              builder: (context, slots, _) =>
                  SlotGrid(slots: slots, selected: selected, onToggle: _toggle),
            ),
          ),
          const _SectionDivider(),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: Space.screen),
            child: _Reviews(venueId: _venue.id),
          ),
        ],
      ),
    );
  }
}

class _SectionDivider extends StatelessWidget {
  const _SectionDivider();

  @override
  Widget build(BuildContext context) => const Padding(
    padding: EdgeInsets.symmetric(horizontal: Space.screen, vertical: Space.xxl),
    child: Hairline(),
  );
}

class _VenueInfo extends StatelessWidget {
  const _VenueInfo({required this.venue});

  final Venue venue;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Semantics(header: true, child: VenuText(venue.nama, variant: TextVariant.h1)),
        const SizedBox(height: Space.xs),
        Row(
          children: [
            RatingSummary(rating: venue.ratingRata, count: venue.jumlahUlasan),
            if (venue.jumlahUlasan > 0) const SizedBox(width: Space.sm),
            VenuText(venue.kota, tone: TextTone.muted),
          ],
        ),
        const SizedBox(height: Space.xs),
        VenuText(
          '${venue.alamat} · Buka ${venue.jamBuka}–${venue.jamTutup}',
          variant: TextVariant.small,
          tone: TextTone.muted,
        ),
        if (venue.deskripsi != null) ...[
          const SizedBox(height: Space.lg),
          VenuText(venue.deskripsi!),
        ],
        const SizedBox(height: Space.lg),
        Wrap(
          spacing: Space.sm,
          runSpacing: Space.sm,
          children: [
            for (final item in venue.fasilitas)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: Space.md, vertical: Space.xs),
                decoration: BoxDecoration(
                  color: context.palette.surface,
                  borderRadius: BorderRadius.circular(Radii.pill),
                ),
                child: VenuText(item, variant: TextVariant.label),
              ),
          ],
        ),
      ],
    );
  }
}

/// Daftar ulasan (hanya baca). Komentar ditampilkan sebagai teks biasa yang tidak pernah
/// menafsirkan HTML, sehingga stored XSS (A05) dari komentar tidak berlaku di aplikasi ini.
class _Reviews extends StatelessWidget {
  const _Reviews({required this.venueId});

  final int venueId;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Semantics(header: true, child: const VenuText('Ulasan', variant: TextVariant.h2)),
        const SizedBox(height: Space.lg),
        ApiLoader<List<Review>>(
          requestKey: venueId,
          load: () async => ((await ApiClient.get('/venues/$venueId/reviews'))['reviews'] as List)
              .map((json) => Review.fromJson(json as Map<String, dynamic>))
              .toList(),
          placeholder: const Skeleton(height: 64),
          builder: (context, reviews, _) {
            if (reviews.isEmpty) {
              return const VenuText('Belum ada ulasan.', tone: TextTone.muted);
            }
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final review in reviews)
                  Padding(
                    padding: const EdgeInsets.only(bottom: Space.lg),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: VenuText(review.namaUser, variant: TextVariant.bodyStrong),
                            ),
                            Semantics(
                              label: '${review.rating} dari 5 bintang',
                              excludeSemantics: true,
                              child: Row(
                                children: [
                                  for (var star = 0; star < 5; star++)
                                    Icon(
                                      LucideIcons.star,
                                      size: 13,
                                      color: star < review.rating ? palette.warning : palette.line,
                                    ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (review.komentar != null) ...[
                          const SizedBox(height: Space.xs),
                          VenuText(review.komentar!),
                        ],
                        const SizedBox(height: Space.xs),
                        VenuText(
                          formatDateTime(review.createdAt),
                          variant: TextVariant.small,
                          tone: TextTone.muted,
                        ),
                      ],
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.schedule,
    required this.total,
    required this.buttonLabel,
    required this.loading,
    required this.onPressed,
  });

  final String schedule;
  final String total;
  final String buttonLabel;
  final bool loading;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      decoration: BoxDecoration(
        color: palette.raised,
        border: Border(top: BorderSide(color: palette.line)),
      ),
      padding: EdgeInsets.fromLTRB(
        Space.screen,
        Space.md,
        Space.screen,
        Space.md + MediaQuery.paddingOf(context).bottom,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                VenuText(schedule, variant: TextVariant.small, tone: TextTone.muted, maxLines: 1),
                VenuText(total, variant: TextVariant.h2, numeric: true),
              ],
            ),
          ),
          const SizedBox(width: Space.lg),
          VenuButton(label: buttonLabel, loading: loading, onPressed: onPressed),
        ],
      ),
    );
  }
}
