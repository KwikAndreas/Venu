import 'package:flutter/material.dart'
    show TextField, InputDecoration, InputBorder, TextInputAction;
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'primitives.dart';

enum ButtonVariant { primary, neutral, secondary, ghost, dangerGhost }

/// Tombol berbentuk pil, tinggi 44px (36px kecil). Label sentence case.
class VenuButton extends StatelessWidget {
  const VenuButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = ButtonVariant.primary,
    this.small = false,
    this.icon,
    this.loading = false,
    this.expand = false,
  });

  final String label;

  /// null = nonaktif.
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final bool small;
  final IconData? icon;
  final bool loading;
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (background, border, text) = switch (variant) {
      ButtonVariant.primary => (palette.accent, palette.accent, palette.onAccent),
      ButtonVariant.neutral => (palette.fg, palette.fg, palette.bg),
      ButtonVariant.secondary => (const Color(0x00000000), palette.line, palette.fg),
      ButtonVariant.ghost => (const Color(0x00000000), const Color(0x00000000), palette.fg),
      ButtonVariant.dangerGhost => (
        const Color(0x00000000),
        const Color(0x00000000),
        palette.danger,
      ),
    };
    final enabled = onPressed != null && !loading;

    final content = loading
        ? SizedBox.square(dimension: 18, child: _Spinner(color: text))
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: small ? 16 : 18, color: text),
                const SizedBox(width: Space.sm),
              ],
              VenuText(
                label,
                variant: TextVariant.bodyStrong,
                color: text,
                weight: FontWeight.w700,
              ),
            ],
          );

    return Tappable(
      onTap: enabled ? onPressed : null,
      semanticLabel: label,
      child: Opacity(
        opacity: enabled || loading ? 1 : 0.45,
        child: Container(
          height: small ? 36 : touchTarget,
          width: expand ? double.infinity : null,
          padding: EdgeInsets.symmetric(horizontal: small ? Space.lg : Space.xl),
          decoration: BoxDecoration(
            color: background,
            border: Border.all(color: border),
            borderRadius: BorderRadius.circular(Radii.pill),
          ),
          // widthFactor 1: lebar tombol mengikuti isinya, kecuali [expand].
          child: Align(widthFactor: expand ? null : 1, child: content),
        ),
      ),
    );
  }
}

/// Indikator memuat sederhana (busur berputar) dengan warna token.
class _Spinner extends StatefulWidget {
  const _Spinner({required this.color});

  final Color color;

  @override
  State<_Spinner> createState() => _SpinnerState();
}

class _SpinnerState extends State<_Spinner> with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 800),
  )..repeat();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => RotationTransition(
    turns: _controller,
    child: CustomPaint(painter: _ArcPainter(widget.color)),
  );
}

class _ArcPainter extends CustomPainter {
  _ArcPainter(this.color);

  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeCap = StrokeCap.round;
    canvas.drawArc(Offset.zero & size, 0, 4.4, false, paint);
  }

  @override
  bool shouldRepaint(_ArcPainter oldDelegate) => oldDelegate.color != color;
}

/// Label di atas input; error tampil dengan ikon, tidak hanya warna.
class VenuTextField extends StatelessWidget {
  const VenuTextField({
    super.key,
    required this.label,
    required this.controller,
    this.error,
    this.hint,
    this.obscure = false,
    this.keyboardType,
    this.autofillHints,
    this.textInputAction,
    this.onSubmitted,
  });

  final String label;
  final TextEditingController controller;
  final String? error;
  final String? hint;
  final bool obscure;
  final TextInputType? keyboardType;
  final Iterable<String>? autofillHints;
  final TextInputAction? textInputAction;
  final ValueChanged<String>? onSubmitted;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label visual tidak dibacakan terpisah; field sudah membawa label yang sama.
        ExcludeSemantics(
          child: VenuText(label, variant: TextVariant.label, tone: TextTone.muted),
        ),
        const SizedBox(height: Space.sm),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: Space.lg),
          decoration: BoxDecoration(
            color: palette.raised,
            border: Border.all(color: error == null ? palette.line : palette.danger),
            borderRadius: BorderRadius.circular(Radii.chip),
          ),
          child: Semantics(
            label: label,
            textField: true,
            child: TextField(
              controller: controller,
              obscureText: obscure,
              keyboardType: keyboardType,
              autofillHints: autofillHints,
              textInputAction: textInputAction,
              onSubmitted: onSubmitted,
              autocorrect: false,
              cursorColor: palette.accent,
              style: typeScale[TextVariant.body]!.copyWith(
                color: palette.fg,
                fontWeight: FontWeight.w500,
              ),
              decoration: InputDecoration(
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(vertical: 14),
                border: InputBorder.none,
                hintText: hint,
                hintStyle: typeScale[TextVariant.body]!.copyWith(color: palette.muted),
              ),
            ),
          ),
        ),
        if (error != null) ...[
          const SizedBox(height: Space.sm),
          Row(
            children: [
              Icon(LucideIcons.circleAlert, size: 14, color: palette.danger),
              const SizedBox(width: Space.xs),
              Expanded(
                child: VenuText(error!, variant: TextVariant.small, tone: TextTone.danger),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

/// Pil pilihan (kota, tanggal). Terpilih memakai aksen, sesuai DESIGN.md §2.
class Pill extends StatelessWidget {
  const Pill({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
    this.caption,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  /// Teks kecil di atas label, mis. nama hari pada pemilih tanggal.
  final String? caption;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Semantics(
      selected: selected,
      child: Tappable(
        onTap: onTap,
        semanticLabel: caption == null ? label : '$caption $label',
        child: Container(
          constraints: BoxConstraints(minHeight: caption == null ? 36 : 56, minWidth: 64),
          padding: EdgeInsets.symmetric(horizontal: caption == null ? Space.lg : Space.md),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: selected ? palette.accentSoft : palette.raised,
            border: Border.all(color: selected ? palette.accent : palette.line),
            borderRadius: BorderRadius.circular(caption == null ? Radii.pill : Radii.card),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (caption != null)
                VenuText(
                  caption!,
                  variant: TextVariant.small,
                  tone: selected ? TextTone.accent : TextTone.muted,
                ),
              VenuText(
                label,
                variant: TextVariant.label,
                tone: selected ? TextTone.accent : TextTone.fg,
                weight: FontWeight.w600,
                numeric: true,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Segmen berbentuk pil: wadah `surface`, item aktif terangkat (`raised` + bayangan).
class Segment<T> extends StatelessWidget {
  const Segment({super.key, required this.options, required this.value, required this.onChanged});

  final List<(T, String)> options;
  final T value;
  final ValueChanged<T> onChanged;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      padding: const EdgeInsets.all(Space.xs),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(Radii.pill),
      ),
      child: Row(
        children: [
          for (final (option, label) in options)
            Expanded(
              child: Semantics(
                selected: option == value,
                child: Tappable(
                  onTap: () => onChanged(option),
                  semanticLabel: label,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: option == value ? palette.raised : null,
                      borderRadius: BorderRadius.circular(Radii.pill),
                      boxShadow: option == value ? softShadow(palette) : null,
                    ),
                    child: VenuText(
                      label,
                      variant: TextVariant.label,
                      tone: option == value ? TextTone.fg : TextTone.muted,
                      weight: option == value ? FontWeight.w700 : null,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
