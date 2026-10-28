import { CircleAlert } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Radius, SCREEN_PADDING, Space } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

type FormScreenProps = { subtitle: string; children: ReactNode };

/** Kerangka layar formulir (Masuk/Daftar): tetap terlihat saat keyboard terbuka. */
export function FormScreen({ subtitle, children }: FormScreenProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText tone="muted">{subtitle}</AppText>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Error formulir dari server, dengan ikon agar tidak hanya dibedakan warna. */
export function FormError({ message }: { message?: string }) {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <View
      accessibilityLiveRegion="assertive"
      style={[styles.error, { backgroundColor: colors.dangerSoft }]}
    >
      <CircleAlert size={18} color={colors.danger} />
      <AppText tone="danger" style={styles.flex}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: SCREEN_PADDING, gap: Space.xl },
  error: {
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'center',
    borderRadius: Radius.chip,
    padding: Space.md,
  },
});
