import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/booking_rules.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'controls.dart';
import 'primitives.dart';

class Skeleton extends StatelessWidget {
  const Skeleton({super.key, this.height, this.width, this.radius = Radii.chip, this.aspectRatio});

  final double? height;
  final double? width;
  final double radius;
  final double? aspectRatio;

  @override
  Widget build(BuildContext context) {
    final box = Container(
      height: height,
      width: width ?? double.infinity,
      decoration: BoxDecoration(
        color: context.palette.surface,
        borderRadius: BorderRadius.circular(radius),
      ),
    );
    return ExcludeSemantics(
      child: aspectRatio == null ? box : AspectRatio(aspectRatio: aspectRatio!, child: box),
    );
  }
}

/// Ikon kecil dalam lingkaran + judul + satu kalimat + satu aksi.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.action,
  });

  final IconData icon;
  final String title;
  final String description;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.xxxl),
      child: Column(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: palette.surface, shape: BoxShape.circle),
            child: Icon(icon, size: 22, color: palette.muted),
          ),
          const SizedBox(height: Space.md),
          VenuText(title, variant: TextVariant.h3, align: TextAlign.center),
          const SizedBox(height: Space.xs),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 300),
            child: VenuText(description, tone: TextTone.muted, align: TextAlign.center),
          ),
          if (action != null) ...[const SizedBox(height: Space.lg), action!],
        ],
      ),
    );
  }
}

class ErrorState extends StatelessWidget {
  const ErrorState({super.key, required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: Space.xxxl),
      child: Column(
        children: [
          VenuText(message, tone: TextTone.danger, align: TextAlign.center),
          const SizedBox(height: Space.md),
          VenuButton(
            label: 'Coba lagi',
            variant: ButtonVariant.secondary,
            small: true,
            onPressed: onRetry,
          ),
        ],
      ),
    );
  }
}

/// Error formulir dari server, dengan ikon agar tidak hanya dibedakan warna.
class FormError extends StatelessWidget {
  const FormError({super.key, required this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    if (message == null) return const SizedBox.shrink();
    final palette = context.palette;
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(Space.md),
        decoration: BoxDecoration(
          color: palette.dangerSoft,
          borderRadius: BorderRadius.circular(Radii.chip),
        ),
        child: Row(
          children: [
            Icon(LucideIcons.circleAlert, size: 18, color: palette.danger),
            const SizedBox(width: Space.sm),
            Expanded(child: VenuText(message!, tone: TextTone.danger)),
          ],
        ),
      ),
    );
  }
}

/// Satu-satunya penanda status booking (status booking + pembayaran sudah digabung).
class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.stage});

  final Stage stage;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (background, text) = switch (stage.tone) {
      StageTone.warning => (palette.warningSoft, palette.warning),
      StageTone.success => (palette.accentSoft, palette.accent),
      StageTone.danger => (palette.dangerSoft, palette.danger),
      StageTone.neutral => (palette.surface, palette.muted),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: Space.md, vertical: Space.xs),
      decoration: BoxDecoration(color: background, borderRadius: BorderRadius.circular(Radii.pill)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(color: text, shape: BoxShape.circle),
          ),
          const SizedBox(width: Space.sm),
          VenuText(stage.label, variant: TextVariant.label, color: text, weight: FontWeight.w600),
        ],
      ),
    );
  }
}
