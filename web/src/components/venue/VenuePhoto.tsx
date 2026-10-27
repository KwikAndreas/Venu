import { CircleDot, Feather, Goal, type LucideIcon } from 'lucide-react';
import { SPORT_LABELS } from '../../lib/format.ts';
import type { Sport } from '../../lib/types.ts';

const SPORT_ICONS: Record<Sport, LucideIcon> = {
  futsal: Goal,
  badminton: Feather,
  basket: CircleDot,
};

type VenuePhotoProps = {
  fotoUrl: string | null;
  nama: string;
  sport: Sport;
  className?: string;
};

/** Foto rasio 16:9. Tanpa foto, tampil panel Navy berikon sebagai pengganti. */
export function VenuePhoto({ fotoUrl, nama, sport, className = '' }: VenuePhotoProps) {
  if (fotoUrl) {
    return (
      <img
        src={fotoUrl}
        alt={`Foto ${nama}`}
        loading="lazy"
        className={`aspect-video w-full bg-navy-50 object-cover ${className}`}
      />
    );
  }

  const Icon = SPORT_ICONS[sport];
  return (
    <div
      role="img"
      aria-label={`Belum ada foto untuk ${nama}`}
      className={`flex aspect-video w-full flex-col items-center justify-center gap-2 bg-navy-800 ${className}`}
    >
      <Icon className="size-10 text-gold-300" strokeWidth={1.25} aria-hidden />
      <span className="type-caption text-ivory/70">{SPORT_LABELS[sport]}</span>
    </div>
  );
}
