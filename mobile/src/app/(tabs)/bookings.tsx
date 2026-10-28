import { router, useFocusEffect } from 'expo-router';
import { CalendarX2 } from 'lucide-react-native';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-context';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { BookingRow } from '@/components/booking/BookingRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { SecurityModeBanner } from '@/components/ui/Layout';
import { SignInPrompt } from '@/components/ui/SignInPrompt';
import { SCREEN_PADDING, Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, toApiError } from '@/lib/api';
import { isActiveBooking } from '@/lib/booking-stage';
import { confirmAction, notify } from '@/lib/dialog';
import { formatDate } from '@/lib/format';
import type { BookingSummary } from '@/lib/types';

function byStartTime(a: BookingSummary, b: BookingSummary): number {
  return `${a.tanggal}${a.jam_mulai}`.localeCompare(`${b.tanggal}${b.jam_mulai}`);
}

type SectionProps = {
  title: string;
  bookings: BookingSummary[];
  onCancel: (booking: BookingSummary) => void;
};

function BookingSection({ title, bookings, onCancel }: SectionProps) {
  if (bookings.length === 0) return null;
  return (
    <View style={styles.section}>
      <AppText variant="h3" accessibilityRole="header">
        {title}
      </AppText>
      {bookings.map((booking) => (
        <BookingRow key={booking.id} booking={booking} onCancel={() => onCancel(booking)} />
      ))}
    </View>
  );
}

function RenterBookings({ userId }: { userId: number }) {
  const { reload: reloadActive } = useActiveBookings();
  const { data, error, reload } = useApi<{ bookings: BookingSummary[] }>(
    '/bookings/mine',
    `user:${userId}`,
  );

  // Status bisa berubah di luar layar ini (pemilik mengonfirmasi), jadi muat ulang saat dibuka.
  useFocusEffect(
    useCallback(() => {
      reload();
      reloadActive();
    }, [reload, reloadActive]),
  );

  const cancel = async (booking: BookingSummary) => {
    const confirmed = await confirmAction({
      title: 'Batalkan booking ini?',
      message: `${booking.venue_nama}, ${formatDate(booking.tanggal)} pukul ${booking.jam_mulai}. Bukti bayar yang belum diverifikasi ikut dibatalkan.`,
      confirmLabel: 'Ya, batalkan',
    });
    if (!confirmed) return;
    try {
      await api.post(`/bookings/${booking.id}/cancel`);
      reload();
      reloadActive();
    } catch (caught) {
      notify('Gagal membatalkan', toApiError(caught).message);
    }
  };

  if (error) return <ErrorState message={error.message} onRetry={reload} />;
  if (!data) {
    return (
      <View style={styles.section}>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} height={120} />
        ))}
      </View>
    );
  }
  if (data.bookings.length === 0) {
    return (
      <EmptyState
        icon={CalendarX2}
        title="Belum ada booking"
        description="Lapangan yang kamu pesan akan muncul di sini."
        action={<Button label="Cari lapangan" onPress={() => router.navigate('/')} />}
      />
    );
  }

  const upcoming = data.bookings.filter((booking) => isActiveBooking(booking)).sort(byStartTime);
  const past = data.bookings.filter((booking) => !isActiveBooking(booking));

  return (
    <>
      <BookingSection title="Mendatang" bookings={upcoming} onCancel={cancel} />
      <BookingSection title="Selesai & dibatalkan" bookings={past} onCancel={cancel} />
    </>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  let content;
  if (!user) {
    content = <SignInPrompt description="Booking yang kamu pesan akan muncul di sini." />;
  } else if (user.role !== 'penyewa') {
    content = (
      <EmptyState
        icon={CalendarX2}
        title="Khusus akun penyewa"
        description="Kelola booking masuk lewat dashboard pemilik di versi web."
      />
    );
  } else {
    content = <RenterBookings userId={user.id} />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SecurityModeBanner />
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="h1" accessibilityRole="header">
          Booking saya
        </AppText>
        {content}
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
  section: { gap: Space.md },
});
