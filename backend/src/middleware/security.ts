import type { Express, RequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, isBeforeMode } from '../config/env.ts';

/** Di belakang reverse proxy (produksi), alihkan request HTTP biasa ke HTTPS. */
const requireHttps: RequestHandler = (req, res, next) => {
  if (req.secure) {
    next();
    return;
  }
  res.redirect(308, `https://${req.hostname}${req.originalUrl}`);
};

/** Middleware lapisan HTTP yang berbeda antara mode before dan after. */
export function applySecurityMiddleware(app: Express): void {
  if (isBeforeMode) {
    // [VULN-A02] CORS terbuka total: origin mana pun boleh memanggil API ini.
    // [VULN-A02] Tanpa header keamanan, dan X-Powered-By membocorkan teknologi server.
    app.use(cors());
    return;
  }

  // [FIXED-A02] Header keamanan (CSP, HSTS, nosniff, frame-ancestors, dll.) lewat helmet,
  // X-Powered-By dimatikan, dan CORS hanya untuk origin web yang terdaftar di CORS_ORIGINS.
  app.disable('x-powered-by');
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cors({ origin: env.corsOrigins }));

  if (env.isProduction) {
    // [FIXED-A04] Produksi wajib HTTPS (dengan HSTS dari helmet). Lokal tetap HTTP untuk development.
    app.set('trust proxy', 1);
    app.use(requireHttps);
  }
}
