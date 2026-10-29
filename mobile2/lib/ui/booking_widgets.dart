import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/booking_rules.dart';
import '../core/format.dart';
import '../core/models.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'controls.dart';
import 'feedback.dart';
import 'primitives.dart';

/// Status booking terdekat, tampil paling atas di layar Cari tanpa perlu scroll.
/// Status yang tampil selalu milik booking yang disebut namanya; booking lain cukup dihitung.
class ActiveBookingStrip extends StatelessWidget {
  const ActiveBookingStrip({super.key, required this.onOpenPayment, required this.onOpenBookings});

  final ValueChanged<BookingSummary> onOpenPayment;
  final VoidCallback onOpenBookings;

  @override
  Widget build(BuildContext context) {
    final active = AppScope.bookings(context).active;
    if (active.isEmpty) return const SizedBox.shrink();

    final palette = context.palette;
    final nearest = active.first;
    final others = active.length - 1;
    final goesToPayment = others == 0 && nearest.needsPayment;
    final action = others > 0
        ? 'Lihat semua'
        : nearest.needsPayment
        ? 'Bayar sekarang'
        : 'Lihat detail';

    return Tappable(
      onTap: goesToPayment ? () => onOpenPayment(nearest) : onOpenBookings,
      child: Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(
          color: palette.surface,
          border: Border.all(color: palette.line),
          borderRadius: BorderRadius.circular(Radii.card),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            StatusBadge(stage: renterStage(nearest)),
            const SizedBox(height: Space.sm),
            Text.rich(
              TextSpan(
                style: typeScale[TextVariant.small]!.copyWith(color: palette.muted),
                children: [
                  TextSpan(
                    text: nearest.venueNama,
                    style: TextStyle(color: palette.fg, fontWeight: FontWeight.w700),
                  ),
                  TextSpan(
                    text:
                        ' · ${formatShortDate(nearest.tanggal)} · ${nearest.jamMulai}–${nearest.jamSelesai}',
                  ),
                  if (others > 0)
                    TextSpan(
                      text: ' · +$others booking lain',
                      style: TextStyle(color: palette.fg, fontWeight: FontWeight.w700),
                    ),
                ],
              ),
            ),
            const SizedBox(height: Space.sm),
            Row(
              children: [
                VenuText(
                  action,
                  variant: TextVariant.label,
                  tone: TextTone.accent,
                  weight: FontWeight.w700,
                ),
                const SizedBox(width: Space.xs),
                Icon(LucideIcons.arrowRight, size: 16, color: palette.accent),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Blok tanggal ala kalender: tanggal besar, bulan kecil.
class _DateBlock extends StatelessWidget {
  const _DateBlock({required this.date});

  final String date;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 56,
      height: 60,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: context.palette.surface,
        borderRadius: BorderRadius.circular(Radii.chip),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          VenuText('${int.parse(date.substring(8, 10))}', variant: TextVariant.h2, numeric: true),
          VenuText(formatMonth(date), variant: TextVariant.small, tone: TextTone.muted),
        ],
      ),
    );
  }
}

class BookingRow extends StatelessWidget {
  const BookingRow({super.key, required this.booking, required this.onCancel, required this.onPay});

  final BookingSummary booking;
  final VoidCallback onCancel;
  final VoidCallback onPay;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final showCancel = canCancel(booking);
    final showPay = booking.needsPayment;
    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _DateBlock(date: booking.tanggal),
              const SizedBox(width: Space.lg),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    VenuText(
                      booking.venueNama,
                      variant: TextVariant.h3,
                      maxLines: 1,
                      semanticsLabel: '${formatDate(booking.tanggal)}, ${booking.venueNama}',
                    ),
                    const SizedBox(height: Space.xs),
                    Text.rich(
                      TextSpan(
                        style: typeScale[TextVariant.small]!.copyWith(color: palette.muted),
                        children: [
                          TextSpan(
                            text: '${booking.jamMulai}–${booking.jamSelesai}',
                            style: TextStyle(color: palette.fg, fontWeight: FontWeight.w600),
                          ),
                          TextSpan(
                            text: ' · ${booking.venueKota} · ${formatRupiah(booking.totalHarga)}',
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: Space.sm),
                    StatusBadge(stage: renterStage(booking)),
                  ],
                ),
              ),
            ],
          ),
          if (showCancel || showPay) ...[
            const SizedBox(height: Space.md),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (showCancel)
                  VenuButton(
                    label: 'Batalkan',
                    variant: ButtonVariant.dangerGhost,
                    small: true,
                    onPressed: onCancel,
                  ),
                if (showCancel && showPay) const SizedBox(width: Space.sm),
                if (showPay) VenuButton(label: 'Bayar sekarang', small: true, onPressed: onPay),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
