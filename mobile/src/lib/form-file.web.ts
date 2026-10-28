import type { LocalFile } from './form-file';

export type { LocalFile };

/** Web: `uri` berupa blob:/data: URL, jadi isinya diambil dulu sebagai Blob. */
export async function appendFile(form: FormData, field: string, file: LocalFile): Promise<void> {
  const blob = await (await fetch(file.uri)).blob();
  form.append(field, blob, file.name);
}
