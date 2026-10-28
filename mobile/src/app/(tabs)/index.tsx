import { Search, SearchX } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveBookingStrip } from '@/bookings/ActiveBookingStrip';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { AppText } from '@/components/ui/AppText';
import { Pill, Segment } from '@/components/ui/Choice';
import { EmptyState, ErrorState } from '@/components/ui/Feedback';
import { SecurityModeBanner } from '@/components/ui/Layout';
import { DateStrip } from '@/components/venue/DateStrip';
import { VenueCard, VenueCardSkeleton } from '@/components/venue/VenueCard';
import { Fonts, Radius, SCREEN_PADDING, Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { decisionBadges } from '@/lib/decision-badges';
import { addDays, formatShortDate, SPORT_LABELS, SPORTS, todayInJakarta } from '@/lib/format';
import type { Sport, Venue } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';

const SEARCH_DELAY_MS = 300;
const SPORT_OPTIONS: { value: Sport | ''; label: string }[] = [
  { value: '', label: 'Semua' },
  ...SPORTS.map((sport) => ({ value: sport, label: SPORT_LABELS[sport] })),
];

function headline(tanggal: string, today: string): string {
  if (tanggal === today) return 'Main di mana hari ini?';
  if (tanggal === addDays(today, 1)) return 'Main di mana besok?';
  const date = new Date(`${tanggal}T00:00:00`);
  if (tanggal <= addDays(today, 6)) {
    return `Main di mana ${date.toLocaleDateString('id-ID', { weekday: 'long' })} ini?`;
  }
  return `Main di mana ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}?`;
}

/** Kata kunci baru dipakai setelah pengguna berhenti mengetik sebentar. */
function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchInput({ value, onChange }: { value: string; onChange: (text: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.search, { backgroundColor: colors.raised, borderColor: colors.line }]}>
      <Search size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Cari nama lapangan"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Cari nama lapangan"
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.searchInput, { color: colors.fg }]}
      />
    </View>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const activeBookings = useActiveBookings();
  const today = todayInJakarta();
  const [tanggal, setTanggal] = useState(today);
  const [jenis, setJenis] = useState<Sport | ''>('');
  const [lokasi, setLokasi] = useState('');
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim(), SEARCH_DELAY_MS);

  const apiQuery = new URLSearchParams(
    Object.entries({ jenis, lokasi, q, tanggal }).filter(([, value]) => value),
  ).toString();
  const { data, error, loading, reload } = useApi<{ venues: Venue[] }>(`/venues?${apiQuery}`);
  const allVenues = useApi<{ venues: Venue[] }>('/venues');

  const cities = useMemo(
    () => [...new Set((allVenues.data?.venues ?? []).map((venue) => venue.kota))].sort(),
    [allVenues.data],
  );
  const venues = data?.venues;
  const badges = useMemo(() => decisionBadges(venues ?? []), [venues]);

  const refresh = () => {
    reload();
    activeBookings.reload();
  };

  const summary = venues
    ? `${venues.length} lapangan${jenis ? ` ${SPORT_LABELS[jenis].toLowerCase()}` : ''} · ${formatShortDate(tanggal)}`
    : 'Mencari lapangan…';

  const header = (
    <View style={styles.header}>
      <ActiveBookingStrip />
      <View style={styles.titleBlock}>
        <AppText variant="display" accessibilityRole="header">
          {headline(tanggal, today)}
        </AppText>
        <AppText tone="muted" accessibilityLiveRegion="polite">
          {summary}
        </AppText>
      </View>
      <SearchInput value={query} onChange={setQuery} />
      <Segment options={SPORT_OPTIONS} value={jenis} onChange={setJenis} />
      <View style={styles.bleed}>
        <DateStrip value={tanggal} onChange={setTanggal} />
      </View>
      {cities.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bleed}
          contentContainerStyle={styles.cityRow}
          accessibilityRole="radiogroup"
          accessibilityLabel="Kota"
        >
          {['', ...cities].map((city) => (
            <Pill
              key={city || 'semua'}
              label={city || 'Semua kota'}
              selected={lokasi === city}
              onPress={() => setLokasi(city)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <SecurityModeBanner />
      <FlatList
        data={venues ?? []}
        keyExtractor={(venue) => String(venue.id)}
        renderItem={({ item }) => (
          <VenueCard venue={item} badge={badges.get(item.id)} tanggal={tanggal} />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          error ? (
            <ErrorState message={error.message} onRetry={reload} />
          ) : !venues ? (
            <View style={styles.skeletons}>
              <VenueCardSkeleton />
              <VenueCardSkeleton />
            </View>
          ) : (
            <EmptyState
              icon={SearchX}
              title="Tidak ada lapangan yang cocok"
              description="Coba olahraga, kota, atau tanggal lain."
            />
          )
        }
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading && !!venues} onRefresh={refresh} />}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: Space.lg,
    paddingBottom: Space.xxxl,
    gap: Space.xxxl,
  },
  skeletons: { gap: Space.xxxl },
  header: { gap: Space.lg },
  titleBlock: { gap: Space.xs, marginTop: Space.sm },
  bleed: { marginHorizontal: -SCREEN_PADDING },
  cityRow: { gap: Space.sm, paddingHorizontal: SCREEN_PADDING },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
  },
  searchInput: { flex: 1, fontFamily: Fonts.medium, fontSize: 15, paddingVertical: Space.md },
});
