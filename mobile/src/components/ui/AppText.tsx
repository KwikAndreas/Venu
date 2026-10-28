import { StyleSheet, Text, type TextProps } from 'react-native';
import { TYPE_SCALE, type Palette, type TextVariant } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';

export type TextTone = keyof Pick<
  Palette,
  'fg' | 'muted' | 'accent' | 'danger' | 'warning' | 'onAccent' | 'bg'
>;

type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Angka sejajar (harga, jam) agar mudah dibandingkan. */
  numeric?: boolean;
};

/** Satu-satunya komponen teks: tipe dari DESIGN.md §3, warna dari token tema. */
export function AppText({
  variant = 'body',
  tone = 'fg',
  numeric = false,
  style,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...props}
      style={[TYPE_SCALE[variant], { color: colors[tone] }, numeric && styles.numeric, style]}
    />
  );
}

const styles = StyleSheet.create({
  numeric: { fontVariant: ['tabular-nums'] },
});
