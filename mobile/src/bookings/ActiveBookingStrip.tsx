import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space } from '@/constants/theme';
import { AppText } from '@/components/ui/AppText';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { renterStage } from '@/lib/booking-stage';
import { formatShortDate } from '@/lib/format';
import { useTheme } from '@/theme/theme-context';
import { useActiveBookings } from './active-bookings-context';

/**
 * Status booking terdekat, tampil paling atas di layar Cari tanpa perlu scroll.
 * Status yang ditampilkan selalu milik booking yang disebut namanya; booking lain cukup dihitung.
 */
export function ActiveBookingStrip() {
  const { colors } = useTheme();
  const { active } = useActiveBookings();
  const nearest = active[0];
  if (!nearest) return null;

  const others = active.length - 1;
  const needsPayment = nearest.status === 'menunggu' && nearest.payment_status !== 'menunggu';
  const goesToPayment = others === 0 && needsPayment;
  const action = others > 0 ? 'Lihat semua' : needsPayment ? 'Bayar sekarang' : 'Lihat detail';

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() =>
        goesToPayment
          ? router.push({ pathname: '/booking/[id]', params: { id: nearest.id } })
          : router.navigate('/bookings')
      }
      style={({ pressed }) => [
        styles.strip,
        { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && styles.pressed,
      ]}
    >
      <StatusBadge stage={renterStage(nearest)} />
      <AppText variant="small" tone="muted" numberOfLines={2}>
        <AppText variant="small" style={styles.strong}>
          {nearest.venue_nama}
        </AppText>
        {` · ${formatShortDate(nearest.tanggal)} · ${nearest.jam_mulai}–${nearest.jam_selesai}`}
        {others > 0 && (
          <AppText variant="small" style={styles.strong}>{` · +${others} booking lain`}</AppText>
        )}
      </AppText>
      <View style={styles.action}>
        <AppText variant="label" tone="accent" style={styles.strong}>
          {action}
        </AppText>
        <ArrowRight size={16} color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  strip: {
    borderWidth: 1,
    borderRadius: Radius.card,
    padding: Space.md,
    gap: Space.sm,
  },
  pressed: { opacity: 0.85 },
  strong: { fontFamily: Fonts.bold },
  action: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
});
