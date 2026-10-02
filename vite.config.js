import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Sweetie Batter admin — served at <website>/admin/ (vercel.json rewrite in
// the FE repo; in dev the FE server proxies /admin to this server on :5174).
// Build keeps relative paths so the same dist works at / and at /admin/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/admin/' : './',
  server: {
    port: 5174,
    strictPort: true,
    hmr: { clientPort: 5174 }, // hot reload straight to this server, not via the proxy
  },
  build: { outDir: 'dist', chunkSizeWarningLimit: 700 },
}));
