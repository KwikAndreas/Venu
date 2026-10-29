import { router, useFocusEffect } from 'expo-router';
import { CalendarX2, Inbox } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-context';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { BookingRow } from '@/components/booking/BookingRow';
import { OwnerBookingRow } from '@/components/booking/OwnerBookingRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Segment } from '@/components/ui/Choice';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/Feedback';
import { SecurityModeBanner } from '@/components/ui/Layout';
import { SignInPrompt } from '@/components/ui/SignInPrompt';
import { SCREEN_PADDING, Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, toApiError } from '@/lib/api';
import { isActiveBooking } from '@/lib/booking-stage';
import { confirmAction, notify } from '@/lib/dialog';
import { bookingsTabTitle, formatDate, formatRupiah } from '@/lib/format';
import type { BookingStatus, BookingSummary, OwnerBooking } from '@/lib/types';

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

type OwnerFilter = Extract<BookingStatus, 'menunggu' | 'dikonfirmasi'> | 'semua';

const OWNER_FILTERS: { value: OwnerFilter; label: string }[] = [
  { value: 'menunggu', label: 'Perlu diproses' },
  { value: 'dikonfirmasi', label: 'Terkonfirmasi' },
  { value: 'semua', label: 'Semua' },
];

const OWNER_EMPTY: Record<OwnerFilter, string> = {
  menunggu: 'Booking yang menunggu pembayaran atau konfirmasimu akan muncul di sini.',
  dikonfirmasi: 'Booking yang sudah kamu konfirmasi akan muncul di sini.',
  semua: 'Booking dari penyewa akan muncul di sini.',
};

/** Booking masuk untuk pemilik (versi ringkas tab "Booking masuk" di dashboard web). */
function OwnerBookings({ userId }: { userId: number }) {
  const { reload: reloadBadge } = useActiveBookings();
  const [filter, setFilter] = useState<OwnerFilter>('menunggu');
  const [processingId, setProcessingId] = useState<number>();
  const query = filter === 'semua' ? '' : `?status=${filter}`;
  const { data, error, reload } = useApi<{ bookings: OwnerBooking[] }>(
    `/owner/bookings${query}`,
    `user:${userId}`,
  );

  // Penyewa bisa mengirim bukti atau membatalkan kapan saja, jadi muat ulang saat dibuka.
  useFocusEffect(
    useCallback(() => {
      reload();
      reloadBadge();
    }, [reload, reloadBadge]),
  );

  const run = async (booking: OwnerBooking, kind: 'confirm' | 'reject') => {
    const confirmed = await confirmAction(
      kind === 'confirm'
        ? {
            title: 'Konfirmasi booking?',
            message: `Pastikan bukti bayar ${booking.penyewa_nama} sudah sesuai. Pembayaran sebesar ${formatRupiah(booking.total_harga)} akan ditandai lunas.`,
            confirmLabel: 'Konfirmasi',
            destructive: false,
          }
        : {
            title: 'Tolak booking?',
            message: `Booking ${booking.penyewa_nama} pada ${formatDate(booking.tanggal)} pukul ${booking.jam_mulai} akan ditolak.`,
            confirmLabel: 'Tolak booking',
          },
    );
    if (!confirmed) return;
    setProcessingId(booking.id);
    try {
      await api.post(`/owner/bookings/${booking.id}/${kind}`);
      reload();
      reloadBadge();
    } catch (caught) {
      notify(
        kind === 'confirm' ? 'Gagal mengonfirmasi' : 'Gagal menolak',
        toApiError(caught).message,
      );
    } finally {
      setProcessingId(undefined);
    }
  };

  let list;
  if (error) {
    list = <ErrorState message={error.message} onRetry={reload} />;
  } else if (!data) {
    list = Array.from({ length: 3 }, (_, index) => <Skeleton key={index} height={140} />);
  } else if (data.bookings.length === 0) {
    list = <EmptyState icon={Inbox} title="Tidak ada booking" description={OWNER_EMPTY[filter]} />;
  } else {
    list = data.bookings.map((booking) => (
      <OwnerBookingRow
        key={booking.id}
        booking={booking}
        processing={processingId === booking.id}
        onConfirm={() => void run(booking, 'confirm')}
        onReject={() => void run(booking, 'reject')}
      />
    ));
  }

  return (
    <View style={styles.section}>
      <Segment options={OWNER_FILTERS} value={filter} onChange={setFilter} />
      {list}
    </View>
  );
}

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  let content;
  if (!user) {
    content = <SignInPrompt description="Booking yang kamu pesan akan muncul di sini." />;
  } else if (user.role === 'pemilik') {
    content = <OwnerBookings userId={user.id} />;
  } else if (user.role === 'admin') {
    content = (
      <EmptyState
        icon={CalendarX2}
        title="Khusus penyewa dan pemilik"
        description="Kelola pengguna dan lapangan lewat panel admin di versi web."
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
          {bookingsTabTitle(user?.role)}
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
