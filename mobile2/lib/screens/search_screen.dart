import 'dart:async';

import 'package:flutter/material.dart'
    show TextField, InputDecoration, InputBorder, TextInputAction;
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
import '../ui/feedback.dart';
import '../ui/layout.dart';
import '../ui/loader.dart';
import '../ui/primitives.dart';
import '../ui/venue_widgets.dart';
import 'checkout_screen.dart';
import 'venue_screen.dart';

const _searchDelay = Duration(milliseconds: 300);

String _headline(String tanggal, String today) {
  if (tanggal == today) return 'Main di mana hari ini?';
  if (tanggal == addDays(today, 1)) return 'Main di mana besok?';
  if (tanggal.compareTo(addDays(today, 6)) <= 0) {
    return 'Main di mana ${formatLongWeekday(tanggal)} ini?';
  }
  return 'Main di mana ${formatDayMonth(tanggal)}?';
}

Future<List<Venue>> _fetchVenues(Map<String, String> query) async {
  final params = Uri(queryParameters: {...query}..removeWhere((_, value) => value.isEmpty)).query;
  final data = await ApiClient.get('/venues?$params');
  return (data['venues'] as List)
      .map((json) => Venue.fromJson(json as Map<String, dynamic>))
      .toList();
}

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key, required this.onOpenBookings});

  final VoidCallback onOpenBookings;

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _queryController = TextEditingController();
  Timer? _debounce;
  late String _tanggal = todayInJakarta();
  Sport? _sport;
  String _city = '';
  String _query = '';
  List<String> _cities = const [];

  @override
  void initState() {
    super.initState();
    _fetchVenues({}).then((venues) {
      if (!mounted) return;
      setState(() => _cities = venues.map((venue) => venue.kota).toSet().toList()..sort());
    }, onError: (_) {});
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _queryController.dispose();
    super.dispose();
  }

  /// Kata kunci baru dipakai setelah pengguna berhenti mengetik sebentar.
  void _onQueryChanged(String text) {
    _debounce?.cancel();
    _debounce = Timer(_searchDelay, () => setState(() => _query = text.trim()));
  }

  void _openVenue(Venue venue) =>
      Navigator.of(context).push(venuRoute(VenueScreen(venueId: venue.id, initialDate: _tanggal)));

  void _openPayment(BookingSummary booking) =>
      Navigator.of(context).push(venuRoute(CheckoutScreen(bookingId: booking.id)));

  @override
  Widget build(BuildContext context) {
    final query = {'jenis': _sport?.name ?? '', 'lokasi': _city, 'q': _query, 'tanggal': _tanggal};
    final today = todayInJakarta();

    return VenuScreen(
      child: ApiLoader<List<Venue>>(
        requestKey: query.toString(),
        load: () => _fetchVenues(query),
        placeholder: _list(context, header: _header(context, today, null), venues: null),
        builder: (context, venues, _) =>
            _list(context, header: _header(context, today, venues), venues: venues),
      ),
    );
  }

  Widget _list(BuildContext context, {required List<Widget> header, required List<Venue>? venues}) {
    final badges = decisionBadges(venues ?? const []);
    Widget padded(Widget child) => Padding(
      padding: const EdgeInsets.symmetric(horizontal: Space.screen),
      child: child,
    );
    final cards = <Widget>[
      if (venues == null) ...const [VenueCardSkeleton(), VenueCardSkeleton()],
      if (venues != null && venues.isEmpty)
        const EmptyState(
          icon: LucideIcons.searchX,
          title: 'Tidak ada lapangan yang cocok',
          description: 'Coba olahraga, kota, atau tanggal lain.',
        ),
      for (final venue in venues ?? const <Venue>[])
        VenueCard(venue: venue, badge: badges[venue.id], onTap: () => _openVenue(venue)),
    ];
    return ListView(
      padding: const EdgeInsets.only(top: Space.lg, bottom: Space.xxxl),
      children: [
        ...header,
        for (final card in cards) ...[const SizedBox(height: Space.xxxl), padded(card)],
      ],
    );
  }

  /// Bagian atas layar. Baris yang digeser horizontal (tanggal, kota) dibiarkan selebar layar.
  List<Widget> _header(BuildContext context, String today, List<Venue>? venues) {
    final summary = venues == null
        ? 'Mencari lapangan…'
        : '${venues.length} lapangan${_sport == null ? '' : ' ${_sport!.label.toLowerCase()}'} · ${formatShortDate(_tanggal)}';
    Widget padded(Widget child) => Padding(
      padding: const EdgeInsets.symmetric(horizontal: Space.screen),
      child: child,
    );
    return [
      padded(
        ActiveBookingStrip(onOpenPayment: _openPayment, onOpenBookings: widget.onOpenBookings),
      ),
      if (AppScope.bookings(context).active.isNotEmpty) const SizedBox(height: Space.lg),
      const SizedBox(height: Space.sm),
      padded(
        Semantics(
          header: true,
          child: VenuText(_headline(_tanggal, today), variant: TextVariant.display),
        ),
      ),
      const SizedBox(height: Space.xs),
      padded(Semantics(liveRegion: true, child: VenuText(summary, tone: TextTone.muted))),
      const SizedBox(height: Space.lg),
      padded(_SearchInput(controller: _queryController, onChanged: _onQueryChanged)),
      const SizedBox(height: Space.lg),
      padded(
        Segment<Sport?>(
          options: [(null, 'Semua'), for (final sport in Sport.values) (sport, sport.label)],
          value: _sport,
          onChanged: (sport) => setState(() => _sport = sport),
        ),
      ),
      const SizedBox(height: Space.lg),
      DateStrip(value: _tanggal, onChanged: (date) => setState(() => _tanggal = date)),
      if (_cities.length > 1) ...[
        const SizedBox(height: Space.lg),
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: Space.screen),
            itemCount: _cities.length + 1,
            separatorBuilder: (_, _) => const SizedBox(width: Space.sm),
            itemBuilder: (_, index) {
              final city = index == 0 ? '' : _cities[index - 1];
              return Pill(
                label: city.isEmpty ? 'Semua kota' : city,
                selected: _city == city,
                onTap: () => setState(() => _city = city),
              );
            },
          ),
        ),
      ],
    ];
  }
}

class _SearchInput extends StatelessWidget {
  const _SearchInput({required this.controller, required this.onChanged});

  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: Space.lg),
      decoration: BoxDecoration(
        color: palette.raised,
        border: Border.all(color: palette.line),
        borderRadius: BorderRadius.circular(Radii.pill),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.search, size: 18, color: palette.muted),
          const SizedBox(width: Space.sm),
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onChanged,
              textInputAction: TextInputAction.search,
              autocorrect: false,
              cursorColor: palette.accent,
              style: typeScale[TextVariant.body]!.copyWith(
                color: palette.fg,
                fontWeight: FontWeight.w500,
              ),
              decoration: InputDecoration(
                isDense: true,
                border: InputBorder.none,
                hintText: 'Cari nama lapangan',
                hintStyle: typeScale[TextVariant.body]!.copyWith(color: palette.muted),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
