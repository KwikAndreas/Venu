import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/booking_rules.dart';
import '../core/config.dart';
import '../core/format.dart';
import '../core/models.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'controls.dart';
import 'feedback.dart';
import 'primitives.dart';

/// Foto lapangan apa adanya; tanpa foto (atau gagal dimuat) memakai warna lembut per olahraga.
class VenuePhoto extends StatelessWidget {
  const VenuePhoto({super.key, required this.venue, this.radius = Radii.card});

  final Venue venue;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final placeholder = switch (venue.sport) {
      Sport.futsal => palette.imgFutsal,
      Sport.badminton => palette.imgBadminton,
      Sport.basket => palette.imgBasket,
    };
    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: AspectRatio(
        aspectRatio: 16 / 10,
        child: ColoredBox(
          color: placeholder,
          child: venue.fotoUrl == null
              ? null
              : Image.network(
                  assetUrl(venue.fotoUrl!),
                  fit: BoxFit.cover,
                  semanticLabel: 'Foto ${venue.nama}',
                  errorBuilder: (_, _, _) => const SizedBox.shrink(),
                ),
        ),
      ),
    );
  }
}

/// Rating hanya tampil bila sudah ada ulasan (tanpa label "Baru" yang berulang).
class RatingSummary extends StatelessWidget {
  const RatingSummary({super.key, required this.rating, required this.count});

  final double? rating;
  final int count;

  @override
  Widget build(BuildContext context) {
    if (rating == null || count == 0) return const SizedBox.shrink();
    return Semantics(
      label: 'Rating ${formatRating(rating!)} dari $count ulasan',
      excludeSemantics: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(LucideIcons.star, size: 14, color: context.palette.warning),
          const SizedBox(width: Space.xs),
          VenuText(formatRating(rating!), variant: TextVariant.label, numeric: true),
          const SizedBox(width: Space.xs),
          VenuText('($count)', variant: TextVariant.small, tone: TextTone.muted),
        ],
      ),
    );
  }
}

const _maxVisibleSlots = 3;

class _FreeSlots extends StatelessWidget {
  const _FreeSlots({required this.slots});

  final List<String> slots;

  @override
  Widget build(BuildContext context) {
    if (slots.isEmpty) {
      return const VenuText('Penuh pada jam ini', variant: TextVariant.small, tone: TextTone.muted);
    }
    final extra = slots.length - _maxVisibleSlots;
    final chips = [...slots.take(_maxVisibleSlots), if (extra > 0) '+$extra'];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const VenuText('Jam kosong', variant: TextVariant.small, tone: TextTone.muted),
        const SizedBox(height: Space.xs),
        Wrap(
          spacing: Space.xs,
          runSpacing: Space.xs,
          children: [
            for (final chip in chips)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: Space.sm, vertical: 2),
                decoration: BoxDecoration(
                  color: context.palette.accentSoft,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: VenuText(
                  chip,
                  variant: TextVariant.label,
                  tone: TextTone.accent,
                  weight: FontWeight.w600,
                  numeric: true,
                ),
              ),
          ],
        ),
      ],
    );
  }
}

/// Kartu foto (gaya B) dengan informasi pembanding di posisi yang sama (gaya A).
class VenueCard extends StatelessWidget {
  const VenueCard({super.key, required this.venue, required this.onTap, this.badge});

  final Venue venue;
  final VoidCallback onTap;

