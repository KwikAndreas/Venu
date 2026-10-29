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

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+=<>';
const WORD = 'venu.';
const RAIN_MS = 950;
const DURATION_MS = RAIN_MS + 200;
const LOCK_START_MS = 300;
const LOCK_STEP_MS = 120;
const FADE_MS = 250;
/** Karakter berganti tiap 50 ms (cukup untuk kesan terminal, ringan untuk React Native). */
const TICK_MS = 50;
const CELL = 22;
const TRAIL = 7;

/** Bilangan acak semu yang tetap untuk seed yang sama (posisi kolom tidak melompat). */
function seeded(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function glyph(seed: number, tick: number): string {
  return GLYPHS.charAt(Math.floor(seeded(seed * 7919 + tick) * GLYPHS.length));
}

/**
 * Splash pembuka (~1,2 detik, sama dengan web/index.html dan versi Flutter): hujan karakter
 * berwarna aksen, lalu huruf di tengah teracak dan terkunci satu per satu membentuk "venu.".
 * Bila "kurangi gerakan" aktif di perangkat, kata langsung tampil tanpa hujan.
 */
export function MatrixSplash({ onFinished }: { onFinished: () => void }) {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const [elapsed, setElapsed] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    let cancelled = false;
    const fadeOut = () =>
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => !cancelled && onFinished());

    let timer: ReturnType<typeof setInterval> | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        setReduced(true);
        setElapsed(DURATION_MS);
        setTimeout(fadeOut, 400);
        return;
      }
      const start = Date.now();
      timer = setInterval(() => {
        const now = Date.now() - start;
        setElapsed(now);
        if (now >= DURATION_MS) {
          clearInterval(timer);
          fadeOut();
        }
      }, TICK_MS);
    });
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [opacity, onFinished]);

  const tick = Math.floor(elapsed / TICK_MS);
  const rainFade = reduced ? 0 : Math.max(0, 1 - elapsed / RAIN_MS);
  const wordSize = Math.min(96, Math.max(56, width * 0.14));
  const columns = Math.ceil(width / CELL);

  const rain: { key: string; x: number; y: number; char: string; alpha: number }[] = [];
  if (rainFade > 0) {
    for (let column = 0; column < columns; column++) {
      const speed = 0.35 + seeded(column + 1) * 0.5; // px per ms
      const head = -seeded(column + 101) * height * 0.6 + elapsed * speed;
      for (let step = 0; step < TRAIL; step++) {
        const y = head - step * CELL;
        if (y < -CELL || y > height) continue;
        rain.push({
          key: `${column}-${step}`,
          x: column * CELL,
          y,
          char: glyph(column * 31 + step, tick),
          alpha: rainFade * (1 - step / TRAIL),
        });
      }
    }
  }

  return (
    <Animated.View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity }]}
    >
      {rain.map((drop) => (
        <Text
          key={drop.key}
          style={[
            styles.rain,
            { left: drop.x, top: drop.y, color: colors.accent, opacity: drop.alpha },
          ]}
        >
          {drop.char}
        </Text>
      ))}
      <View style={styles.wordRow}>
        {WORD.split('').map((letter, index) => {
          const locked = elapsed >= LOCK_START_MS + index * LOCK_STEP_MS;
          const color = !locked || letter === '.' ? colors.accent : colors.fg;
          return (
            <Text
              key={index}
              style={[styles.word, { fontSize: wordSize, lineHeight: wordSize * 1.2, color }]}
            >
              {locked ? letter : glyph(1000 + index, tick)}
            </Text>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rain: {
    position: 'absolute',
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },
  wordRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  word: { fontFamily: Fonts.extrabold, letterSpacing: -1 },
});
