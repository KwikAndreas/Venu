import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'primitives.dart';

/// Kerangka layar: latar `bg`, area aman, pita mode keamanan, dan (opsional) bilah atas
/// dengan tombol kembali. Dipakai semua layar agar tata letaknya seragam.
class VenuScreen extends StatelessWidget {
  const VenuScreen({
    super.key,
    required this.child,
    this.title,
    this.showBack = false,
    this.bottom,
  });

  final Widget child;
  final String? title;
  final bool showBack;

  /// Bilah tetap di bawah (mis. total + "Pesan sekarang").
  final Widget? bottom;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return ColoredBox(
      color: palette.bg,
      child: SafeArea(
        bottom: bottom == null,
        child: Column(
          children: [
            const SecurityModeBanner(),
            if (showBack || title != null) _TopBar(title: title, showBack: showBack),
            Expanded(child: child),
            ?bottom,
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.title, required this.showBack});

  final String? title;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: Row(
        children: [
          if (showBack)
            Tappable(
              onTap: () => Navigator.of(context).maybePop(),
              semanticLabel: 'Kembali',
              child: SizedBox.square(
                dimension: 48,
                child: Icon(LucideIcons.arrowLeft, size: 22, color: context.palette.fg),
              ),
            )
          else
            const SizedBox(width: Space.screen),
          if (title != null)
            Expanded(child: VenuText(title!, variant: TextVariant.h3, maxLines: 1)),
        ],
      ),
    );
  }
}

/// Isi layar yang bisa digulir dengan padding standar.
class ScrollBody extends StatelessWidget {
  const ScrollBody({super.key, required this.children, this.gap = Space.xxl});

  final List<Widget> children;
  final double gap;

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(Space.screen, Space.lg, Space.screen, Space.xxxl),
      itemCount: children.length,
      separatorBuilder: (_, _) => SizedBox(height: gap),
      itemBuilder: (_, index) => children[index],
    );
  }
}

/// Halaman baru muncul dengan memudar dan bergeser sedikit (bukan gaya geser iOS).
Route<T> venuRoute<T>(Widget page) => PageRouteBuilder<T>(
  transitionDuration: const Duration(milliseconds: 200),
  reverseTransitionDuration: const Duration(milliseconds: 160),
  pageBuilder: (_, _, _) => page,
  transitionsBuilder: (_, animation, _, child) {
    final curved = CurvedAnimation(parent: animation, curve: Curves.easeOut);
    return FadeTransition(
      opacity: curved,
      child: SlideTransition(
        position: Tween(begin: const Offset(0, 0.03), end: Offset.zero).animate(curved),
        child: child,
      ),
    );
  },
);
