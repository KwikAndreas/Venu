import { Tabs } from 'expo-router';
import { CalendarDays, Search, UserRound } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Fonts } from '@/constants/theme';
import { useActiveBookings } from '@/bookings/active-bookings-context';
import { useTheme } from '@/theme/theme-context';

/** Tinggi isi tab bar (ikon + label). Ruang home indicator/navigasi sistem ditambahkan di atasnya. */
const TAB_BAR_CONTENT_HEIGHT = 64;
const TAB_BAR_PADDING = 4;

export default function TabLayout() {
  const { colors } = useTheme();
  const { active } = useActiveBookings();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.fg,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: Fonts.semibold, fontSize: 12, lineHeight: 16 },
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: TAB_BAR_PADDING,
          paddingBottom: insets.bottom + TAB_BAR_PADDING,
        },
        tabBarBadgeStyle: {
          backgroundColor: colors.accent,
          color: colors.onAccent,
          fontFamily: Fonts.bold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Cari',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Booking saya',
          tabBarBadge: active.length > 0 ? active.length : undefined,
          tabBarIcon: ({ color, size }) => <CalendarDays color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Akun',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
