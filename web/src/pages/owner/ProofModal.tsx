import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { buttonClasses } from '../../components/ui/styles.ts';
import { api, toApiError } from '../../lib/api.ts';

type ProofFile =
  { paymentId: number; url: string; type: string } | { paymentId: number; error: string };

/**
 * Bukti bayar butuh token, jadi tidak bisa langsung dipasang di <img src>. File diambil lewat
 * fetch sebagai Blob, lalu ditampilkan memakai object URL yang dibersihkan saat modal ditutup.
 */
export function ProofModal({
  paymentId,
  onClose,
}: {
  paymentId: number | undefined;
  onClose: () => void;
}) {
  const [proof, setProof] = useState<ProofFile>();

  useEffect(() => {
    if (paymentId === undefined) return;
    let objectUrl: string | undefined;
    let cancelled = false;
    api.blob(`/payments/${paymentId}/proof`).then(
      (blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setProof({ paymentId, url: objectUrl, type: blob.type });
      },
      (error: unknown) => {
        if (!cancelled) setProof({ paymentId, error: toApiError(error).message });
      },
    );
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [paymentId]);

  const current = proof?.paymentId === paymentId ? proof : undefined;

  return (
    <Modal open={paymentId !== undefined} title="Bukti bayar" onClose={onClose} wide>
      {!current ? (
        <Skeleton className="aspect-video w-full" />
      ) : 'error' in current ? (
        <ErrorState message={current.error} />
      ) : current.type.startsWith('image/') ? (
        <img
          src={current.url}
          alt="Bukti bayar dari penyewa"
          className="max-h-[60vh] w-full rounded-xl border border-line object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <FileText className="size-10 text-muted" aria-hidden />
          <p className="text-sm text-muted">Bukti bayar berupa dokumen PDF.</p>
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses('secondary')}
          >
            Buka PDF
          </a>
        </div>
      )}
    </Modal>
  );
}
