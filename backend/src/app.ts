import express, { type Express } from 'express';
import cors from 'cors';
import { errorHandler, notFoundHandler } from './middleware/error-handler.ts';
import { authRouter } from './modules/auth/auth.routes.ts';
import { healthRouter } from './modules/health/health.routes.ts';
import { userRouter } from './modules/users/user.routes.ts';

export function createApp(): Express {
  const app = express();

  // [VULN-A02] CORS terbuka total: origin mana pun boleh memanggil API ini.
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use('/auth', authRouter);
  app.use(userRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
