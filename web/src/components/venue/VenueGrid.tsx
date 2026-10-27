import type { Venue } from '../../lib/types.ts';
import { Skeleton } from '../ui/Feedback.tsx';
import { VenueCard } from './VenueCard.tsx';

const GRID_CLASSES = 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';

export function VenueGrid({ venues, tanggal }: { venues: Venue[]; tanggal?: string }) {
  return (
    <div className={GRID_CLASSES}>
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} tanggal={tanggal} />
      ))}
    </div>
  );
}

export function VenueGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID_CLASSES} aria-label="Memuat lapangan">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border border-line bg-surface">
          <Skeleton className="aspect-video rounded-none" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
