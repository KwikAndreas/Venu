import 'package:flutter/widgets.dart';

import '../core/config.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';

enum TextTone { fg, muted, accent, danger, warning, onAccent }

extension on VenuPalette {
  Color tone(TextTone tone) => switch (tone) {
    TextTone.fg => fg,
    TextTone.muted => muted,
    TextTone.accent => accent,
    TextTone.danger => danger,
    TextTone.warning => warning,
    TextTone.onAccent => onAccent,
  };
}

/// Satu-satunya komponen teks: tipe dari DESIGN.md §3, warna dari token tema.
class VenuText extends StatelessWidget {
  const VenuText(
    this.text, {
    super.key,
    this.variant = TextVariant.body,
    this.tone = TextTone.fg,
    this.color,
    this.weight,
    this.numeric = false,
    this.maxLines,
    this.align,
    this.semanticsLabel,
  });

  final String text;
  final TextVariant variant;
  final TextTone tone;

  /// Mengganti warna dari [tone] (mis. warna status).
  final Color? color;
  final FontWeight? weight;

  /// Angka sejajar (harga, jam) agar mudah dibandingkan.
  final bool numeric;
  final int? maxLines;
  final TextAlign? align;
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      maxLines: maxLines,
      overflow: maxLines == null ? null : TextOverflow.ellipsis,
      textAlign: align,
      semanticsLabel: semanticsLabel,
      style: typeScale[variant]!.copyWith(
        color: color ?? context.palette.tone(tone),
        fontWeight: weight,
        fontFeatures: numeric ? const [FontFeature.tabularFigures()] : null,
      ),
    );
  }
}

/// Area sentuh dengan umpan balik redup saat ditekan (tanpa efek riak bawaan platform).
class Tappable extends StatefulWidget {
  const Tappable({super.key, required this.onTap, required this.child, this.semanticLabel});

  final VoidCallback? onTap;
  final Widget child;
  final String? semanticLabel;

  @override
  State<Tappable> createState() => _TappableState();
}

class _TappableState extends State<Tappable> {
  bool _pressed = false;

  void _setPressed(bool value) {
    if (widget.onTap != null) setState(() => _pressed = value);
  }

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      enabled: widget.onTap != null,
      label: widget.semanticLabel,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: widget.onTap,
        onTapDown: (_) => _setPressed(true),
        onTapUp: (_) => _setPressed(false),
        onTapCancel: () => _setPressed(false),
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 120),
          opacity: _pressed ? 0.7 : 1,
          child: widget.child,
        ),
      ),
    );
  }
}

/// Panel `raised` bergaris tipis untuk mengelompokkan isi.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child, this.padding = const EdgeInsets.all(Space.lg)});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: palette.raised,
        border: Border.all(color: palette.line),
        borderRadius: BorderRadius.circular(Radii.card),
      ),
      child: child,
    );
  }
}

class Hairline extends StatelessWidget {
  const Hairline({super.key});

  @override
  Widget build(BuildContext context) => Container(height: 1, color: context.palette.line);
}

/// Baris label–nilai untuk ringkasan (jadwal, total, dll.).
class InfoRow extends StatelessWidget {
  const InfoRow({super.key, required this.label, required this.value});

  final String label;
  final Widget value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        VenuText(label, tone: TextTone.muted),
        const SizedBox(width: Space.lg),
        Expanded(
          child: Align(alignment: Alignment.centerRight, child: value),
        ),
      ],
    );
  }
}

/// Pita peringatan saat aplikasi dijalankan dengan SECURITY_MODE=before.
class SecurityModeBanner extends StatelessWidget {
  const SecurityModeBanner({super.key});

  @override
  Widget build(BuildContext context) {
    if (!isBeforeMode) return const SizedBox.shrink();
    return Container(
      width: double.infinity,
      color: context.palette.warningSoft,
      padding: const EdgeInsets.symmetric(horizontal: Space.lg, vertical: Space.sm),
      child: const VenuText(
        'Mode before: celah keamanan sengaja aktif. Hanya untuk pengujian lokal.',
        variant: TextVariant.small,
        tone: TextTone.warning,
        align: TextAlign.center,
      ),
    );
  }
}
