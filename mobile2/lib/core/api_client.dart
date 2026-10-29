import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'config.dart';
import 'storage.dart';

class ApiException implements Exception {
  const ApiException(this.status, this.message);

  final int status;
  final String message;

  @override
  String toString() => message;
}

/// Klien HTTP untuk backend Venu (versi Flutter dari web/src/lib/api.ts).
class ApiClient {
  ApiClient._();

  static const _tokenKey = 'venu.token';
  static const _timeout = Duration(seconds: 15);
  static const _genericError = 'Terjadi kesalahan. Silakan coba lagi.';

  /// Token disalin ke memori agar setiap request tidak perlu membaca storage lagi.
  static String? _token;

  /// Dipanggil saat API menjawab 401 untuk request bertoken (token tidak valid/kedaluwarsa).
  static void Function()? onUnauthorized;

  static Future<String?> loadToken() async => _token = await AppStorage.read(_tokenKey);

  static Future<void> saveToken(String token) async {
    _token = token;
    await AppStorage.write(_tokenKey, token);
  }

  static Future<void> clearToken() async {
    _token = null;
    await AppStorage.delete(_tokenKey);
  }

  static Map<String, String> _headers({bool json = false}) => {
    'Accept': 'application/json',
    if (json) 'Content-Type': 'application/json',
    if (_token != null) 'Authorization': 'Bearer $_token',
  };

  static Future<Map<String, dynamic>> get(String path) =>
      _send(() => http.get(Uri.parse('$apiUrl$path'), headers: _headers()));

  static Future<Map<String, dynamic>> post(String path, [Map<String, Object?>? body]) => _send(
    () => http.post(
      Uri.parse('$apiUrl$path'),
      headers: _headers(json: true),
      body: body == null ? null : jsonEncode(body),
    ),
  );

  /// multipart/form-data: field teks + satu file.
  static Future<Map<String, dynamic>> upload(
    String path, {
    required Map<String, String> fields,
    required String fileField,
    required List<int> bytes,
    required String filename,
  }) {
    return _send(() async {
      final request = http.MultipartRequest('POST', Uri.parse('$apiUrl$path'))
        ..headers.addAll(_headers())
        ..fields.addAll(fields)
        ..files.add(http.MultipartFile.fromBytes(fileField, bytes, filename: filename));
      return http.Response.fromStream(await request.send());
    });
  }

  static Future<Map<String, dynamic>> _send(Future<http.Response> Function() call) async {
    final hadToken = _token != null;
    http.Response response;
    try {
      response = await call().timeout(_timeout);
    } on Exception {
      throw ApiException(0, 'Tidak dapat terhubung ke server ($apiUrl).');
    }

    final data = _decode(response.body);
    if (response.statusCode >= 400) {
      if (response.statusCode == 401 && hadToken) onUnauthorized?.call();
      // Hanya pesan yang ditampilkan; detail lain dari server (mis. stack trace) diabaikan.
      final message = data['message'];
      throw ApiException(response.statusCode, message is String ? message : _genericError);
    }
    return data;
  }

  static Map<String, dynamic> _decode(String body) {
    if (body.isEmpty) return {};
    try {
      final decoded = jsonDecode(body);
      return decoded is Map<String, dynamic> ? decoded : {};
    } on FormatException {
      return {};
    }
  }
}

ApiException toApiException(Object error) =>
    error is ApiException ? error : const ApiException(0, ApiClient._genericError);
