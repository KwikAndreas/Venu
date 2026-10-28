import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { Palette } from '@/constants/theme';
import { assetUrl } from '@/lib/config';
import type { Sport } from '@/lib/types';
import { useTheme } from '@/theme/theme-context';

const PLACEHOLDER: Record<Sport, keyof Palette> = {
  futsal: 'imgFutsal',
  badminton: 'imgBadminton',
  basket: 'imgBasket',
};

type VenuePhotoProps = {
  fotoUrl: string | null;
  nama: string;
  sport: Sport;
  style?: StyleProp<ViewStyle>;
};

/** Foto lapangan apa adanya; tanpa foto memakai warna lembut per cabang olahraga. */
export function VenuePhoto({ fotoUrl, nama, sport, style }: VenuePhotoProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.frame, { backgroundColor: colors[PLACEHOLDER[sport]] }, style]}>
      {fotoUrl && (
        <Image
          source={{ uri: assetUrl(fotoUrl) }}
          accessibilityLabel={`Foto ${nama}`}
          contentFit="cover"
          transition={150}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', aspectRatio: 16 / 10 },
});
