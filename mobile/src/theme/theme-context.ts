import { createContext, use } from 'react';
import { PALETTES, type ColorScheme, type Palette } from '@/constants/theme';

/** "system" = ikut tema perangkat sampai pengguna memilih sendiri. */
export type ThemePreference = 'system' | ColorScheme;

export type ThemeContextValue = {
  scheme: ColorScheme;
  colors: Palette;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  scheme: 'light',
  colors: PALETTES.light,
  preference: 'system',
  setPreference: () => undefined,
});

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}
