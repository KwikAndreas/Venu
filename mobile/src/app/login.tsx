import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { FormError, FormScreen } from '@/components/ui/FormScreen';
import { TextField } from '@/components/ui/TextField';
import { Space } from '@/constants/theme';
import { toApiError, type ApiError } from '@/lib/api';
import { IS_BEFORE_MODE } from '@/lib/config';

const GENERIC_LOGIN_ERROR = 'Email atau password salah.';

function loginErrorMessage(error: ApiError): string {
  const isCredentialError = error.status === 401 || error.status === 404;
  if (!isCredentialError) return error.message;
  // [VULN-A07] Mode before: pesan asli dari API ditampilkan apa adanya, termasuk
  // "Email tidak terdaftar", sehingga keberadaan email terlihat dari aplikasi.
  if (IS_BEFORE_MODE) return error.message;
  // [FIXED-A07] DESIGN.md §1: pesan generik, tidak membedakan email dan password.
  return GENERIC_LOGIN_ERROR;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setError(undefined);
    setSubmitting(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.back();
    } catch (caught) {
      setError(loginErrorMessage(toApiError(caught)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen subtitle="Masuk untuk memesan lapangan dan melihat bookingmu.">
      <FormError message={error} />
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <View style={styles.actions}>
        <Button
          label="Masuk"
          variant="neutral"
          onPress={submit}
          loading={submitting}
          disabled={!email || !password}
        />
        <Button
          label="Belum punya akun? Daftar"
          variant="ghost"
          onPress={() => router.replace('/register')}
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: Space.sm },
});
