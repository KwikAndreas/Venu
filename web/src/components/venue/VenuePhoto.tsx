import { SPORT_LABELS } from '../../lib/format.ts';
import type { Sport } from '../../lib/types.ts';

const SPORT_CODES: Record<Sport, string> = {
  futsal: 'FUT',
  badminton: 'BDM',
  basket: 'BSK',
};

type VenuePhotoProps = {
  fotoUrl: string | null;
  nama: string;
  sport: Sport;
  className?: string;
  /** Ukuran kode olahraga pada placeholder. */
  compact?: boolean;
};

/** Foto rasio 16:9. Tanpa foto: panel bergaris diagonal dengan kode olahraga besar (DESIGN.md §6). */
export function VenuePhoto({
  fotoUrl,
  nama,
  sport,
  className = '',
  compact = false,
}: VenuePhotoProps) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={`Foto ${nama}`}
        loading="lazy"
        className={`aspect-video w-full bg-surface-2 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Belum ada foto untuk ${nama} (${SPORT_LABELS[sport]})`}
      className={`stripes relative flex aspect-video w-full items-center justify-center overflow-hidden bg-surface-2 ${className}`}
    >
      <span
        aria-hidden
        className={`font-display font-extrabold italic uppercase leading-none text-fg/15 ${compact ? 'text-2xl' : 'text-7xl md:text-8xl'}`}
      >
        {SPORT_CODES[sport]}
      </span>
    </div>
  );
}
