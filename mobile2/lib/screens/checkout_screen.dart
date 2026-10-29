import 'dart:typed_data';

import 'package:flutter/widgets.dart';
import 'package:image_picker/image_picker.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/api_client.dart';
import '../core/booking_rules.dart';
import '../core/format.dart';
import '../core/models.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import '../ui/controls.dart';
import '../ui/feedback.dart';
import '../ui/layout.dart';
import '../ui/loader.dart';
import '../ui/primitives.dart';

// Semua instruksi pembayaran di bawah adalah SIMULASI untuk keperluan tugas.
const _methods = [
  (
    PaymentMethod.transfer,
    LucideIcons.landmark,
    'Transfer ke rekening simulasi 000-000-0000 a.n. Venu Demo.',
  ),
  (
    PaymentMethod.eWallet,
    LucideIcons.smartphone,
    'Kirim ke nomor e-wallet simulasi 0800-0000-0000 a.n. Venu Demo.',
  ),
  (
    PaymentMethod.qris,
    LucideIcons.qrCode,
    'Pindai kode QRIS simulasi di kasir lapangan, lalu simpan buktinya.',
  ),
];

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key, required this.bookingId});

  final int bookingId;

  @override
  Widget build(BuildContext context) {
    return VenuScreen(
      title: 'Selesaikan pemesanan',
      showBack: true,
      child: ApiLoader<BookingSummary>(
        requestKey: bookingId,
        load: () async => BookingSummary.fromJson(
          (await ApiClient.get('/bookings/$bookingId'))['booking'] as Map<String, dynamic>,
        ),
        placeholder: const ScrollBody(
          gap: Space.lg,
          children: [
            Skeleton(height: 200, radius: Radii.card),
            Skeleton(height: 320, radius: Radii.card),
          ],
        ),
        builder: (context, booking, reload) => ScrollBody(
          gap: Space.lg,
          children: [
            _Summary(booking: booking),
            if (booking.needsPayment)
              _PaymentForm(
                booking: booking,
                onPaid: () {
                  reload();
                  AppScope.bookings(context).reload();
                },
              )
            else
              _PaymentStatus(booking: booking),
          ],
        ),
      ),
    );
  }
}

class _Summary extends StatelessWidget {
  const _Summary({required this.booking});

  final BookingSummary booking;

