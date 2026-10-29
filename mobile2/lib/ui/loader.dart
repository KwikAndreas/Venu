import 'package:flutter/widgets.dart';

import '../core/api_client.dart';
import 'feedback.dart';

/// Memuat data dari API lalu membangun tampilan sesuai keadaannya (memuat / error / berhasil).
/// Data dimuat ulang otomatis saat [requestKey] berubah (mis. tanggal atau filter berganti);
/// data lama tetap ditampilkan sampai data baru tiba.
class ApiLoader<T> extends StatefulWidget {
  const ApiLoader({
    super.key,
    required this.requestKey,
    required this.load,
    required this.builder,
    required this.placeholder,
  });

  final Object requestKey;
  final Future<T> Function() load;
  final Widget Function(BuildContext context, T data, VoidCallback reload) builder;
  final Widget placeholder;

  @override
  State<ApiLoader<T>> createState() => ApiLoaderState<T>();
}

class ApiLoaderState<T> extends State<ApiLoader<T>> {
  T? _data;
  ApiException? _error;
  int _request = 0;

  @override
  void initState() {
    super.initState();
    reload();
  }

  @override
  void didUpdateWidget(ApiLoader<T> oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.requestKey != widget.requestKey) reload();
  }

  /// Hanya jawaban dari request terakhir yang dipakai (jawaban lama yang telat diabaikan).
  Future<void> reload() async {
    final request = ++_request;
    try {
      final data = await widget.load();
      if (mounted && request == _request) {
        setState(() {
          _data = data;
          _error = null;
        });
      }
    } catch (error) {
      if (mounted && request == _request) setState(() => _error = toApiException(error));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_error != null && _data == null) {
      return ErrorState(message: _error!.message, onRetry: reload);
    }
    final data = _data;
    if (data == null) return widget.placeholder;
    return widget.builder(context, data, reload);
  }
}
