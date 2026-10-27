import { MessageSquare, Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAuth } from '../../auth/auth-context.ts';
import { useToast } from '../../components/toast/toast-context.ts';
import { Button } from '../../components/ui/Button.tsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { TextAreaField } from '../../components/ui/Field.tsx';
import { Card } from '../../components/ui/Layout.tsx';
import { ConfirmDialog } from '../../components/ui/Modal.tsx';
import { IconAction } from '../../components/ui/Table.tsx';
import { StarDisplay, StarInput } from '../../components/venue/StarRating.tsx';
import { useApi } from '../../hooks/useApi.ts';
import { api, toApiError } from '../../lib/api.ts';
import { formatDateTime } from '../../lib/format.ts';
import type { Review } from '../../lib/types.ts';

const MAX_COMMENT_LENGTH = 1000;

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
      setKomentar('');
      showToast('Terima kasih, ulasan Anda tersimpan.', 'success');
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
        <h3 className="type-h3 text-navy-900">Tulis ulasan</h3>
        <StarInput value={rating} onChange={setRating} />
        <TextAreaField
          label="Komentar (opsional)"
          maxLength={MAX_COMMENT_LENGTH}
          value={komentar}
          onChange={(event) => setKomentar(event.target.value)}
          error={error}
          hint="Ulasan hanya bisa diberikan setelah Anda bermain di lapangan ini."
        />
        <Button type="submit" variant="secondary" loading={submitting}>
          Kirim Ulasan
        </Button>
      </form>
    </Card>
  );
}

export function VenueReviews({ venueId, onChanged }: { venueId: number; onChanged: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { data, error, reload } = useApi<{ reviews: Review[] }>(`/venues/${venueId}/reviews`);
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
    <section id="ulasan" aria-labelledby="judul-ulasan" className="scroll-mt-24 space-y-5">
      <h2 id="judul-ulasan" className="type-h2 text-navy-900">
        Ulasan
      </h2>

      {user?.role === 'penyewa' && <ReviewForm venueId={venueId} onCreated={refresh} />}

      {error ? (
        <ErrorState message={error.message} onRetry={reload} />
      ) : !data ? (
        <Skeleton className="h-24 w-full" />
      ) : data.reviews.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Belum ada ulasan"
          description="Jadilah yang pertama memberi ulasan."
        />
      ) : (
        <ul className="space-y-3">
          {data.reviews.map((review) => (
            <li key={review.id}>
              <Card className="flex gap-4 p-5">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-semibold text-navy-900">{review.nama_user}</span>
                    <StarDisplay rating={review.rating} />
                    <span className="text-xs text-muted">{formatDateTime(review.created_at)}</span>
                  </div>
                  {/* Komentar ditampilkan sebagai teks biasa; React meng-escape HTML di dalamnya. */}
                  {review.komentar && (
                    <p className="mt-2 text-sm text-navy-900">{review.komentar}</p>
                  )}
                </div>
                {canDelete(review) && (
                  <IconAction
                    icon={Trash2}
                    label="Hapus ulasan"
                    tone="danger"
                    onClick={() => setToDelete(review)}
                  />
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== undefined}
        title="Hapus ulasan?"
        message="Ulasan yang dihapus tidak bisa dikembalikan."
        confirmLabel="Hapus"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </section>
  );
}
