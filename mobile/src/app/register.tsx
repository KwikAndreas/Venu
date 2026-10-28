import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth, type RegisterInput } from '@/auth/auth-context';
import { Button } from '@/components/ui/Button';
import { FormError, FormScreen } from '@/components/ui/FormScreen';
import { TextField } from '@/components/ui/TextField';
import { Space } from '@/constants/theme';
import { toApiError } from '@/lib/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterInput>({ nama: '', email: '', password: '' });
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof RegisterInput) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    setError(undefined);
    setSubmitting(true);
    try {
      await register({
        ...form,
        nama: form.nama.trim(),
        email: form.email.trim().toLowerCase(),
      });
      router.back();
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormScreen subtitle="Buat akun penyewa untuk mulai memesan lapangan.">
      <FormError message={error} />
      <TextField
        label="Nama lengkap"
        value={form.nama}
        onChangeText={update('nama')}
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
      />
      <TextField
        label="Email"
        value={form.email}
        onChangeText={update('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
      />
      <TextField
        label="Password"
        value={form.password}
        onChangeText={update('password')}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder="Minimal 8 karakter, huruf dan angka"
        returnKeyType="go"
        onSubmitEditing={submit}
      />
      <View style={styles.actions}>
        <Button
          label="Daftar"
          variant="neutral"
          onPress={submit}
          loading={submitting}
          disabled={!form.nama || !form.email || !form.password}
        />
        <Button
          label="Sudah punya akun? Masuk"
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: Space.sm },
});
