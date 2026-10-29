import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Fonts, Space } from '@/constants/theme';
import { ownerStage } from '@/lib/booking-stage';
import { formatDate, formatRupiah } from '@/lib/format';
import type { OwnerBooking } from '@/lib/types';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Card } from '../ui/Layout';
import { StatusBadge } from '../ui/StatusBadge';
import { DateBlock } from './BookingRow';

type OwnerBookingRowProps = {
  booking: OwnerBooking;
  processing: boolean;
  onConfirm: () => void;
  onReject: () => void;
};

/** Booking masuk bagi pemilik: aksi hanya muncul bila memang bisa dilakukan (DESIGN.md §1). */
export function OwnerBookingRow({
  booking,
  processing,
  onConfirm,
  onReject,
}: OwnerBookingRowProps) {
  const paymentId = booking.ada_bukti ? booking.payment_id : null;
  const pending = booking.status === 'menunggu';
  // Backend hanya mengizinkan konfirmasi setelah bukti bayar terkirim.
  const canConfirm = pending && booking.payment_status === 'menunggu';

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
          <AppText variant="small" tone="muted" numberOfLines={1}>
            <AppText variant="small" numeric style={styles.time}>
              {booking.jam_mulai}–{booking.jam_selesai}
            </AppText>
            {` · ${booking.penyewa_nama} · ${formatRupiah(booking.total_harga)}`}
          </AppText>
          <StatusBadge stage={ownerStage(booking)} />
        </View>
      </View>
      {(paymentId !== null || pending) && (
        <View style={styles.actions}>
          {pending && (
            <Button
              label="Tolak"
              variant="danger-ghost"
              size="sm"
              disabled={processing}
              onPress={onReject}
            />
          )}
          {paymentId !== null && (
            <Button
              label="Lihat bukti"
              variant="secondary"
              size="sm"
              onPress={() => router.push({ pathname: '/payment/[id]', params: { id: paymentId } })}
            />
          )}
          {canConfirm && (
            <Button label="Konfirmasi" size="sm" loading={processing} onPress={onConfirm} />
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: Space.md },
  main: { flexDirection: 'row', gap: Space.lg },
  info: { flex: 1, gap: Space.xs },
  time: { fontFamily: Fonts.semibold },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Space.sm },
});
