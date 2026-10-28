/** File lokal hasil pemilih gambar, siap diunggah lewat FormData. */
export type LocalFile = { uri: string; name: string; type: string };

/**
 * Android/iOS: fetch React Native membaca file langsung dari `uri`, jadi cukup objek
 * { uri, name, type }. Versi web ada di form-file.web.ts.
 */
export async function appendFile(form: FormData, field: string, file: LocalFile): Promise<void> {
  form.append(field, file as unknown as Blob);
}
