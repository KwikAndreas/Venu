import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space, softShadow } from '@/constants/theme';
import { formatRupiah } from '@/lib/format';
import type { Venue } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';
import { AppText } from '../ui/AppText';
import { Skeleton } from '../ui/Feedback';
import { Divider } from '../ui/Layout';
import { RatingSummary } from './RatingSummary';
import { VenuePhoto } from './VenuePhoto';

const MAX_VISIBLE_SLOTS = 3;

function FreeSlots({ slots }: { slots: string[] }) {
  const { colors } = useTheme();
  if (slots.length === 0) {
    return (
      <AppText variant="small" tone="muted">
        Penuh pada jam ini
      </AppText>
    );
  }
  const extra = slots.length - MAX_VISIBLE_SLOTS;
  const chips = [...slots.slice(0, MAX_VISIBLE_SLOTS), ...(extra > 0 ? [`+${extra}`] : [])];
  return (
    <View style={styles.slots}>
      <AppText variant="small" tone="muted">
        Jam kosong
      </AppText>
      <View style={styles.chips}>
        {chips.map((chip) => (
          <View key={chip} style={[styles.chip, { backgroundColor: colors.accentSoft }]}>
            <AppText variant="label" tone="accent" numeric style={styles.chipText}>
              {chip}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

type VenueCardProps = {
  venue: Venue;
  /** Satu label bantu keputusan (lib/decision-badges.ts), bila ada. */
  badge?: string;
  tanggal: string;
};

/** Kartu foto (gaya B) dengan informasi pembanding di posisi yang sama (gaya A). */
export function VenueCard({ venue, badge, tanggal }: VenueCardProps) {
  const { colors } = useTheme();
  const details = [venue.kota, ...venue.fasilitas.slice(0, 2)].join(' · ');

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${venue.nama}, ${venue.kota}, ${formatRupiah(venue.harga_per_jam)} per jam`}
      onPress={() => router.push({ pathname: '/venue/[id]', params: { id: venue.id, tanggal } })}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View>
        <VenuePhoto
          fotoUrl={venue.foto_url}
          nama={venue.nama}
          sport={venue.jenis_olahraga}
          style={styles.photo}
        />
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.raised }, softShadow(colors)]}>
            <AppText variant="small" style={styles.badgeText}>
              {badge}
            </AppText>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText variant="h3" numberOfLines={1} style={styles.title}>
            {venue.nama}
          </AppText>
          <RatingSummary rating={venue.rating_rata} count={venue.jumlah_ulasan} />
        </View>
        <AppText variant="small" tone="muted" numberOfLines={1}>
          {details}
        </AppText>
        <Divider />
        <View style={styles.footer}>
          {venue.slot_kosong ? <FreeSlots slots={venue.slot_kosong} /> : <View />}
          <View style={styles.price}>
            <AppText variant="small" tone="muted">
              per jam
            </AppText>
            <AppText variant="h3" numeric>
              {formatRupiah(venue.harga_per_jam)}
            </AppText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function VenueCardSkeleton() {
  return (
    <View>
      <Skeleton radius={Radius.card} style={styles.photoSkeleton} />
      <Skeleton height={20} width="60%" style={styles.skeletonLine} />
      <Skeleton height={14} width="45%" style={styles.skeletonLine} />
      <Skeleton height={40} style={styles.skeletonLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  photo: { borderRadius: Radius.card },
  badge: {
    position: 'absolute',
    top: Space.md,
    left: Space.md,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
  },
  badgeText: { fontFamily: Fonts.bold },
  body: { paddingTop: Space.md, gap: Space.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  title: { flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  slots: { gap: Space.xs, flexShrink: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.xs },
  chip: { borderRadius: 8, paddingHorizontal: Space.sm, paddingVertical: 2 },
  chipText: { fontFamily: Fonts.semibold },
  price: { alignItems: 'flex-end' },
  photoSkeleton: { aspectRatio: 16 / 10 },
  skeletonLine: { marginTop: Space.md },
});
