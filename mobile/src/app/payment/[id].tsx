import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '@/components/ui/Feedback';
import { Radius, SCREEN_PADDING, Space } from '@/constants/theme';
import { authorizedSource } from '@/lib/api';
import { useTheme } from '@/theme/theme-context';

/**
 * Bukti bayar untuk pemilik. File tidak publik, jadi gambar diminta dengan header token
 * (`authorizedSource`); backend tetap memeriksa bahwa pemilik ini berhak melihatnya.
 */
export default function PaymentProofScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [failed, setFailed] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {failed ? (
        <EmptyState
          icon={FileText}
          title="Bukti tidak bisa ditampilkan"
          description="Bukti ini bukan gambar (mis. PDF) atau sudah tidak tersedia. Buka lewat dashboard pemilik di versi web."
        />
      ) : (
        <Image
          source={authorizedSource(`/payments/${id}/proof`)}
          accessibilityLabel="Bukti bayar dari penyewa"
          contentFit="contain"
          onError={() => setFailed(true)}
          style={[styles.proof, { borderColor: colors.line, backgroundColor: colors.surface }]}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SCREEN_PADDING, paddingBottom: Space.xxxl },
  proof: { width: '100%', aspectRatio: 3 / 4, borderWidth: 1, borderRadius: Radius.card },
});
