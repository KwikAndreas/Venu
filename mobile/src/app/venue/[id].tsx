import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/auth/auth-context';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState, Skeleton } from '@/components/ui/Feedback';
import { Divider } from '@/components/ui/Layout';
import { DateStrip } from '@/components/venue/DateStrip';
import { RatingSummary } from '@/components/venue/RatingSummary';
import { SlotGrid } from '@/components/venue/SlotGrid';
import { VenuePhoto } from '@/components/venue/VenuePhoto';
import { VenueReviews } from '@/components/venue/VenueReviews';
import { Radius, SCREEN_PADDING, Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { api, toApiError } from '@/lib/api';
import { MAX_BOOKING_HOURS, MAX_DAYS_AHEAD } from '@/lib/booking-rules';
import { notify } from '@/lib/dialog';
import { addDays, formatRupiah, formatShortDate, todayInJakarta } from '@/lib/format';
import type { Booking, Slot, VenueDetail, VenueSlots } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';

/**
 * Pilihan slot selalu berurutan (sama dengan web): ketuk slot di samping pilihan memperpanjang,
 * ketuk ujung memendekkan, ketuk slot lain memulai pilihan baru.
 */
function nextSelection(current: number[], index: number): number[] {
  const first = current[0];
  const last = current.at(-1);
  if (first === undefined || last === undefined) return [index];
  if (index === first && index === last) return [];
  if (index === first) return current.slice(1);
  if (index === last) return current.slice(0, -1);
  if (index === first - 1) return [index, ...current];
  if (index === last + 1) return [...current, index];
  return [index];
}

function validDate(requested: string | undefined, today: string): string {
  return requested && requested >= today && requested <= addDays(today, MAX_DAYS_AHEAD)
    ? requested
    : today;
}

function VenueInfo({ venue }: { venue: VenueDetail }) {
  const { colors } = useTheme();
  return (
    <View style={styles.block}>
      <View style={styles.tight}>
        <AppText variant="h1" accessibilityRole="header">
          {venue.nama}
        </AppText>
        <View style={styles.inline}>
          <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
          <AppText tone="muted">{venue.kota}</AppText>
        </View>
        <AppText variant="small" tone="muted">
          {venue.alamat} · Buka {venue.jam_buka}–{venue.jam_tutup}
        </AppText>
      </View>
      {venue.deskripsi && <AppText>{venue.deskripsi}</AppText>}
      <View style={styles.facilities}>
        {venue.fasilitas.map((item) => (
          <View key={item} style={[styles.facility, { backgroundColor: colors.surface }]}>
            <AppText variant="label">{item}</AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function BookingScreen({ venue, initialDate }: { venue: VenueDetail; initialDate: string }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { reload: reloadActive } = useActiveBookings();
  const [tanggal, setTanggal] = useState(initialDate);
  const [selection, setSelection] = useState<{ tanggal: string; indexes: number[] }>({
    tanggal: initialDate,
    indexes: [],
  });
  const [limitHit, setLimitHit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const slotsState = useApi<VenueSlots>(`/venues/${venue.id}/slots?tanggal=${tanggal}`);

  // Pilihan otomatis kosong saat tanggal berganti.
  const indexes = selection.tanggal === tanggal ? selection.indexes : [];
  const slots = slotsState.data?.slots ?? [];
  const firstSlot = indexes[0] === undefined ? undefined : slots[indexes[0]];
  const lastIndex = indexes.at(-1);
  const lastSlot = lastIndex === undefined ? undefined : slots[lastIndex];
  const hours = indexes.length;
  const isRenter = user?.role === 'penyewa';

  const toggleSlot = (slot: Slot) => {
    const next = nextSelection(indexes, slots.indexOf(slot));
    setLimitHit(next.length > MAX_BOOKING_HOURS);
    if (next.length > MAX_BOOKING_HOURS) return;
    setSelection({ tanggal, indexes: next });
  };

  const book = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!firstSlot || !lastSlot) return;
    setSubmitting(true);
    try {
      const { booking } = await api.post<{ booking: Booking }>('/bookings', {
        venue_id: venue.id,
        tanggal,
        jam_mulai: firstSlot.jam_mulai,
        jam_selesai: lastSlot.jam_selesai,
      });
      reloadActive();
      setSelection({ tanggal, indexes: [] });
      router.push({ pathname: '/booking/[id]', params: { id: booking.id } });
    } catch (caught) {
      const error = toApiError(caught);
      notify('Booking gagal', error.message);
      if (error.status === 409) {
        setSelection({ tanggal, indexes: [] });
        slotsState.reload();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <VenuePhoto fotoUrl={venue.foto_url} nama={venue.nama} sport={venue.jenis_olahraga} />
        <View style={styles.content}>
          <VenueInfo venue={venue} />
          <Divider />

          <View style={styles.block}>
            <View style={styles.tight}>
              <AppText variant="h2" accessibilityRole="header">
                Pilih jadwal
              </AppText>
              <AppText variant="small" tone={limitHit ? 'warning' : 'muted'}>
                {formatRupiah(venue.harga_per_jam)} per jam · maksimal {MAX_BOOKING_HOURS} jam
                berturut-turut
              </AppText>
            </View>
            <View style={styles.bleed}>
              <DateStrip value={tanggal} onChange={setTanggal} />
            </View>
            {slotsState.error ? (
              <ErrorState message={slotsState.error.message} onRetry={slotsState.reload} />
            ) : !slotsState.data ? (
              <Skeleton height={148} />
            ) : (
              <SlotGrid
                slots={slots}
                selected={indexes.flatMap((index) => slots[index]?.jam_mulai ?? [])}
                onToggle={toggleSlot}
              />
            )}
          </View>
          <Divider />

          <VenueReviews venueId={venue.id} />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.raised,
            borderColor: colors.line,
            paddingBottom: insets.bottom + Space.md,
          },
        ]}
      >
        <View style={styles.flex}>
          <AppText variant="small" tone="muted" numberOfLines={1}>
            {firstSlot && lastSlot
              ? `${formatShortDate(tanggal)} · ${firstSlot.jam_mulai}–${lastSlot.jam_selesai}`
              : user && !isRenter
                ? 'Pemesanan khusus akun penyewa'
                : 'Pilih jam main'}
          </AppText>
          <AppText variant="h2" numeric>
            {formatRupiah(hours * venue.harga_per_jam)}
          </AppText>
        </View>
        <Button
          label={user ? 'Pesan sekarang' : 'Masuk untuk memesan'}
          onPress={book}
          loading={submitting}
          disabled={user ? hours === 0 || !isRenter : false}
        />
      </View>
    </View>
  );
}

export default function VenueDetailScreen() {
  const params = useLocalSearchParams<{ id: string; tanggal?: string }>();
  const { data, error, reload } = useApi<{ venue: VenueDetail }>(`/venues/${params.id}`);
  const venue = data?.venue;

  // Nama lapangan sudah jadi judul besar di halaman, jadi header tidak mengulangnya.
  return error ? (
    <ErrorState message={error.message} onRetry={reload} />
  ) : !venue ? (
    <View style={styles.content}>
      <Skeleton radius={Radius.card} style={styles.photoSkeleton} />
      <Skeleton height={28} width="70%" />
      <Skeleton height={16} width="40%" />
    </View>
  ) : (
    <BookingScreen venue={venue} initialDate={validDate(params.tanggal, todayInJakarta())} />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: Space.xxxl },
  content: { padding: SCREEN_PADDING, gap: Space.xxl },
  block: { gap: Space.lg },
  tight: { gap: Space.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  facilities: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  facility: { borderRadius: Radius.pill, paddingHorizontal: Space.md, paddingVertical: Space.xs },
  bleed: { marginHorizontal: -SCREEN_PADDING },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Space.md,
  },
  photoSkeleton: { aspectRatio: 16 / 10 },
});
