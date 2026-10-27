import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5] as const;

/** Rata-rata rating + jumlah ulasan. Bintang emas dipakai sebagai ikon, bukan teks. */
export function RatingSummary({ rating, count }: { rating: number | null; count: number }) {
  if (rating === null || count === 0) {
    return <span className="text-sm text-muted">Belum ada ulasan</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-sm text-navy-900">
      <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden />
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
          className={`size-4 ${star <= rating ? 'fill-gold-500 text-gold-500' : 'text-line'}`}
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
          className="flex size-11 items-center justify-center rounded-sm hover:bg-gold-100"
        >
          <Star
            className={`size-6 ${star <= value ? 'fill-gold-500 text-gold-500' : 'text-muted'}`}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
