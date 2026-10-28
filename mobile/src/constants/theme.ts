// Token desain "Galeri Banding" (DESIGN.md §2–§4). Nama dan nilai sama dengan web/src/index.css;
// bila salah satu diubah, ubah juga di web dan di DESIGN.md.
import type { TextStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type Palette = {
  bg: string;
  surface: string;
  raised: string;
  line: string;
  fg: string;
  muted: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  /** Pengganti foto per cabang olahraga (versi datar dari gradasi web). */
  imgFutsal: string;
  imgBadminton: string;
  imgBasket: string;
  shadow: string;
};

export const PALETTES: Record<ColorScheme, Palette> = {
  light: {
    bg: '#FBFAF7',
    surface: '#F3F1EC',
    raised: '#FFFFFF',
    line: '#E7E3DA',
    fg: '#1D1B17',
    muted: '#6C665C',
    accent: '#1F6B45',
    accentSoft: '#E6F0EA',
    onAccent: '#FFFFFF',
    warning: '#8A5A0B',
    warningSoft: '#FBF1DD',
    danger: '#B42318',
    dangerSoft: '#FDECEA',
    info: '#2F5B8A',
    infoSoft: '#E8EFF7',
    imgFutsal: '#C8BAA1',
    imgBadminton: '#B3C2B0',
    imgBasket: '#C3B2A9',
    shadow: '#1D1B17',
  },
  dark: {
    bg: '#151412',
    surface: '#1D1B19',
    raised: '#221F1C',
    line: '#312D29',
    fg: '#EEEAE3',
    muted: '#A39B8F',
    accent: '#86C7A1',
    accentSoft: '#1B2A22',
    onAccent: '#0F1712',
    warning: '#E8BD6C',
    warningSoft: '#2C2417',
    danger: '#F19A8F',
    dangerSoft: '#2F1C1A',
    info: '#9CC0E6',
    infoSoft: '#1B2430',
    imgFutsal: '#322D26',
    imgBadminton: '#282F28',
    imgBasket: '#322A26',
    shadow: '#000000',
  },
};

/** Grid jarak 4px. */
export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  chip: 12,
  card: 18,
  panel: 24,
  pill: 999,
} as const;

/** Padding horizontal layar (DESIGN.md §4: 20px di mobile). */
export const SCREEN_PADDING = Space.xl;

/** Tinggi target sentuh minimum. */
export const TOUCH_TARGET = 44;

export const Fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export type TextVariant =
  'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyStrong' | 'label' | 'small';

/** Skala tipe mobile (DESIGN.md §3). Tracking dalam px karena RN tidak mengenal em. */
export const TYPE_SCALE: Record<TextVariant, TextStyle> = {
  display: { fontFamily: Fonts.extrabold, fontSize: 32, lineHeight: 38, letterSpacing: -1 },
  h1: { fontFamily: Fonts.extrabold, fontSize: 28, lineHeight: 34, letterSpacing: -0.8 },
  h2: { fontFamily: Fonts.bold, fontSize: 20, lineHeight: 28, letterSpacing: -0.4 },
  h3: { fontFamily: Fonts.bold, fontSize: 17, lineHeight: 24, letterSpacing: -0.2 },
  body: { fontFamily: Fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: Fonts.semibold, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: Fonts.medium, fontSize: 13, lineHeight: 18 },
  small: { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 18 },
};

/** Satu-satunya bayangan (`shadow-soft`) untuk elemen mengambang. */
export function softShadow(palette: Palette) {
  return {
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  } as const;
}
