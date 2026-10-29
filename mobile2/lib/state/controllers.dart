import 'package:flutter/foundation.dart';

import '../core/api_client.dart';
import '../core/booking_rules.dart';
import '../core/models.dart';
import '../core/storage.dart';

enum ThemePreference { system, light, dark }

/// Tema ikut perangkat sampai pengguna memilih sendiri (disimpan di perangkat).
class ThemeController extends ChangeNotifier {
  static const _key = 'venu.theme';

  ThemePreference preference = ThemePreference.system;

  Future<void> load() async {
    final saved = await AppStorage.read(_key);
    preference = ThemePreference.values.asNameMap()[saved] ?? ThemePreference.system;
    notifyListeners();
  }

  void choose(ThemePreference next) {
    preference = next;
    notifyListeners();
    AppStorage.write(_key, next.name);
  }
}

class AuthController extends ChangeNotifier {
  User? user;

  /// false selama token tersimpan masih diperiksa ke server.
  bool ready = false;

  Future<void> restore() async {
    ApiClient.onUnauthorized = _clear;
    final token = await ApiClient.loadToken();
    if (token != null) {
      try {
        user = User.fromJson((await ApiClient.get('/me'))['user'] as Map<String, dynamic>);
      } on ApiException {
        await ApiClient.clearToken();
      }
    }
    ready = true;
    notifyListeners();
  }

  Future<User> login(String email, String password) async {
    final result = await ApiClient.post('/auth/login', {'email': email, 'password': password});
    await ApiClient.saveToken(result['token'] as String);
    user = User.fromJson(result['user'] as Map<String, dynamic>);
    notifyListeners();
    return user!;
  }

  /// Aplikasi mobile ditujukan untuk penyewa, jadi pendaftaran selalu sebagai penyewa.
  Future<User> register({
    required String nama,
    required String email,
    required String password,
  }) async {
    await ApiClient.post('/auth/register', {
      'nama': nama,
      'email': email,
      'password': password,
      'role': Role.penyewa.name,
    });
    return login(email, password);
  }

  Future<void> logout() async {
    try {
      await ApiClient.post('/auth/logout');
    } on ApiException {
      // Token tetap dihapus dari perangkat walau server tidak terjangkau.
    }
    _clear();
  }

  void _clear() {
    ApiClient.clearToken();
    user = null;
    ready = true;
    notifyListeners();
  }
}

/// Satu sumber data booking aktif untuk angka di tab dan strip status di layar Cari.
class ActiveBookingsController extends ChangeNotifier {
  ActiveBookingsController(this._auth) {
    _auth.addListener(_onAuthChanged);
  }

  final AuthController _auth;
  int? _userId;
  List<BookingSummary> active = const [];

  void _onAuthChanged() {
    final userId = _auth.user?.role == Role.penyewa ? _auth.user!.id : null;
    if (userId == _userId) return;
    _userId = userId;
    active = const [];
    notifyListeners();
    reload();
  }

  Future<void> reload() async {
    if (_userId == null) return;
    try {
      final data = await ApiClient.get('/bookings/mine');
      active =
          (data['bookings'] as List)
              .map((json) => BookingSummary.fromJson(json as Map<String, dynamic>))
              .where(isActiveBooking)
              .toList()
            ..sort(byStartTime);
      notifyListeners();
    } on ApiException {
      // Strip status bersifat pelengkap; kegagalan cukup membuatnya tidak tampil.
    }
  }

  @override
  void dispose() {
    _auth.removeListener(_onAuthChanged);
    super.dispose();
  }
}
