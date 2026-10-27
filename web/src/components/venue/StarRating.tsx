import { Star } from 'lucide-react';
import { formatRating } from '../../lib/format.ts';

const STARS = [1, 2, 3, 4, 5] as const;

/** "★ 4,8 (126)". Tanpa ulasan tidak menampilkan apa pun, agar tidak terlihat seperti rating nol. */
export function RatingSummary({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return null;
  }
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm">
      <Star className="size-3.5 fill-current text-fg" aria-hidden />
      <span className="font-bold text-fg">{formatRating(rating)}</span>
      <span className="text-muted">({count})</span>
      <span className="sr-only">ulasan</span>
    </span>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Rating ${rating} dari 5`}>
      {STARS.map((star) => (
        <Star
          key={star}
          className={`size-3.5 ${star <= rating ? 'fill-current text-fg' : 'text-line'}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Rating" className="flex gap-1">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} bintang`}
          onClick={() => onChange(star)}
          className="flex size-11 items-center justify-center rounded-full hover:bg-surface"
        >
          <Star
            className={`size-6 ${star <= value ? 'fill-current text-fg' : 'text-line'}`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
