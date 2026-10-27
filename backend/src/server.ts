import { createApp } from './app.ts';
import { env, isBeforeMode } from './config/env.ts';

const BEFORE_MODE_WARNING = `
  ╔══════════════════════════════════════════════════════════════════╗
  ║  MODE BEFORE AKTIF — celah keamanan disengaja dinyalakan.        ║
  ║  Hanya untuk pengujian lokal dengan data dummy. JANGAN di-deploy. ║
  ║  Server hanya mendengar di 127.0.0.1.                            ║
  ╚══════════════════════════════════════════════════════════════════╝`;

const app = createApp();

// [VULN-A04] Mode before: server hanya HTTP tanpa paksaan HTTPS, sehingga password dan
// token JWT dikirim sebagai teks biasa. Mode after: lihat [FIXED-A04] di middleware/security.ts.
app.listen(env.port, env.host, () => {
  console.log(
    `Venu API berjalan di http://${env.host}:${env.port} — mode ${env.securityMode.toUpperCase()}`,
  );
  if (isBeforeMode) console.warn(BEFORE_MODE_WARNING);
});
