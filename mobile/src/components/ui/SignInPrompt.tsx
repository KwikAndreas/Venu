import { router } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Space } from '@/constants/theme';
import { Button } from './Button';
import { EmptyState } from './Feedback';

/** Ditampilkan di tab yang butuh akun saat pengguna belum masuk. */
export function SignInPrompt({ description }: { description: string }) {
  return (
    <EmptyState
      icon={LogIn}
      title="Masuk dulu, yuk"
      description={description}
      action={
        <View style={styles.actions}>
          <Button label="Masuk" variant="neutral" onPress={() => router.push('/login')} />
          <Button label="Daftar" variant="secondary" onPress={() => router.push('/register')} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: Space.sm },
});
