import { join } from 'node:path';
import express, { type Express } from 'express';
import cors from 'cors';
import { UPLOAD_ROOT } from './lib/storage.ts';
import { errorHandler, notFoundHandler } from './middleware/error-handler.ts';
import { authRouter } from './modules/auth/auth.routes.ts';
import { bookingRouter } from './modules/bookings/booking.routes.ts';
import { healthRouter } from './modules/health/health.routes.ts';
import { paymentRouter } from './modules/payments/payment.routes.ts';
import { userRouter } from './modules/users/user.routes.ts';
import { venueRouter } from './modules/venues/venue.routes.ts';

export function createApp(): Express {
  const app = express();

  // [VULN-A02] CORS terbuka total: origin mana pun boleh memanggil API ini.
  app.use(cors());
  app.use(express.json());

  // Foto lapangan bersifat publik. Bukti bayar (uploads/payments) TIDAK disajikan statis;
  // aksesnya lewat GET /payments/:id/proof yang memeriksa hak akses.
  app.use(
    '/uploads/venues',
    express.static(join(UPLOAD_ROOT, 'venues'), {
      index: false,
      dotfiles: 'deny',
      setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
    }),
  );

  app.use(healthRouter);
  app.use('/auth', authRouter);
  app.use(userRouter);
  app.use('/venues', venueRouter);
  app.use(bookingRouter);
  app.use(paymentRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
