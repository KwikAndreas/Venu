import 'package:flutter/material.dart'
    show MaterialApp, ThemeData, NoSplash, Brightness, ColorScheme, Material, MaterialType;
import 'package:flutter/widgets.dart';

import 'screens/home_shell.dart';
import 'state/app_scope.dart';
import 'theme/tokens.dart';
import 'ui/matrix_splash.dart';

class VenuApp extends StatelessWidget {
  const VenuApp({super.key});

  @override
  Widget build(BuildContext context) => const AppScope(child: _ThemedApp());
}

/// MaterialApp hanya dipakai sebagai kerangka (navigasi, input teks, aksesibilitas).
/// Semua tampilan memakai komponen Venu sendiri; efek riak dan warna Material dimatikan.
class _ThemedApp extends StatelessWidget {
  const _ThemedApp();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return MaterialApp(
      title: 'Venu',
      debugShowCheckedModeBanner: false,
      color: palette.accent,
      // Material transparan: dibutuhkan TextField dan memberi gaya teks dasar (tanpa garis
      // bawah kuning penanda debug), tetapi tidak menggambar apa pun.
      builder: (context, child) => Material(type: MaterialType.transparency, child: child),
      theme: ThemeData(
        fontFamily: fontFamily,
        splashFactory: NoSplash.splashFactory,
        highlightColor: const Color(0x00000000),
        scaffoldBackgroundColor: palette.bg,
        colorScheme: ColorScheme.fromSeed(
          seedColor: palette.accent,
          brightness: context.isDark ? Brightness.dark : Brightness.light,
          surface: palette.bg,
          primary: palette.accent,
        ),
      ),
      home: const _Launch(),
    );
  }
}

/// Splash matrix tampil di atas aplikasi saat dibuka, lalu dilepas setelah animasi selesai
/// dan sesi login selesai diperiksa (agar tidak ada layar kosong sesudahnya).
class _Launch extends StatefulWidget {
  const _Launch();

  @override
  State<_Launch> createState() => _LaunchState();
}

class _LaunchState extends State<_Launch> {
  bool _splashDone = false;

  @override
  Widget build(BuildContext context) {
    final ready = AppScope.auth(context).ready;
    return Stack(
      children: [
        if (ready) const Positioned.fill(child: HomeShell()),
        if (!_splashDone || !ready)
          Positioned.fill(
            child: MatrixSplash(onFinished: () => setState(() => _splashDone = true)),
          ),
      ],
    );
  }
}
