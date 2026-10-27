import { Router } from 'express';
import { HttpError } from '../../lib/http-error.ts';
import { parseIdParam, requireString } from '../../lib/request.ts';
import { getAuthUser, requireAuth, requireRole } from '../../middleware/auth.ts';
import { requireUploadedFile, uploadSingleFile } from '../../middleware/upload.ts';
import { PAYMENT_METHODS, isPaymentMethod } from '../../types/status.ts';
import { getPaymentProof, submitPayment } from './payment.service.ts';

export const paymentRouter = Router();

// multipart/form-data: field "metode" + file "bukti" (jpg/png/webp/pdf, maks 2 MB)
paymentRouter.post(
  '/bookings/:id/payment',
  requireAuth,
  requireRole('penyewa'),
  uploadSingleFile('bukti'),
  async (req, res) => {
    const metode = requireString(req.body, 'metode');
    if (!isPaymentMethod(metode)) {
      throw new HttpError(400, `Field "metode" harus salah satu: ${PAYMENT_METHODS.join(', ')}`);
    }

    const payment = await submitPayment(getAuthUser(req).id, {
      bookingId: parseIdParam(req.params.id),
      metode,
      bukti: requireUploadedFile(req.file, 'bukti'),
    });
    res.status(201).json({ payment });
  },
);

paymentRouter.get('/payments/:id/proof', requireAuth, async (req, res) => {
  const proof = await getPaymentProof(getAuthUser(req), parseIdParam(req.params.id));
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.type(proof.contentType).sendFile(proof.path);
});
