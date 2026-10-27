import express, { type Express } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.ts';

export function createApp(): Express {
  const app = express();

  // [VULN-A02] CORS terbuka total: origin mana pun boleh memanggil API ini.
  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);

  return app;
}