  /// Satu label bantu keputusan, bila ada.
  final String? badge;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final details = [venue.kota, ...venue.fasilitas.take(2)].join(' · ');
    return Tappable(
      onTap: onTap,
      semanticLabel: '${venue.nama}, ${venue.kota}, ${formatRupiah(venue.hargaPerJam)} per jam',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Stack(
            children: [
              VenuePhoto(venue: venue),
              if (badge != null)
                Positioned(
                  top: Space.md,
                  left: Space.md,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: Space.md, vertical: Space.xs),
                    decoration: BoxDecoration(
                      color: palette.raised,
                      borderRadius: BorderRadius.circular(Radii.pill),
                      boxShadow: softShadow(palette),
                    ),
                    child: VenuText(badge!, variant: TextVariant.small, weight: FontWeight.w700),
                  ),
                ),
            ],
          ),
          const SizedBox(height: Space.md),
          Row(
            children: [
              Expanded(child: VenuText(venue.nama, variant: TextVariant.h3, maxLines: 1)),
              RatingSummary(rating: venue.ratingRata, count: venue.jumlahUlasan),
            ],
          ),
          const SizedBox(height: 2),
          VenuText(details, variant: TextVariant.small, tone: TextTone.muted, maxLines: 1),
          const SizedBox(height: Space.md),
          const Hairline(),
          const SizedBox(height: Space.md),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: venue.slotKosong == null
                    ? const SizedBox.shrink()
                    : _FreeSlots(slots: venue.slotKosong!),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const VenuText('per jam', variant: TextVariant.small, tone: TextTone.muted),
                  VenuText(formatRupiah(venue.hargaPerJam), variant: TextVariant.h3, numeric: true),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class VenueCardSkeleton extends StatelessWidget {
  const VenueCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) => const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Skeleton(aspectRatio: 16 / 10, radius: Radii.card),
      SizedBox(height: Space.md),
      Skeleton(height: 20, width: 220),
      SizedBox(height: Space.sm),
      Skeleton(height: 14, width: 160),
      SizedBox(height: Space.lg),
      Skeleton(height: 40),
    ],
  );
}

/// Pemilih tanggal geser horizontal: hari ini sampai batas booking.
class DateStrip extends StatelessWidget {
  const DateStrip({super.key, required this.value, required this.onChanged});

  final String value;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final today = todayInJakarta();
    final dates = [for (var day = 0; day <= maxDaysAhead; day++) addDays(today, day)];
    String caption(String date) {
      if (date == today) return 'Hari ini';
      if (date == addDays(today, 1)) return 'Besok';
      return formatWeekday(date);
    }

    return SizedBox(
      height: 56,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: Space.screen),
        itemCount: dates.length,
        separatorBuilder: (_, _) => const SizedBox(width: Space.sm),
        itemBuilder: (_, index) => Pill(
          caption: caption(dates[index]),
          label: formatDayMonth(dates[index]),
          selected: dates[index] == value,
          onTap: () => onChanged(dates[index]),
        ),
      ),
    );
  }
}

/// Kotak jam 44px tanpa legenda. Kosong: bergaris tipis. Dipilih: aksen.
/// Terisi: dicoret dan nonaktif, jadi tidak hanya dibedakan warna.
class SlotGrid extends StatelessWidget {
  const SlotGrid({super.key, required this.slots, required this.selected, required this.onToggle});

  static const _columns = 4;

  final List<Slot> slots;
  final Set<String> selected;
  final ValueChanged<Slot> onToggle;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return LayoutBuilder(
      builder: (context, constraints) {
        final width = (constraints.maxWidth - Space.sm * (_columns - 1)) / _columns;
        return Wrap(
          spacing: Space.sm,
          runSpacing: Space.sm,
          children: [
            for (final slot in slots)
              Builder(
                builder: (context) {
                  final isSelected = selected.contains(slot.jamMulai);
                  final (background, border, text) = !slot.tersedia
                      ? (palette.surface, palette.surface, palette.muted)
                      : isSelected
                      ? (palette.accent, palette.accent, palette.onAccent)
                      : (palette.raised, palette.line, palette.fg);
                  final label = '${slot.jamMulai}–${slot.jamSelesai}';
                  return Semantics(
                    selected: isSelected,
                    child: Tappable(
                      onTap: slot.tersedia ? () => onToggle(slot) : null,
                      semanticLabel: slot.tersedia ? label : '$label, sudah terisi',
                      child: Container(
                        width: width,
                        height: touchTarget,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: background,
                          border: Border.all(color: border),
                          borderRadius: BorderRadius.circular(Radii.chip),
                        ),
                        child: Text(
                          slot.jamMulai,
                          style: typeScale[TextVariant.label]!.copyWith(
                            color: slot.tersedia ? text : text.withValues(alpha: 0.6),
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            fontFeatures: const [FontFeature.tabularFigures()],
                            decoration: slot.tersedia ? null : TextDecoration.lineThrough,
                            decorationColor: text,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
          ],
        );
      },
    );
  }
}
