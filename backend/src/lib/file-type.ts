export type FileExtension = 'jpg' | 'png' | 'webp' | 'pdf';

type Signature = {
  extension: FileExtension;
  matches: (bytes: Buffer) => boolean;
};

const startsWith = (bytes: Buffer, prefix: number[], offset = 0): boolean =>
  prefix.every((byte, index) => bytes[offset + index] === byte);

const ascii = (text: string): number[] => [...text].map((char) => char.charCodeAt(0));

// "Magic bytes": beberapa byte pertama yang menandai jenis file sebenarnya.
// Jauh lebih bisa dipercaya daripada nama file atau Content-Type kiriman klien.
const SIGNATURES: Signature[] = [
  { extension: 'jpg', matches: (b) => startsWith(b, [0xff, 0xd8, 0xff]) },
  {
    extension: 'png',
    matches: (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  {
    extension: 'webp',
    matches: (b) => startsWith(b, ascii('RIFF')) && startsWith(b, ascii('WEBP'), 8),
  },
  { extension: 'pdf', matches: (b) => startsWith(b, ascii('%PDF-')) },
];

export const IMAGE_TYPES: readonly FileExtension[] = ['jpg', 'png', 'webp'];
export const PROOF_TYPES: readonly FileExtension[] = ['jpg', 'png', 'webp', 'pdf'];

export const CONTENT_TYPES: Record<FileExtension, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

/** Mengenali jenis file dari isinya; undefined bila tidak termasuk jenis yang dikenal. */
export function detectFileType(bytes: Buffer): FileExtension | undefined {
  return SIGNATURES.find((signature) => signature.matches(bytes))?.extension;
}
