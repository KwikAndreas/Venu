import { Star } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Space } from '@/constants/theme';
import { formatRating } from '@/lib/format';
import { useTheme } from '@/theme/theme-context';
import { AppText } from '../ui/AppText';

/** Rating hanya tampil bila sudah ada ulasan (tanpa label "Baru" yang berulang). */
export function RatingSummary({ rating, count }: { rating: number | null; count: number }) {
  const { colors } = useTheme();
  if (rating === null || count === 0) return null;
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`Rating ${formatRating(rating)} dari ${count} ulasan`}
    >
      <Star size={14} color={colors.warning} fill={colors.warning} />
      <AppText variant="label" numeric>
        {formatRating(rating)}
      </AppText>
      <AppText variant="small" tone="muted">
        ({count})
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
});
