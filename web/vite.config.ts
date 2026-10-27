import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 127.0.0.1 (bukan localhost): backend mode before hanya mendengar di alamat IPv4 lokal ini.
const API_TARGET = 'http://127.0.0.1:4000';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Saat development, request ke /api dan /uploads diteruskan ke backend Express.
    // Browser melihatnya sebagai satu origin, sehingga tidak bergantung pada CORS.
    proxy: {
      '/api': { target: API_TARGET, rewrite: (path) => path.replace(/^\/api/, '') },
      '/uploads': { target: API_TARGET },
    },
  },
});
