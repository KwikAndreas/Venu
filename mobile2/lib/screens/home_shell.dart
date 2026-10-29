import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../state/app_scope.dart';
import '../theme/tokens.dart';
import '../ui/primitives.dart';
import 'account_screen.dart';
import 'bookings_screen.dart';
import 'search_screen.dart';

enum HomeTab { search, bookings, account }

/// Tiga tab utama. Tab yang pernah dibuka tetap tersimpan (posisi gulir, filter).
class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  HomeTab _tab = HomeTab.search;

  /// Bertambah tiap kali tab Booking saya dibuka, agar datanya dimuat ulang.
  int _bookingsVisit = 0;

  void _select(HomeTab tab) {
    setState(() {
      _tab = tab;
      if (tab == HomeTab.bookings) _bookingsVisit++;
    });
    if (tab == HomeTab.bookings) AppScope.bookings(context).reload();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: IndexedStack(
            index: _tab.index,
            children: [
              SearchScreen(onOpenBookings: () => _select(HomeTab.bookings)),
              BookingsScreen(visit: _bookingsVisit, onOpenSearch: () => _select(HomeTab.search)),
              const AccountScreen(),
            ],
          ),
        ),
        _BottomBar(current: _tab, onSelect: _select),
      ],
    );
  }
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.current, required this.onSelect});

  final HomeTab current;
  final ValueChanged<HomeTab> onSelect;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final activeCount = AppScope.bookings(context).active.length;
    final items = [
      (HomeTab.search, LucideIcons.search, 'Cari', 0),
      (HomeTab.bookings, LucideIcons.calendarDays, 'Booking saya', activeCount),
      (HomeTab.account, LucideIcons.userRound, 'Akun', 0),
    ];
    return Container(
      decoration: BoxDecoration(
        color: palette.bg,
        border: Border(top: BorderSide(color: palette.line)),
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 64,
          child: Row(
            children: [
              for (final (tab, icon, label, badge) in items)
                Expanded(
                  child: Semantics(
                    selected: tab == current,
                    child: Tappable(
                      onTap: () => onSelect(tab),
                      semanticLabel: badge > 0 ? '$label, $badge aktif' : label,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Icon(
                                icon,
                                size: 22,
                                color: tab == current ? palette.fg : palette.muted,
                              ),
                              if (badge > 0)
                                Positioned(
                                  right: -10,
                                  top: -6,
                                  child: Container(
                                    constraints: const BoxConstraints(minWidth: 18),
                                    height: 18,
                                    padding: const EdgeInsets.symmetric(horizontal: 5),
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(
                                      color: palette.accent,
                                      borderRadius: BorderRadius.circular(Radii.pill),
                                    ),
                                    child: VenuText(
                                      '$badge',
                                      variant: TextVariant.small,
                                      tone: TextTone.onAccent,
                                      weight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: Space.xs),
                          VenuText(
                            label,
                            variant: TextVariant.small,
                            tone: tab == current ? TextTone.fg : TextTone.muted,
                            weight: FontWeight.w600,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
