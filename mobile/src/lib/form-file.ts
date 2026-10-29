import { File } from 'expo-file-system';

/** File lokal hasil pemilih gambar, siap diunggah lewat FormData. */
export type LocalFile = { uri: string; name: string; type: string };

/**
 * Android/iOS: sejak SDK 58, `fetch` global diganti `expo/fetch`, yang TIDAK mendukung objek
 * { uri, name, type } khas React Native di FormData (request gagal sebelum terkirim). Karena itu
 * file dibungkus `File` dari expo-file-system, yang isinya dibaca expo/fetch lewat `bytes()`.
 * Versi web ada di form-file.web.ts.
 */
export async function appendFile(form: FormData, field: string, file: LocalFile): Promise<void> {
  form.append(field, new File(file.uri), file.name);
}
