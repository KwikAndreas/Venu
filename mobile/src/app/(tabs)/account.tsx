import { LogOut } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-context';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Segment } from '@/components/ui/Choice';
import { Card, Divider, InfoRow, SecurityModeBanner } from '@/components/ui/Layout';
import { SignInPrompt } from '@/components/ui/SignInPrompt';
import { SCREEN_PADDING, Space } from '@/constants/theme';
import { API_URL } from '@/lib/config';
import { confirmAction } from '@/lib/dialog';
import { ROLE_LABELS } from '@/lib/format';
import { useTheme, type ThemePreference } from '@/theme/theme-context';

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Perangkat' },
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
];

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { preference, setPreference } = useTheme();

  const confirmLogout = async () => {
    const confirmed = await confirmAction({
      title: 'Keluar dari akun?',
      message: 'Kamu perlu masuk lagi untuk memesan lapangan.',
      confirmLabel: 'Keluar',
    });
    if (confirmed) await logout();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SecurityModeBanner />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h1" accessibilityRole="header">
          Akun
        </AppText>

        {user ? (
          <Card style={styles.card}>
            <View style={styles.identity}>
              <AppText variant="h2">{user.nama}</AppText>
              <AppText tone="muted">{user.email}</AppText>
            </View>
            <Divider />
            <InfoRow label="Peran">
              <AppText variant="bodyStrong">{ROLE_LABELS[user.role]}</AppText>
            </InfoRow>
          </Card>
        ) : (
          <SignInPrompt description="Masuk untuk memesan lapangan dan melihat bookingmu." />
        )}

        <View style={styles.section}>
          <AppText variant="label" tone="muted">
            Tema
          </AppText>
          <Segment options={THEME_OPTIONS} value={preference} onChange={setPreference} />
        </View>

        {user && (
          <Button
            label="Keluar"
            variant="danger-ghost"
            icon={LogOut}
            onPress={confirmLogout}
            style={styles.logout}
          />
        )}

        <AppText variant="small" tone="muted" style={styles.server}>
          Server: {API_URL}
        </AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Space.lg,
    paddingBottom: Space.xxxl,
    gap: Space.xxl,
  },
  card: { gap: Space.lg },
  identity: { gap: Space.xs },
  section: { gap: Space.sm },
  logout: { alignSelf: 'flex-start' },
  server: { textAlign: 'center' },
});
