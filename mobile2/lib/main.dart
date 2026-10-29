import 'package:device_preview/device_preview.dart';
import 'package:flutter/widgets.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'app.dart';
import 'core/config.dart';

Future<void> main() async {
  // Bingkai perangkat dari device_preview hanya aktif bila diminta:
  // flutter run -d chrome --dart-define=DEVICE_PREVIEW=true
  DevicePreview.enable(enabled: useDevicePreview);
  await initializeDateFormatting('id_ID');
  runApp(const VenuApp());
}