  @override
  Widget build(BuildContext context) {
    final hours = hoursBetween(booking.jamMulai, booking.jamSelesai);
    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          VenuText(booking.venueNama, variant: TextVariant.h2),
          VenuText('${booking.sport.label} · ${booking.venueKota}', tone: TextTone.muted),
          const SizedBox(height: Space.lg),
          const Hairline(),
          const SizedBox(height: Space.lg),
          InfoRow(
            label: 'Tanggal',
            value: VenuText(formatDate(booking.tanggal), variant: TextVariant.bodyStrong),
          ),
          const SizedBox(height: Space.md),
          InfoRow(
            label: 'Jam',
            value: VenuText(
              '${booking.jamMulai}–${booking.jamSelesai} ($hours jam)',
              variant: TextVariant.bodyStrong,
              numeric: true,
            ),
          ),
          const SizedBox(height: Space.md),
          InfoRow(
            label: 'Total',
            value: VenuText(
              formatRupiah(booking.totalHarga),
              variant: TextVariant.h2,
              numeric: true,
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentForm extends StatefulWidget {
  const _PaymentForm({required this.booking, required this.onPaid});

  final BookingSummary booking;
  final VoidCallback onPaid;

  @override
  State<_PaymentForm> createState() => _PaymentFormState();
}

class _PaymentFormState extends State<_PaymentForm> {
  PaymentMethod _method = PaymentMethod.transfer;
  ({String name, Uint8List bytes})? _proof;
  String? _error;
  bool _submitting = false;

  Future<void> _pickProof() async {
    setState(() => _error = null);
    final file = await ImagePicker().pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (file == null) return;
    final bytes = await file.readAsBytes();
    if (bytes.length > maxUploadBytes) {
      setState(() => _error = 'Ukuran file maksimal 2 MB.');
      return;
    }
    setState(() => _proof = (name: file.name, bytes: bytes));
  }

  Future<void> _submit() async {
    final proof = _proof;
    if (proof == null) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      await ApiClient.upload(
        '/bookings/${widget.booking.id}/payment',
        fields: {'metode': _method.apiValue},
        fileField: 'bukti',
        bytes: proof.bytes,
        filename: proof.name,
      );
      widget.onPaid();
    } on ApiException catch (error) {
      setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final proof = _proof;
    return Panel(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const VenuText('Pembayaran', variant: TextVariant.h2),
          const VenuText(
            'Pembayaran ini simulasi. Tidak ada uang yang ditarik.',
            variant: TextVariant.small,
            tone: TextTone.muted,
          ),
          const SizedBox(height: Space.lg),
          for (final (method, icon, instruction) in _methods) ...[
            Semantics(
              selected: method == _method,
              child: Tappable(
                onTap: () => setState(() => _method = method),
                semanticLabel: method.label,
                child: Container(
                  padding: const EdgeInsets.all(Space.lg),
                  decoration: BoxDecoration(
                    color: method == _method ? palette.accentSoft : palette.raised,
                    border: Border.all(color: method == _method ? palette.accent : palette.line),
                    borderRadius: BorderRadius.circular(Radii.chip),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(icon, size: 20, color: palette.fg),
                      const SizedBox(width: Space.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            VenuText(method.label, variant: TextVariant.bodyStrong),
                            if (method == _method)
                              VenuText(
                                instruction,
                                variant: TextVariant.small,
                                tone: TextTone.muted,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: Space.sm),
          ],
          const SizedBox(height: Space.sm),
          const VenuText('Bukti bayar', variant: TextVariant.label, tone: TextTone.muted),
          const SizedBox(height: Space.sm),
          if (proof == null)
            VenuButton(
              label: 'Pilih foto bukti bayar',
              variant: ButtonVariant.secondary,
              icon: LucideIcons.imageUp,
              expand: true,
              onPressed: _pickProof,
            )
          else
            Container(
              padding: const EdgeInsets.all(Space.sm),
              decoration: BoxDecoration(
                border: Border.all(color: palette.line),
                borderRadius: BorderRadius.circular(Radii.chip),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.memory(proof.bytes, width: 44, height: 44, fit: BoxFit.cover),
                  ),
                  const SizedBox(width: Space.md),
                  Expanded(child: VenuText(proof.name, variant: TextVariant.small, maxLines: 1)),
                  VenuButton(
                    label: 'Ganti',
                    variant: ButtonVariant.ghost,
                    small: true,
                    onPressed: _pickProof,
                  ),
                ],
              ),
            ),
          const SizedBox(height: Space.sm),
          const VenuText(
            'JPG atau PNG, maksimal 2 MB.',
            variant: TextVariant.small,
            tone: TextTone.muted,
          ),
          if (_error != null) ...[const SizedBox(height: Space.lg), FormError(message: _error)],
          const SizedBox(height: Space.lg),
          VenuButton(
            label: 'Kirim bukti bayar',
            expand: true,
            loading: _submitting,
            onPressed: proof == null ? null : _submit,
          ),
        ],
      ),
    );
  }
}

class _PaymentStatus extends StatelessWidget {
  const _PaymentStatus({required this.booking});

  final BookingSummary booking;

  @override
  Widget build(BuildContext context) {
    final toBookings = VenuButton(
      label: 'Kembali',
      variant: ButtonVariant.secondary,
      onPressed: () => Navigator.of(context).maybePop(),
    );
    if (booking.paymentStatus == PaymentStatus.lunas) {
      return EmptyState(
        icon: LucideIcons.circleCheck,
        title: 'Pembayaran lunas',
        description: 'Bookingmu sudah dikonfirmasi pemilik. Sampai jumpa di lapangan!',
        action: toBookings,
      );
    }
    if (booking.paymentStatus == PaymentStatus.menunggu) {
      return EmptyState(
        icon: LucideIcons.hourglass,
        title: 'Menunggu konfirmasi pemilik',
        description:
            'Bukti bayar sudah terkirim. Pemilik akan memeriksa lalu mengonfirmasi bookingmu.',
        action: toBookings,
      );
    }
    return EmptyState(
      icon: LucideIcons.hourglass,
      title: 'Booking tidak bisa dibayar',
      description: 'Booking ini berstatus "${booking.status.name}".',
      action: toBookings,
    );
  }
}
