import type { Sport } from './types.ts';

/** Gradasi pengganti foto per cabang olahraga (nilainya ikut tema, lihat index.css). */
export const SPORT_PLACEHOLDER: Record<Sport, string> = {
  futsal: 'var(--app-img-futsal)',
  badminton: 'var(--app-img-badminton)',
  basket: 'var(--app-img-basket)',
};
