import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/auth-context.ts';
import { useToast } from '../../components/toast/toast-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { TextAreaField } from '../../components/ui/Field.tsx';
import { Card } from '../../components/ui/Layout.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { IconAction } from '../../components/ui/Table.tsx';
import { StarDisplay, StarInput } from '../../components/venue/StarRating.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { hasEnded } from '../../lib/booking-stage.ts';
import { formatDateTime } from '../../lib/format.ts';
import { IS_BEFORE_MODE } from '../../lib/security-mode.ts';
import type { BookingSummary, Review } from '../../lib/types.ts';

const MAX_COMMENT_LENGTH = 1000;

/**
 * Menampilkan komentar ulasan.
 * [VULN-A05] Mode before: komentar dirender sebagai HTML mentah lewat dangerouslySetInnerHTML,
 * sehingga skrip yang disimpan penyewa (mis. <img src=x onerror=alert(document.cookie)>) ikut
 * dieksekusi di browser pengunjung lain (stored XSS). Backend juga tidak menyaring input ini.
 * [FIXED-A05] Mode after: komentar dirender sebagai teks biasa; React otomatis meng-escape HTML.
 */
function ReviewComment({ komentar }: { komentar: string }) {
  if (IS_BEFORE_MODE) {
    return <p className="mt-1.5 text-fg" dangerouslySetInnerHTML={{ __html: komentar }} />;
  }
  return <p className="mt-1.5 text-fg">{komentar}</p>;
}

function ReviewForm({ venueId, onCreated }: { venueId: number; onCreated: () => void }) {
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(undefined);
    setSubmitting(true);
    try {
      await api.post(`/venues/${venueId}/reviews`, {
        rating,
        komentar: komentar.trim() || undefined,
      });
      showToast('Terima kasih, ulasanmu sudah tayang.', 'success');
      onCreated();
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="type-h3 text-fg">Bagaimana pengalamanmu bermain di sini?</h3>
        <StarInput value={rating} onChange={setRating} />
        <TextAreaField
          label="Ceritakan singkat (opsional)"
          maxLength={MAX_COMMENT_LENGTH}
          value={komentar}
          onChange={(event) => setKomentar(event.target.value)}
          error={error}
        />
        <Button type="submit" loading={submitting}>
          Kirim ulasan
        </Button>
      </form>
    </Card>
  );
}

/**
 * Form ulasan hanya tampil bagi penyewa yang sudah selesai bermain di lapangan ini
 * dan belum pernah memberi ulasan; aturan yang sama tetap dicek ulang backend.
 */
function useCanReview(venueId: number, reviews: Review[] | undefined): boolean {
  const { user } = useAuth();
  const isRenter = user?.role === 'penyewa';
  const { data } = useApi<{ bookings: BookingSummary[] }>(
    isRenter ? '/bookings/mine' : null,
    `user:${user?.id ?? ''}`,
  );
  if (!isRenter || !reviews || !data) return false;
  const played = data.bookings.some(
    (b) => b.venue_id === venueId && ['dikonfirmasi', 'selesai'].includes(b.status) && hasEnded(b),
  );
  return played && !reviews.some((review) => review.user_id === user.id);
}

export function VenueReviews({ venueId, onChanged }: { venueId: number; onChanged: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, error, reload } = useApi<{ reviews: Review[] }>(`/venues/${venueId}/reviews`);
  const canReview = useCanReview(venueId, data?.reviews);
  const [toDelete, setToDelete] = useState<Review>();
  const [deleting, setDeleting] = useState(false);

  const refresh = () => {
    reload();
    onChanged();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/reviews/${toDelete.id}`);
      showToast('Ulasan dihapus.', 'success');
      setToDelete(undefined);
      refresh();
    } catch (caught) {
      showToast(toApiError(caught).message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = (review: Review) =>
    user !== null && (user.role === 'admin' || user.id === review.user_id);

  return (
    <section id="ulasan" aria-labelledby="judul-ulasan" className="scroll-mt-24 space-y-4">
      <h2 id="judul-ulasan" className="type-h2 text-fg">
        Ulasan
        {data && data.reviews.length > 0 && (
          <span className="text-muted"> · {data.reviews.length}</span>
        )}
      </h2>

      {canReview && <ReviewForm venueId={venueId} onCreated={refresh} />}

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-20 w-full" />
      ) : data.reviews.length === 0 ? (
        <p className="text-muted">Belum ada ulasan untuk lapangan ini.</p>
      ) : (
        <ul className="divide-y divide-line">
          {data.reviews.map((review) => (
            <li key={review.id} className="flex gap-4 py-4 first:pt-0">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-semibold text-fg">{review.nama_user}</span>
                  <StarDisplay rating={review.rating} />
                  <span className="text-xs text-muted">{formatDateTime(review.created_at)}</span>
                </div>
                {review.komentar && <ReviewComment komentar={review.komentar} />}
              </div>
              {canDelete(review) && (
                <IconAction
                  icon={Trash2}
                  label="Hapus ulasan"
                  tone="danger"
                  onClick={() => setToDelete(review)}
                />
              )}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== undefined}
        title="Hapus ulasan ini?"
        message="Ulasan yang dihapus tidak bisa dikembalikan."
        confirmLabel="Hapus"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </section>
  );
}
