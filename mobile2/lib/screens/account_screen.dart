import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/config.dart';
import '../state/app_scope.dart';
import '../state/controllers.dart';
import '../theme/tokens.dart';
import '../ui/controls.dart';
import '../ui/dialogs.dart';
import '../ui/layout.dart';
import '../ui/primitives.dart';
import 'auth_screens.dart';

class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    final confirmed = await confirmAction(
      context,
      title: 'Keluar dari akun?',
      message: 'Kamu perlu masuk lagi untuk memesan lapangan.',
      confirmLabel: 'Keluar',
    );
    if (confirmed && context.mounted) await AppScope.auth(context).logout();
  }

  @override
  Widget build(BuildContext context) {
    final user = AppScope.auth(context).user;
    final theme = AppScope.theme(context);

    return VenuScreen(
      child: ScrollBody(
        children: [
          Semantics(header: true, child: const VenuText('Akun', variant: TextVariant.h1)),
          if (user == null)
            const SignInPrompt(description: 'Masuk untuk memesan lapangan dan melihat bookingmu.')
          else
            Panel(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  VenuText(user.nama, variant: TextVariant.h2),
                  const SizedBox(height: Space.xs),
                  VenuText(user.email, tone: TextTone.muted),
                  const SizedBox(height: Space.lg),
                  const Hairline(),
                  const SizedBox(height: Space.lg),
                  InfoRow(
                    label: 'Peran',
                    value: VenuText(user.role.label, variant: TextVariant.bodyStrong),
                  ),
                ],
              ),
            ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const VenuText('Tema', variant: TextVariant.label, tone: TextTone.muted),
              const SizedBox(height: Space.sm),
              Segment<ThemePreference>(
                options: const [
                  (ThemePreference.system, 'Perangkat'),
                  (ThemePreference.light, 'Terang'),
                  (ThemePreference.dark, 'Gelap'),
                ],
                value: theme.preference,
                onChanged: theme.choose,
              ),
            ],
          ),
          if (user != null)
            Align(
              alignment: Alignment.centerLeft,
              child: VenuButton(
                label: 'Keluar',
                variant: ButtonVariant.dangerGhost,
                icon: LucideIcons.logOut,
                onPressed: () => _logout(context),
              ),
            ),
          VenuText(
            'Server: $apiUrl',
            variant: TextVariant.small,
            tone: TextTone.muted,
            align: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
