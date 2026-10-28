import { ScrollView, StyleSheet } from 'react-native';
import { SCREEN_PADDING, Space } from '@/constants/theme';
import { MAX_DAYS_AHEAD } from '@/lib/booking-rules';
import { addDays, todayInJakarta } from '@/lib/format';
import { Pill } from '../ui/Choice';

function captionFor(date: string, today: string): string {
  if (date === today) return 'Hari ini';
  if (date === addDays(today, 1)) return 'Besok';
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', { weekday: 'short' });
}

function labelFor(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

type DateStripProps = { value: string; onChange: (date: string) => void };

/** Pemilih tanggal geser horizontal: hari ini sampai batas booking (MAX_DAYS_AHEAD). */
export function DateStrip({ value, onChange }: DateStripProps) {
  const today = todayInJakarta();
  const dates = Array.from({ length: MAX_DAYS_AHEAD + 1 }, (_, index) => addDays(today, index));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="radiogroup"
      accessibilityLabel="Tanggal main"
    >
      {dates.map((date) => (
        <Pill
          key={date}
          caption={captionFor(date, today)}
          label={labelFor(date)}
          selected={date === value}
          onPress={() => onChange(date)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: Space.sm, paddingHorizontal: SCREEN_PADDING },
});
