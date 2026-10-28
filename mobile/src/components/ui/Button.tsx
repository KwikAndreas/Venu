import type { LucideIcon } from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Fonts, Radius, Space, TOUCH_TARGET, type Palette } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'neutral' | 'secondary' | 'ghost' | 'danger-ghost';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

type VariantColors = { background: string; border: string; text: string };

function variantColors(variant: ButtonVariant, colors: Palette): VariantColors {
  switch (variant) {
    case 'primary':
      return { background: colors.accent, border: colors.accent, text: colors.onAccent };
    case 'neutral':
      return { background: colors.fg, border: colors.fg, text: colors.bg };
    case 'secondary':
      return { background: 'transparent', border: colors.line, text: colors.fg };
    case 'ghost':
      return { background: 'transparent', border: 'transparent', text: colors.fg };
    case 'danger-ghost':
      return { background: 'transparent', border: 'transparent', text: colors.danger };
  }
}

/** Tombol berbentuk pil, tinggi 44px (36px kecil). Label sentence case. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const palette = variantColors(variant, colors);
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      hitSlop={size === 'sm' ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor: palette.background, borderColor: palette.border },
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <View style={styles.content}>
          {Icon && <Icon size={size === 'sm' ? 16 : 18} color={palette.text} strokeWidth={2} />}
          <AppText
            variant="bodyStrong"
            style={[styles.label, size === 'sm' && styles.smallLabel, { color: palette.text }]}
          >
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medium: { minHeight: TOUCH_TARGET, paddingHorizontal: Space.xl },
  small: { minHeight: 36, paddingHorizontal: Space.lg },
  content: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  label: { fontFamily: Fonts.bold },
  smallLabel: { fontSize: 14 },
  inactive: { opacity: 0.45 },
  pressed: { opacity: 0.8 },
});
