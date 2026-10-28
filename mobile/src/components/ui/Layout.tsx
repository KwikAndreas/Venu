import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Radius, Space } from '@/constants/theme';
import { IS_BEFORE_MODE } from '@/lib/config';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

/** Panel `raised` bergaris tipis untuk mengelompokkan isi. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.card, { backgroundColor: colors.raised, borderColor: colors.line }, style]}
    >
      {children}
    </View>
  );
}

/** Baris label–nilai untuk ringkasan (jadwal, total, dll.). */
export function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <AppText tone="muted">{label}</AppText>
      <View style={styles.infoValue}>{children}</View>
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.line }]} />;
}

/** Pita peringatan saat aplikasi dijalankan dengan EXPO_PUBLIC_SECURITY_MODE=before. */
export function SecurityModeBanner() {
  const { colors } = useTheme();
  if (!IS_BEFORE_MODE) return null;
  return (
    <View style={[styles.banner, { backgroundColor: colors.warningSoft }]}>
      <AppText variant="small" tone="warning" style={styles.bannerText}>
        Mode before: celah keamanan sengaja aktif. Hanya untuk pengujian lokal.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.card, padding: Space.lg },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: Space.lg,
  },
  infoValue: { flexShrink: 1, alignItems: 'flex-end' },
  divider: { height: StyleSheet.hairlineWidth },
  banner: { paddingHorizontal: Space.lg, paddingVertical: Space.sm },
  bannerText: { textAlign: 'center' },
});
