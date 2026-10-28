import * as SecureStore from 'expo-secure-store';

/**
 * Penyimpanan kunci-nilai kecil di perangkat. Di Android/iOS memakai SecureStore
 * (Keystore/Keychain, terenkripsi), sehingga token login tidak tersimpan sebagai teks biasa.
 * Versi web ada di storage.web.ts.
 */
export const storage = {
  get: (key: string): Promise<string | null> => SecureStore.getItemAsync(key),
  set: (key: string, value: string): Promise<void> => SecureStore.setItemAsync(key, value),
  remove: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};
