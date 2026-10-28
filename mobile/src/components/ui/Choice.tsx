import { Pressable, StyleSheet, View } from 'react-native';
import { Fonts, Radius, Space, softShadow } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

type PillProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Teks kecil di atas label, mis. nama hari pada pemilih tanggal. */
  caption?: string;
};

/** Pil pilihan (kota, tanggal). Terpilih memakai aksen, sesuai DESIGN.md §2. */
export function Pill({ label, selected, onPress, caption }: PillProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={caption ? `${caption} ${label}` : label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        caption ? styles.tallPill : null,
        {
          backgroundColor: selected ? colors.accentSoft : colors.raised,
          borderColor: selected ? colors.accent : colors.line,
        },
        pressed && styles.pressed,
      ]}
    >
      {caption && (
        <AppText variant="small" tone={selected ? 'accent' : 'muted'}>
          {caption}
        </AppText>
      )}
      <AppText variant="label" tone={selected ? 'accent' : 'fg'} numeric style={styles.pillLabel}>
        {label}
      </AppText>
    </Pressable>
  );
}

type SegmentProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/** Segmen berbentuk pil: wadah `surface`, item aktif terangkat (`raised` + bayangan). */
export function Segment<T extends string>({ options, value, onChange }: SegmentProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.segment, { backgroundColor: colors.surface }]}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            onPress={() => onChange(option.value)}
            style={[
              styles.segmentItem,
              active && [{ backgroundColor: colors.raised }, softShadow(colors)],
            ]}
          >
            <AppText
              variant="label"
              tone={active ? 'fg' : 'muted'}
              style={active && styles.segmentActive}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    minHeight: 36,
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tallPill: { minHeight: 56, borderRadius: Radius.card, paddingHorizontal: Space.md, minWidth: 64 },
  pillLabel: { fontFamily: Fonts.semibold },
  pressed: { opacity: 0.8 },
  segment: { flexDirection: 'row', borderRadius: Radius.pill, padding: Space.xs },
  segmentItem: {
    flex: 1,
    minHeight: 36,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: { fontFamily: Fonts.bold },
});
