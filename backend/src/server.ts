import { createApp } from './app.ts';
import { env } from './config/env.ts';

const app = createApp();

// [VULN-A04] Server hanya HTTP tanpa paksaan HTTPS: password dan token JWT
// dikirim dalam bentuk teks biasa dan bisa disadap di jaringan.
app.listen(env.port, () => {
  console.log(`Venu API berjalan di http://localhost:${env.port}`);
});
