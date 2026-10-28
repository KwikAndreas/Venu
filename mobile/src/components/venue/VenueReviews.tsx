import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Space } from '@/constants/theme';
import { useApi } from '@/hooks/use-api';
import { formatDateTime } from '@/lib/format';
import type { Review } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';
import { AppText } from '../ui/AppText';
import { Skeleton } from '../ui/Feedback';

const MAX_STARS = 5;

function Stars({ rating }: { rating: number }) {
  const { colors } = useTheme();
  return (
    <View
      style={styles.stars}
      accessible
      accessibilityLabel={`${rating} dari ${MAX_STARS} bintang`}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => (
        <Star
          key={index}
          size={13}
          color={index < rating ? colors.warning : colors.line}
          fill={index < rating ? colors.warning : 'transparent'}
        />
      ))}
    </View>
  );
}

/**
 * Daftar ulasan (hanya baca). Komentar ditampilkan lewat <Text>, yang tidak pernah menafsirkan
 * HTML, sehingga stored XSS (A05) dari komentar tidak berlaku di aplikasi mobile.
 */
export function VenueReviews({ venueId }: { venueId: number }) {
  const { data } = useApi<{ reviews: Review[] }>(`/venues/${venueId}/reviews`);
  const reviews = data?.reviews;

  return (
    <View style={styles.section}>
      <AppText variant="h2" accessibilityRole="header">
        Ulasan
      </AppText>
      {!reviews ? (
        <Skeleton height={64} />
      ) : reviews.length === 0 ? (
        <AppText tone="muted">Belum ada ulasan.</AppText>
      ) : (
        reviews.map((review) => (
          <View key={review.id} style={styles.review}>
            <View style={styles.reviewHeader}>
              <AppText variant="bodyStrong">{review.nama_user}</AppText>
              <Stars rating={review.rating} />
            </View>
            {review.komentar && <AppText>{review.komentar}</AppText>}
            <AppText variant="small" tone="muted">
              {formatDateTime(review.created_at)}
            </AppText>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Space.lg },
  review: { gap: Space.xs },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stars: { flexDirection: 'row', gap: 2 },
});
