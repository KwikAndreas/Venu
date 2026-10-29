import 'package:flutter/widgets.dart';

import '../state/app_scope.dart';
import '../theme/tokens.dart';
import 'controls.dart';
import 'primitives.dart';

Future<T?> _showPanel<T>(BuildContext context, Widget Function(BuildContext) builder) {
  return Navigator.of(context).push<T>(
    PageRouteBuilder<T>(
      opaque: false,
      barrierDismissible: true,
      barrierColor: const Color(0x66000000),
      transitionDuration: const Duration(milliseconds: 180),
      reverseTransitionDuration: const Duration(milliseconds: 150),
      pageBuilder: (context, _, _) => SafeArea(
        child: Center(
          child: Padding(padding: const EdgeInsets.all(Space.xxl), child: builder(context)),
        ),
      ),
      transitionsBuilder: (context, animation, _, child) => FadeTransition(
        opacity: CurvedAnimation(parent: animation, curve: Curves.easeOut),
        child: ScaleTransition(
          scale: Tween(begin: 0.96, end: 1.0).animate(animation),
          child: child,
        ),
      ),
    ),
  );
}

class _DialogPanel extends StatelessWidget {
  const _DialogPanel({required this.title, required this.message, required this.actions});

  final String title;
  final String message;
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 380),
      child: Container(
        padding: const EdgeInsets.all(Space.xxl),
        decoration: BoxDecoration(
          color: palette.raised,
          borderRadius: BorderRadius.circular(16),
          boxShadow: softShadow(palette),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            VenuText(title, variant: TextVariant.h2),
            const SizedBox(height: Space.sm),
            VenuText(message, tone: TextTone.muted),
            const SizedBox(height: Space.xxl),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                for (final (index, action) in actions.indexed) ...[
                  if (index > 0) const SizedBox(width: Space.sm),
                  action,
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// Konfirmasi sebelum aksi destruktif. Aksi destruktif tidak bersaing visual dengan "Kembali".
Future<bool> confirmAction(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
}) async {
  final confirmed = await _showPanel<bool>(
    context,
    (dialogContext) => _DialogPanel(
      title: title,
      message: message,
      actions: [
        VenuButton(
          label: 'Kembali',
          variant: ButtonVariant.secondary,
          small: true,
          onPressed: () => Navigator.of(dialogContext).pop(false),
        ),
        VenuButton(
          label: confirmLabel,
          variant: ButtonVariant.dangerGhost,
          small: true,
          onPressed: () => Navigator.of(dialogContext).pop(true),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}

/// Pesan singkat (mis. error dari server) dengan satu tombol tutup.
Future<void> notify(BuildContext context, {required String title, required String message}) {
  return _showPanel<void>(
    context,
    (dialogContext) => _DialogPanel(
      title: title,
      message: message,
      actions: [
        VenuButton(
          label: 'Mengerti',
          variant: ButtonVariant.neutral,
          small: true,
          onPressed: () => Navigator.of(dialogContext).pop(),
        ),
      ],
    ),
  );
}
