import 'dart:math';

import 'package:flutter/widgets.dart';

import '../state/app_scope.dart';
import '../theme/tokens.dart';

/// Splash pembuka (~1,2 detik, sama dengan web/index.html): hujan karakter berwarna aksen,
/// lalu huruf di tengah teracak dan terkunci satu per satu membentuk "venu.".
/// [onFinished] dipanggil setelah animasi selesai dan splash memudar.
/// Bila perangkat meminta animasi dikurangi, kata langsung tampil tanpa hujan.
class MatrixSplash extends StatefulWidget {
  const MatrixSplash({super.key, required this.onFinished});

  final VoidCallback onFinished;

  @override
  State<MatrixSplash> createState() => _MatrixSplashState();
}

class _MatrixSplashState extends State<MatrixSplash> with SingleTickerProviderStateMixin {
  static const _duration = Duration(milliseconds: 1150);
  static const _fade = Duration(milliseconds: 250);

  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: _duration,
  );
  bool _fading = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_controller.isAnimating || _controller.isCompleted) return;
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.value = 1;
      Future.delayed(const Duration(milliseconds: 400), _fadeOut);
    } else {
      _controller.forward().whenComplete(_fadeOut);
    }
  }

  void _fadeOut() {
    if (mounted) setState(() => _fading = true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return AnimatedOpacity(
      opacity: _fading ? 0 : 1,
      duration: _fade,
      onEnd: widget.onFinished,
      child: ColoredBox(
        color: palette.bg,
        child: ExcludeSemantics(
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, _) => CustomPaint(
              size: Size.infinite,
              painter: _MatrixPainter(
                elapsedMs: _controller.value * _duration.inMilliseconds,
                palette: palette,
                showRain: !MediaQuery.disableAnimationsOf(context),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _MatrixPainter extends CustomPainter {
  _MatrixPainter({required this.elapsedMs, required this.palette, required this.showRain});

  static const _glyphs = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#\$%&*+=<>';
  static const _word = 'venu.';
  static const _rainMs = 950.0;
  static const _lockStartMs = 300.0;
  static const _lockStepMs = 120.0;

  /// Karakter berganti tiap 50 ms agar kedipannya terasa seperti layar terminal.
  static const _glyphTickMs = 50.0;
  static const _cell = 16.0;
  static const _trail = 10;

  final double elapsedMs;
  final VenuPalette palette;
  final bool showRain;

  String _glyph(int seed) {
    final tick = (elapsedMs / _glyphTickMs).floor();
    return _glyphs[Random(seed * 7919 + tick).nextInt(_glyphs.length)];
  }

  TextPainter _layout(String text, TextStyle style) => TextPainter(
    text: TextSpan(text: text, style: style),
    textDirection: TextDirection.ltr,
  )..layout();

  void _paintRain(Canvas canvas, Size size) {
    final fade = (1 - elapsedMs / _rainMs).clamp(0.0, 1.0);
    if (fade == 0) return;
    final columns = (size.width / _cell).ceil();
    for (var column = 0; column < columns; column++) {
      // Kecepatan dan posisi awal acak tapi tetap per kolom (seed = nomor kolom).
      final random = Random(column);
      final speed = 0.35 + random.nextDouble() * 0.5; // px per ms
      final start = -random.nextDouble() * size.height * 0.6;
      final head = start + elapsedMs * speed;
      for (var step = 0; step < _trail; step++) {
        final y = head - step * _cell;
        if (y < -_cell || y > size.height) continue;
        final alpha = fade * (1 - step / _trail);
        _layout(
          _glyph(column * 31 + step),
          TextStyle(
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: palette.accent.withValues(alpha: alpha),
          ),
        ).paint(canvas, Offset(column * _cell, y));
      }
    }
  }

  void _paintWord(Canvas canvas, Size size) {
    final wordSize = (size.width * 0.14).clamp(56.0, 96.0);
    final letters = <TextPainter>[];
    for (var index = 0; index < _word.length; index++) {
      final locked = elapsedMs >= _lockStartMs + index * _lockStepMs;
      final letter = _word[index];
      final color = !locked
          ? palette.accent
          : letter == '.'
          ? palette.accent
          : palette.fg;
      letters.add(
        _layout(
          locked ? letter : _glyph(1000 + index),
          TextStyle(
            fontFamily: fontFamily,
            fontSize: wordSize,
            fontWeight: FontWeight.w800,
            letterSpacing: -1,
            color: color,
          ),
        ),
      );
    }
    final total = letters.fold<double>(0, (sum, painter) => sum + painter.width);
    var x = (size.width - total) / 2;
    for (final painter in letters) {
      painter.paint(canvas, Offset(x, (size.height - painter.height) / 2));
      x += painter.width;
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (showRain) _paintRain(canvas, size);
    _paintWord(canvas, size);
  }

  @override
  bool shouldRepaint(_MatrixPainter oldDelegate) =>
      oldDelegate.elapsedMs != elapsedMs || oldDelegate.palette != palette;
}
