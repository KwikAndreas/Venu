import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationTheme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { AuthProvider } from '@/auth/AuthProvider';
import { useAuth } from '@/auth/auth-context';
import { ActiveBookingsProvider } from '@/bookings/ActiveBookingsProvider';
import { Fonts } from '@/constants/theme';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useTheme } from '@/theme/theme-context';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Navigasi + header bawaan diwarnai dengan token tema agar menyatu di mode terang/gelap. */
function AppNavigator() {
  const { scheme, colors } = useTheme();
  const { ready } = useAuth();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.accent,
        background: colors.bg,
        card: colors.bg,
        text: colors.fg,
        border: colors.line,
      },
    };
  }, [scheme, colors]);

  if (!ready) return null;

  return (
    <NavigationTheme value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: Fonts.bold, fontSize: 17 },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="venue/[id]" options={{ title: '' }} />
        <Stack.Screen name="booking/[id]" options={{ title: 'Selesaikan pemesanan' }} />
        <Stack.Screen name="payment/[id]" options={{ title: 'Bukti bayar' }} />
        <Stack.Screen name="login" options={{ title: 'Masuk', presentation: 'modal' }} />
        <Stack.Screen name="register" options={{ title: 'Daftar', presentation: 'modal' }} />
      </Stack>
    </NavigationTheme>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Bila font gagal dimuat, aplikasi tetap jalan dengan font sistem.
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <ActiveBookingsProvider>
          <AppNavigator />
        </ActiveBookingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
