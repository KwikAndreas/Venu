import { isBeforeMode } from '../../config/env.ts';
import { withTransaction } from '../../db/transaction.ts';
import { CONTENT_TYPES, PROOF_TYPES, type FileExtension } from '../../lib/file-type.ts';
import { HttpError } from '../../lib/http-error.ts';
import type { AuthUser } from '../../lib/jwt.ts';
import { removeUpload, resolveUpload, saveUpload } from '../../lib/storage.ts';
import type { PaymentMethod } from '../../types/status.ts';
import { lockOwnBooking } from '../bookings/booking.repository.ts';
import {
  findPaymentProofAccess,
  hasActivePayment,
  insertPayment,
  type Payment,
} from './payment.repository.ts';

export type PaymentSubmission = {
  bookingId: number;
  metode: PaymentMethod;
  bukti: Buffer;
};

export type ProofFile = {
  path: string;
  contentType: string;
};

/**
 * Pembayaran simulasi: penyewa memilih metode dan mengunggah bukti bayar. Status awal
 * "menunggu" sampai pemilik memverifikasi (CP5). Jumlah selalu diambil dari booking di server.
 */
export async function submitPayment(
  userId: number,
  submission: PaymentSubmission,
): Promise<Payment> {
  // File diverifikasi dan disimpan lebih dulu; bila langkah database gagal, file dihapus lagi.
  const saved = await saveUpload('payments', submission.bukti, PROOF_TYPES);
  try {
    return await withTransaction(async (client) => {
      const booking = await lockOwnBooking(client, submission.bookingId, userId);
      if (!booking) throw new HttpError(404, 'Booking tidak ditemukan');
      if (booking.status !== 'menunggu') {
        throw new HttpError(409, 'Booking ini tidak sedang menunggu pembayaran');
      }
      if (await hasActivePayment(client, booking.id)) {
        throw new HttpError(409, 'Pembayaran untuk booking ini sudah dikirim');
      }

      return insertPayment(client, {
        bookingId: booking.id,
        jumlah: booking.total_harga,
        metode: submission.metode,
        buktiKey: saved.key,
      });
    });
  } catch (error) {
    await removeUpload(saved.key);
    throw error;
  }
}

/** Bukti bayar hanya boleh dilihat oleh penyewa yang membayar, pemilik lapangan, dan admin. */
export async function getPaymentProof(user: AuthUser, paymentId: number): Promise<ProofFile> {
  const access = await findPaymentProofAccess(paymentId);
  if (!access?.bukti_url) throw new HttpError(404, 'Bukti bayar tidak ditemukan');

  if (isBeforeMode) {
    // [VULN-A01] IDOR: siapa pun yang login bisa mengunduh bukti bayar milik orang lain
    // (berisi data pembayaran pribadi) hanya dengan menebak ID (GET /payments/123/proof).
  } else {
    // [FIXED-A01] Hanya penyewa yang membayar, pemilik lapangan, dan admin yang boleh melihat.
    const allowed =
      user.role === 'admin' || user.id === access.payer_id || user.id === access.owner_id;
    if (!allowed) throw new HttpError(404, 'Bukti bayar tidak ditemukan');
  }

  const extension = access.bukti_url.split('.').pop() as FileExtension;
  return { path: resolveUpload(access.bukti_url), contentType: CONTENT_TYPES[extension] };
}
