// Salinan dari web/src/lib/decision-badges.ts. Jaga tetap sama.
import type { Venue } from './types';

const MIN_REVIEWS_FOR_BADGE = 3;

/**
 * Satu label bantu keputusan per kartu, dihitung dari daftar yang sedang tampil.
 * Prioritas: rating tertinggi → paling banyak diulas → termurah.
 */
export function decisionBadges(venues: Venue[]): Map<number, string> {
  const badges = new Map<number, string>();
  if (venues.length < 2) return badges;
  const assign = (venue: Venue | undefined, label: string) => {
    if (venue && !badges.has(venue.id)) badges.set(venue.id, label);
  };

  const reviewed = venues.filter(
    (v) => v.rating_rata !== null && v.jumlah_ulasan >= MIN_REVIEWS_FOR_BADGE,
  );
  assign(
    [...reviewed].sort((a, b) => (b.rating_rata ?? 0) - (a.rating_rata ?? 0))[0],
    'Rating tertinggi',
  );
  assign([...reviewed].sort((a, b) => b.jumlah_ulasan - a.jumlah_ulasan)[0], 'Favorit penyewa');
  assign([...venues].sort((a, b) => a.harga_per_jam - b.harga_per_jam)[0], 'Termurah');
  return badges;
}
