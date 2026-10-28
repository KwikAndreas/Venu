import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space } from '@/constants/theme';
import { hasStarted, renterStage } from '@/lib/booking-stage';
import { formatDate, formatRupiah } from '@/lib/format';
import type { BookingSummary } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Layout';
import { StatusBadge } from '../ui/StatusBadge';

export function needsPayment(booking: BookingSummary): boolean {
  return (
    booking.status === 'menunggu' &&
    (booking.payment_status === null || booking.payment_status === 'gagal')
  );
}

/** Bisa dibatalkan selama belum dimulai; backend tetap memeriksa ulang. */
function canCancel(booking: BookingSummary): boolean {
  return ['menunggu', 'dikonfirmasi'].includes(booking.status) && !hasStarted(booking);
}

/** Blok tanggal ala kalender: tanggal besar, bulan kecil. */
function DateBlock({ date }: { date: string }) {
  const { colors } = useTheme();
  const value = new Date(`${date}T00:00:00`);
  return (
    <View style={[styles.dateBlock, { backgroundColor: colors.surface }]}>
      <AppText variant="h2" numeric style={styles.day}>
        {value.getDate()}
      </AppText>
      <AppText variant="small" tone="muted">
        {value.toLocaleDateString('id-ID', { month: 'short' })}
      </AppText>
    </View>
  );
}

type BookingRowProps = { booking: BookingSummary; onCancel: () => void };

export function BookingRow({ booking, onCancel }: BookingRowProps) {
  const showCancel = canCancel(booking);
  const showPay = needsPayment(booking);

  return (
    <Card style={styles.card}>
      <View style={styles.main}>
        <DateBlock date={booking.tanggal} />
        <View style={styles.info}>
          <AppText
            variant="h3"
            numberOfLines={1}
            accessibilityLabel={`${formatDate(booking.tanggal)}, ${booking.venue_nama}`}
          >
            {booking.venue_nama}
          </AppText>
          <AppText variant="small" tone="muted">
            <AppText variant="small" numeric style={styles.time}>
              {booking.jam_mulai}–{booking.jam_selesai}
            </AppText>
            {` · ${booking.venue_kota} · ${formatRupiah(booking.total_harga)}`}
          </AppText>
          <StatusBadge stage={renterStage(booking)} />
        </View>
      </View>
      {(showCancel || showPay) && (
        <View style={styles.actions}>
          {showCancel && (
            <Button label="Batalkan" variant="danger-ghost" size="sm" onPress={onCancel} />
          )}
          {showPay && (
            <Button
              label="Bayar sekarang"
              size="sm"
              onPress={() => router.push({ pathname: '/booking/[id]', params: { id: booking.id } })}
            />
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Space.md },
  main: { flexDirection: 'row', gap: Space.lg },
  dateBlock: {
    width: 56,
    height: 60,
    borderRadius: Radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: { lineHeight: 24 },
  info: { flex: 1, gap: Space.xs },
  time: { fontFamily: Fonts.semibold },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Space.sm },
});
