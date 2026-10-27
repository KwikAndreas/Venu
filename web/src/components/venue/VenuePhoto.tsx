import { SPORT_LABELS } from '../../lib/format.ts';
import { SPORT_PLACEHOLDER } from '../../lib/sport-visual.ts';
import type { Sport } from '../../lib/types.ts';

type VenuePhotoProps = {
  fotoUrl: string | null;
  nama: string;
  sport: Sport;
  className?: string;
};

/** Foto lapangan; tanpa foto tampil gradasi lembut sesuai cabang olahraga (DESIGN.md §6). */
export function VenuePhoto({ fotoUrl, nama, sport, className = '' }: VenuePhotoProps) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={`Foto ${nama}`}
        loading="lazy"
        className={`w-full bg-surface object-cover ${className}`}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${nama}, lapangan ${SPORT_LABELS[sport].toLowerCase()} (belum ada foto)`}
      className={`w-full ${className}`}
      style={{ background: SPORT_PLACEHOLDER[sport] }}
    />
  );
}
