import 'package:flutter/widgets.dart';

import '../theme/tokens.dart';
import 'controllers.dart';

/// Menyediakan controller dan palet warna aktif untuk seluruh pohon widget.
/// Setiap perubahan controller membuat widget yang membaca AppScope dibangun ulang.
class AppScope extends StatefulWidget {
  const AppScope({super.key, required this.child});

  final Widget child;

  static _AppScopeData _of(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<_AppScopeData>()!;

  static AuthController auth(BuildContext context) => _of(context).state.auth;

  static ThemeController theme(BuildContext context) => _of(context).state.theme;

  static ActiveBookingsController bookings(BuildContext context) => _of(context).state.bookings;

  @override
  State<AppScope> createState() => _AppScopeState();
}

class _AppScopeState extends State<AppScope> {
  final theme = ThemeController();
  final auth = AuthController();
  late final bookings = ActiveBookingsController(auth);
  late final Listenable _all = Listenable.merge([theme, auth, bookings]);
  int _version = 0;

  @override
  void initState() {
    super.initState();
    _all.addListener(_changed);
    theme.load();
    auth.restore();
  }

  void _changed() => setState(() => _version++);

  @override
  void dispose() {
    _all.removeListener(_changed);
    bookings.dispose();
    auth.dispose();
    theme.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) =>
      _AppScopeData(state: this, version: _version, child: widget.child);
}

class _AppScopeData extends InheritedWidget {
  const _AppScopeData({required this.state, required this.version, required super.child});

  final _AppScopeState state;
  final int version;

  @override
  bool updateShouldNotify(_AppScopeData oldWidget) => version != oldWidget.version;
}

extension VenuContext on BuildContext {
  /// Palet warna sesuai pilihan tema (atau tema perangkat).
  VenuPalette get palette {
    final preference = AppScope.theme(this).preference;
    final dark = switch (preference) {
      ThemePreference.light => false,
      ThemePreference.dark => true,
      ThemePreference.system => MediaQuery.platformBrightnessOf(this) == Brightness.dark,
    };
    return dark ? VenuPalette.dark : VenuPalette.light;
  }

  bool get isDark => palette == VenuPalette.dark;
}
