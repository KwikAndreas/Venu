import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Penyimpanan kunci-nilai di perangkat. Android memakai Keystore (terenkripsi), sehingga
/// token login tidak tersimpan sebagai teks biasa.
class AppStorage {
  AppStorage._();

  static const _store = FlutterSecureStorage();

  static Future<String?> read(String key) => _store.read(key: key);

  static Future<void> write(String key, String value) => _store.write(key: key, value: value);

  static Future<void> delete(String key) => _store.delete(key: key);
}
