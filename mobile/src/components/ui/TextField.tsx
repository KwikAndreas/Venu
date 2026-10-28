import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { Fonts, Radius, Space } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';
import { AppText } from './AppText';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

/** Label di atas input; error tampil dengan ikon, tidak hanya warna. */
export function TextField({ label, error, style, ...props }: TextFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            color: colors.fg,
            backgroundColor: colors.raised,
            borderColor: error ? colors.danger : colors.line,
          },
          style,
        ]}
      />
      {error && (
        <View style={styles.error} accessibilityLiveRegion="polite">
          <CircleAlert size={14} color={colors.danger} />
          <AppText variant="small" tone="danger" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Space.sm },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radius.chip,
    paddingHorizontal: Space.lg,
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  error: { flexDirection: 'row', alignItems: 'center', gap: Space.xs },
  errorText: { flex: 1 },
});
