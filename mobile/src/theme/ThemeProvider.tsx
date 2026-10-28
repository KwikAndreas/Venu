import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PALETTES } from '@/constants/theme';
import { storage } from '@/lib/storage';
import { ThemeContext, type ThemePreference } from './theme-context';

const THEME_KEY = 'venu.theme';

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    storage.get(THEME_KEY).then(
      (saved) => isPreference(saved) && setPreferenceState(saved),
      () => undefined,
    );
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    storage.set(THEME_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => {
    const scheme =
      preference === 'system' ? (deviceScheme === 'dark' ? 'dark' : 'light') : preference;
    return { scheme, colors: PALETTES[scheme], preference, setPreference };
  }, [deviceScheme, preference, setPreference]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
