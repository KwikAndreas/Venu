/** Versi web (Expo web, untuk pratinjau di browser): SecureStore tidak tersedia, pakai localStorage. */
export const storage = {
  get: async (key: string): Promise<string | null> => localStorage.getItem(key),
  set: async (key: string, value: string): Promise<void> => localStorage.setItem(key, value),
  remove: async (key: string): Promise<void> => localStorage.removeItem(key),
};
