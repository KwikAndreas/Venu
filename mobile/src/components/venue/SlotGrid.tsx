import { Pressable, StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space, TOUCH_TARGET } from '@/constants/theme';
import type { Slot } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';
import { AppText } from '../ui/AppText';

const COLUMNS = 4;

type SlotGridProps = {
  slots: Slot[];
  selected: string[];
  onToggle: (slot: Slot) => void;
};

function chunk<T>(items: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, index * size + size),
  );
}

/**
 * Kotak jam 44px tanpa legenda. Kosong: bergaris tipis. Dipilih: aksen.
 * Terisi: dicoret dan nonaktif, jadi tidak hanya dibedakan warna.
 */
export function SlotGrid({ slots, selected, onToggle }: SlotGridProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.grid}>
      {chunk(slots, COLUMNS).map((row) => (
        <View key={row[0]?.jam_mulai} style={styles.row}>
          {row.map((slot) => {
            const isSelected = selected.includes(slot.jam_mulai);
            const label = `${slot.jam_mulai}–${slot.jam_selesai}`;
            const palette = !slot.tersedia
              ? { background: colors.surface, border: colors.surface, text: colors.muted }
              : isSelected
                ? { background: colors.accent, border: colors.accent, text: colors.onAccent }
                : { background: colors.raised, border: colors.line, text: colors.fg };
            return (
              <Pressable
                key={slot.jam_mulai}
                disabled={!slot.tersedia}
                accessibilityRole="button"
                accessibilityLabel={slot.tersedia ? label : `${label}, sudah terisi`}
                accessibilityState={{ disabled: !slot.tersedia, selected: isSelected }}
                onPress={() => onToggle(slot)}
                style={[
                  styles.slot,
                  { backgroundColor: palette.background, borderColor: palette.border },
                ]}
              >
                <AppText
                  variant="label"
                  numeric
                  style={[styles.slotText, { color: palette.text }, !slot.tersedia && styles.taken]}
                >
                  {slot.jam_mulai}
                </AppText>
              </Pressable>
            );
          })}
          {Array.from({ length: COLUMNS - row.length }, (_, index) => (
            <View key={`spacer-${index}`} style={styles.spacer} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: Space.sm },
  row: { flexDirection: 'row', gap: Space.sm },
  slot: {
    flex: 1,
    height: TOUCH_TARGET,
    borderWidth: 1,
    borderRadius: Radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontFamily: Fonts.semibold, fontSize: 14 },
  taken: { textDecorationLine: 'line-through', opacity: 0.6 },
  spacer: { flex: 1 },
});
