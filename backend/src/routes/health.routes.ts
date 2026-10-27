import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/ping', (_req, res) => {
  res.json({ status: 'ok', message: 'pong' });
});
