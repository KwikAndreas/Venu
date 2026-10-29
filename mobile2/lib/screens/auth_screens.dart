import 'package:flutter/material.dart' show TextInputAction;
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../core/api_client.dart';
import '../core/config.dart';
import '../state/app_scope.dart';
import '../theme/tokens.dart';
import '../ui/controls.dart';
import '../ui/feedback.dart';
import '../ui/layout.dart';
import '../ui/primitives.dart';

/// Ditampilkan di tab yang butuh akun saat pengguna belum masuk.
class SignInPrompt extends StatelessWidget {
  const SignInPrompt({super.key, required this.description});

  final String description;

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: LucideIcons.logIn,
      title: 'Masuk dulu, yuk',
      description: description,
      action: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          VenuButton(
            label: 'Masuk',
            variant: ButtonVariant.neutral,
            onPressed: () => Navigator.of(context).push(venuRoute(const LoginScreen())),
          ),
          const SizedBox(width: Space.sm),
          VenuButton(
            label: 'Daftar',
            variant: ButtonVariant.secondary,
            onPressed: () => Navigator.of(context).push(venuRoute(const RegisterScreen())),
          ),
        ],
      ),
    );
  }
}

const _genericLoginError = 'Email atau password salah.';

String _loginErrorMessage(ApiException error) {
  final isCredentialError = error.status == 401 || error.status == 404;
  if (!isCredentialError) return error.message;
  // [VULN-A07] Mode before: pesan asli dari API ditampilkan apa adanya, termasuk
  // "Email tidak terdaftar", sehingga keberadaan email terlihat dari aplikasi.
  if (isBeforeMode) return error.message;
  // [FIXED-A07] DESIGN.md §1: pesan generik, tidak membedakan email dan password.
  return _genericLoginError;
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  String? _error;
  bool _submitting = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_email.text.trim().isEmpty || _password.text.isEmpty) return;
    setState(() {
      _error = null;
      _submitting = true;
    });
    try {
      await AppScope.auth(context).login(_email.text.trim().toLowerCase(), _password.text);
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (error) {
      setState(() => _error = _loginErrorMessage(error));
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _FormScreen(
      title: 'Masuk',
      subtitle: 'Masuk untuk memesan lapangan dan melihat bookingmu.',
      children: [
        FormError(message: _error),
        VenuTextField(
          label: 'Email',
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          textInputAction: TextInputAction.next,
        ),
        VenuTextField(
          label: 'Password',
          controller: _password,
          obscure: true,
          autofillHints: const [AutofillHints.password],
          textInputAction: TextInputAction.go,
          onSubmitted: (_) => _submit(),
        ),
        VenuButton(
          label: 'Masuk',
          variant: ButtonVariant.neutral,
          expand: true,
          loading: _submitting,
          onPressed: _submit,
        ),
        VenuButton(
          label: 'Belum punya akun? Daftar',
          variant: ButtonVariant.ghost,
          expand: true,
          onPressed: () => Navigator.of(context).pushReplacement(venuRoute(const RegisterScreen())),
        ),
      ],
    );
  }
}

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nama = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  String? _error;
  bool _submitting = false;

  @override
  void dispose() {
    _nama.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _error = null;
      _submitting = true;
    });
    try {
      await AppScope.auth(context).register(
        nama: _nama.text.trim(),
        email: _email.text.trim().toLowerCase(),
        password: _password.text,
      );
      if (mounted) Navigator.of(context).pop();
    } on ApiException catch (error) {
      setState(() => _error = error.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return _FormScreen(
      title: 'Daftar',
      subtitle: 'Buat akun penyewa untuk mulai memesan lapangan.',
      children: [
        FormError(message: _error),
        VenuTextField(
          label: 'Nama lengkap',
          controller: _nama,
          autofillHints: const [AutofillHints.name],
          textInputAction: TextInputAction.next,
        ),
        VenuTextField(
          label: 'Email',
          controller: _email,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          textInputAction: TextInputAction.next,
        ),
        VenuTextField(
          label: 'Password',
          controller: _password,
          obscure: true,
          hint: 'Minimal 8 karakter, huruf dan angka',
          autofillHints: const [AutofillHints.newPassword],
          textInputAction: TextInputAction.go,
          onSubmitted: (_) => _submit(),
        ),
        VenuButton(
          label: 'Daftar',
          variant: ButtonVariant.neutral,
          expand: true,
          loading: _submitting,
          onPressed: _submit,
        ),
        VenuButton(
          label: 'Sudah punya akun? Masuk',
          variant: ButtonVariant.ghost,
          expand: true,
          onPressed: () => Navigator.of(context).pushReplacement(venuRoute(const LoginScreen())),
        ),
      ],
    );
  }
}

class _FormScreen extends StatelessWidget {
  const _FormScreen({required this.title, required this.subtitle, required this.children});

  final String title;
  final String subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return VenuScreen(
      title: title,
      showBack: true,
      child: AutofillGroup(
        child: ScrollBody(
          gap: Space.xl,
          children: [
            VenuText(subtitle, tone: TextTone.muted),
            ...children,
          ],
        ),
      ),
    );
  }
}
