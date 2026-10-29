// Token desain "Galeri Banding" (DESIGN.md §2–§4). Nama dan nilai sama dengan
// web/src/index.css dan mobile/src/constants/theme.ts; ubah di semua tempat sekaligus.
import 'package:flutter/widgets.dart';

class VenuPalette {
  const VenuPalette({
    required this.bg,
    required this.surface,
    required this.raised,
    required this.line,
    required this.fg,
    required this.muted,
    required this.accent,
    required this.accentSoft,
    required this.onAccent,
    required this.warning,
    required this.warningSoft,
    required this.danger,
    required this.dangerSoft,
    required this.imgFutsal,
    required this.imgBadminton,
    required this.imgBasket,
    required this.shadow,
  });

  final Color bg;
  final Color surface;
  final Color raised;
  final Color line;
  final Color fg;
  final Color muted;
  final Color accent;
  final Color accentSoft;
  final Color onAccent;
  final Color warning;
  final Color warningSoft;
  final Color danger;
  final Color dangerSoft;

  /// Pengganti foto per cabang olahraga.
  final Color imgFutsal;
  final Color imgBadminton;
  final Color imgBasket;
  final Color shadow;

  static const light = VenuPalette(
    bg: Color(0xFFFBFAF7),
    surface: Color(0xFFF3F1EC),
    raised: Color(0xFFFFFFFF),
    line: Color(0xFFE7E3DA),
    fg: Color(0xFF1D1B17),
    muted: Color(0xFF6C665C),
    accent: Color(0xFF1F6B45),
    accentSoft: Color(0xFFE6F0EA),
    onAccent: Color(0xFFFFFFFF),
    warning: Color(0xFF8A5A0B),
    warningSoft: Color(0xFFFBF1DD),
    danger: Color(0xFFB42318),
    dangerSoft: Color(0xFFFDECEA),
    imgFutsal: Color(0xFFC8BAA1),
    imgBadminton: Color(0xFFB3C2B0),
    imgBasket: Color(0xFFC3B2A9),
    shadow: Color(0x141D1B17),
  );

  static const dark = VenuPalette(
    bg: Color(0xFF151412),
    surface: Color(0xFF1D1B19),
    raised: Color(0xFF221F1C),
    line: Color(0xFF312D29),
    fg: Color(0xFFEEEAE3),
    muted: Color(0xFFA39B8F),
    accent: Color(0xFF86C7A1),
    accentSoft: Color(0xFF1B2A22),
    onAccent: Color(0xFF0F1712),
    warning: Color(0xFFE8BD6C),
    warningSoft: Color(0xFF2C2417),
    danger: Color(0xFFF19A8F),
    dangerSoft: Color(0xFF2F1C1A),
    imgFutsal: Color(0xFF322D26),
    imgBadminton: Color(0xFF282F28),
    imgBasket: Color(0xFF322A26),
    shadow: Color(0x59000000),
  );
}

/// Grid jarak 4px.
abstract final class Space {
  static const xs = 4.0;
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
  static const xxxl = 32.0;

  /// Padding horizontal layar (DESIGN.md §4: 20px di mobile).
  static const screen = xl;
}

abstract final class Radii {
  static const chip = 12.0;
  static const card = 18.0;
  static const pill = 999.0;
}

/// Tinggi target sentuh minimum.
const touchTarget = 44.0;

const fontFamily = 'PlusJakartaSans';

enum TextVariant { display, h1, h2, h3, body, bodyStrong, label, small }

/// Skala tipe mobile (DESIGN.md §3).
const Map<TextVariant, TextStyle> typeScale = {
  TextVariant.display: TextStyle(
    fontFamily: fontFamily,
    fontSize: 32,
    height: 38 / 32,
    fontWeight: FontWeight.w800,
    letterSpacing: -1,
  ),
  TextVariant.h1: TextStyle(
    fontFamily: fontFamily,
    fontSize: 28,
    height: 34 / 28,
    fontWeight: FontWeight.w800,
    letterSpacing: -0.8,
  ),
  TextVariant.h2: TextStyle(
    fontFamily: fontFamily,
    fontSize: 20,
    height: 28 / 20,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.4,
  ),
  TextVariant.h3: TextStyle(
    fontFamily: fontFamily,
    fontSize: 17,
    height: 24 / 17,
    fontWeight: FontWeight.w700,
    letterSpacing: -0.2,
  ),
  TextVariant.body: TextStyle(
    fontFamily: fontFamily,
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w400,
  ),
  TextVariant.bodyStrong: TextStyle(
    fontFamily: fontFamily,
    fontSize: 15,
    height: 22 / 15,
    fontWeight: FontWeight.w600,
  ),
  TextVariant.label: TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w500,
  ),
  TextVariant.small: TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    height: 18 / 13,
    fontWeight: FontWeight.w400,
  ),
};

/// Satu-satunya bayangan (`shadow-soft`) untuk elemen mengambang.
List<BoxShadow> softShadow(VenuPalette palette) => [
  BoxShadow(color: palette.shadow, blurRadius: 16, offset: const Offset(0, 6)),
];
