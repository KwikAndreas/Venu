import 'package:flutter/foundation.dart';

const _apiPort = 4000;

/// Alamat backend, diisi lewat `--dart-define=API_URL=http://192.168.x.x:4000`.
/// Tanpa nilai: web memakai localhost, emulator Android memakai 10.0.2.2 (alamat laptop).
String _defaultApiUrl() {
  if (kIsWeb) return 'http://localhost:$_apiPort';
  if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:$_apiPort';
  return 'http://localhost:$_apiPort';
}

final String apiUrl = () {
  const fromEnv = String.fromEnvironment('API_URL');
  final url = fromEnv.isEmpty ? _defaultApiUrl() : fromEnv;
  return url.replaceAll(RegExp(r'/+$'), '');
}();

/// Samakan dengan SECURITY_MODE backend: `--dart-define=SECURITY_MODE=before`.
const bool isBeforeMode = String.fromEnvironment('SECURITY_MODE') == 'before';

/// Bingkai perangkat dari paket device_preview: `--dart-define=DEVICE_PREVIEW=true`.
const bool useDevicePreview = bool.fromEnvironment('DEVICE_PREVIEW');

/// Foto lokal dari backend ("/uploads/...") diubah menjadi URL lengkap.
String assetUrl(String path) => path.startsWith('/') ? '$apiUrl$path' : path;
