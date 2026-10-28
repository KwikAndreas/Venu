import { StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space, type Palette } from '@/constants/theme';
import type { Stage, StageTone } from '@/lib/booking-stage';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

function toneColors(tone: StageTone, colors: Palette): { background: string; text: string } {
  switch (tone) {
    case 'warning':
      return { background: colors.warningSoft, text: colors.warning };
    case 'success':
      return { background: colors.accentSoft, text: colors.accent };
    case 'danger':
      return { background: colors.dangerSoft, text: colors.danger };
    case 'neutral':
      return { background: colors.surface, text: colors.muted };
  }
}

/**
 * Satu-satunya penanda status booking. Status booking dan pembayaran sudah digabung oleh
 * lib/booking-stage.ts, jadi tidak pernah tampil dua badge yang saling mengulang.
 */
export function StatusBadge({ stage }: { stage: Stage }) {
  const { colors } = useTheme();
  const palette = toneColors(stage.tone, colors);
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <View style={[styles.dot, { backgroundColor: palette.text }]} />
      <AppText variant="label" style={[styles.label, { color: palette.text }]}>
        {stage.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Space.sm,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: Space.xs,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: { fontFamily: Fonts.semibold },
});
