import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5] as const;

/** Rata-rata rating + jumlah ulasan. Bintang Volt dipakai sebagai ikon, bukan teks. */
export function RatingSummary({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return <span className="text-sm text-muted">Belum ada ulasan</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-fg">
      <Star className="size-4 fill-volt text-volt" aria-hidden />
      <span className="font-semibold">{rating.toFixed(1)}</span>
      <span className="text-muted">({count} ulasan)</span>
    </span>
  );
}

export function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Rating ${rating} dari 5`}>
      {STARS.map((star) => (
        <Star
          key={star}
          className={`size-4 ${star <= rating ? 'fill-volt text-volt' : 'text-line'}`}
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
          className="flex size-11 items-center justify-center rounded-sm hover:bg-surface-2"
        >
          <Star
            className={`size-6 ${star <= value ? 'fill-volt text-volt' : 'text-muted'}`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
