import { Alert } from 'react-native';

export type ConfirmOptions = { title: string; message: string; confirmLabel: string };

/** Dialog konfirmasi native sebelum aksi destruktif. Versi web ada di dialog.web.ts. */
export function confirmAction({ title, message, confirmLabel }: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Kembali', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Pesan singkat (mis. error dari server) dengan satu tombol tutup. */
export function notify(title: string, message: string): void {
  Alert.alert(title, message);
}
