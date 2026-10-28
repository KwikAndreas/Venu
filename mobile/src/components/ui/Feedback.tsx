import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Radius, Space } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';
import { Button } from './Button';

type SkeletonProps = {
  height?: DimensionValue;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ height, width = '100%', radius = Radius.chip, style }: SkeletonProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ height, width, borderRadius: radius, backgroundColor: colors.surface }, style]}
    />
  );
}

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

/** Ikon kecil dalam lingkaran + judul + satu kalimat + satu aksi. */
export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
        <Icon size={22} color={colors.muted} strokeWidth={1.75} />
      </View>
      <AppText variant="h3" style={styles.center}>
        {title}
      </AppText>
      <AppText tone="muted" style={styles.center}>
        {description}
      </AppText>
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.empty} accessibilityLiveRegion="polite">
      <AppText tone="danger" style={styles.center}>
        {message}
      </AppText>
      <Button label="Coba lagi" variant="secondary" size="sm" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: Space.sm, paddingVertical: Space.xxxl },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xs,
  },
  center: { textAlign: 'center', maxWidth: 300 },
  action: { marginTop: Space.md },
});
