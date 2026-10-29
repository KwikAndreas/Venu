import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Fonts } from '@/constants/theme';
import { useTheme } from '@/theme/theme-context';

// Huruf kecil & angka: lebarnya mirip huruf asli, jadi karakter acak tidak saling menimpa.
const GLYPHS = 'abcdeghknopqrsuvxyz0123456789';
const NARROW_GLYPHS = ':;,|!'; // untuk slot titik
const WORD = 'venu.';
const LOCK_START_MS = 250; // huruf pertama terkunci
const LOCK_STEP_MS = 110; // jeda antarhuruf
const HOLD_MS = 350; // kata utuh ditahan sebentar sebelum memudar
const DURATION_MS = LOCK_START_MS + (WORD.length - 1) * LOCK_STEP_MS + HOLD_MS;
const FADE_MS = 250;
const TICK_MS = 55; // karakter berganti tiap 55 ms
const TRAIL = 2; // jumlah karakter samar di atas tiap huruf
const TRAIL_FADE_MS = 180; // jejak memudar setelah huruf terkunci

function glyph(slot: number, seed: number, tick: number): string {
  const set = WORD[slot] === '.' ? NARROW_GLYPHS : GLYPHS;
  const x = Math.sin(seed * 127.1 + tick * 311.7 + slot * 74.7) * 43758.5453;
  return set.charAt(Math.floor((x - Math.floor(x)) * set.length));
}

/**
 * Splash pembuka (~1 detik, sama dengan web/index.html): efeknya hanya di dalam teks, latar
 * tetap polos. Di setiap posisi huruf, karakter berwarna aksen terus berganti dengan jejak samar
 * yang turun ke posisinya, lalu huruf terkunci satu per satu membentuk "venu.".
 * Bila "kurangi gerakan" aktif di perangkat, kata langsung tampil tanpa animasi.
 */
export function MatrixSplash({ onFinished }: { onFinished: () => void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const [elapsed, setElapsed] = useState(0);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const fadeOut = () =>
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => !cancelled && onFinished());

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        setElapsed(DURATION_MS);
        setTimeout(fadeOut, 400);
        return;
      }
      const start = Date.now();
      const step = () => {
        const now = Date.now() - start;
        setElapsed(now);
        if (now < DURATION_MS) frame = requestAnimationFrame(step);
        else fadeOut();
      };
      frame = requestAnimationFrame(step);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [opacity, onFinished]);

  const size = Math.min(96, Math.max(56, width * 0.14));
  const lineHeight = size * 1.2;
  const trailStep = size * 0.8;
  const tick = Math.floor(elapsed / TICK_MS);
  const fall = (elapsed % TICK_MS) / TICK_MS; // jejak bergeser turun di antara pergantian karakter
  const textStyle = { fontSize: size, lineHeight };

  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.bg, opacity }]}
    >
      <View style={styles.row}>
        {WORD.split('').map((letter, slot) => {
          const lockAt = LOCK_START_MS + slot * LOCK_STEP_MS;
          const locked = elapsed >= lockAt;
          const trailAlpha = locked ? Math.max(0, 1 - (elapsed - lockAt) / TRAIL_FADE_MS) : 1;
          return (
            // Huruf akhir selalu dirender (tak terlihat sebelum terkunci) agar lebar slot tetap.
            <View key={slot}>
              <Text
                style={[
                  styles.letter,
                  textStyle,
                  { color: letter === '.' ? colors.accent : colors.fg, opacity: locked ? 1 : 0 },
                ]}
              >
                {letter}
              </Text>
              {Array.from({ length: TRAIL }, (_, index) => index + 1).map((k) => (
                <View key={k} style={[styles.overlay, { top: -(k - fall) * trailStep }]}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.letter,
                      textStyle,
                      {
                        color: colors.accent,
                        opacity: trailAlpha * 0.3 * (1 - k / (TRAIL + 1)),
                      },
                    ]}
                  >
                    {glyph(slot, slot * 7 + k, tick)}
                  </Text>
                </View>
              ))}
              {!locked && (
                <View style={styles.overlay}>
                  <Text
                    numberOfLines={1}
                    style={[styles.letter, textStyle, { color: colors.accent }]}
                  >
                    {glyph(slot, slot * 7, tick)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  letter: { fontFamily: Fonts.extrabold, letterSpacing: -1, textAlign: 'center' },
  // Karakter acak ditumpuk di tengah slot huruf (View, karena Text absolut mengabaikan `right`).
  overlay: { position: 'absolute', left: -20, right: -20, top: 0, alignItems: 'center' },
});
