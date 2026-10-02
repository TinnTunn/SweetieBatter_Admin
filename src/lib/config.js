/* Admin configuration — values come from .env.local (see .env.example). */
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const IMAGE_BUCKET = 'menu-images';

/* The public website (SweetieBatter_Web). Photos bundled with the site are
   stored as relative paths ('assets/products/x.jpg') and resolved against
   this URL; it is also where "Lihat website" points. The admin is served at
   <website>/admin/, so in production the default '/' is the website root. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || (import.meta.env.DEV ? 'http://localhost:5173/' : '/')
).replace(/\/?$/, '/');

/* Without Supabase keys, `npm run dev` runs in local demo mode: edits are
   saved to this browser's localStorage only (the website won't see them). */
export const LOCAL_MODE = !isConfigured && import.meta.env.DEV;
export const LOCAL_DB_KEY = 'sb-local-sections';

export function readLocalSections() {
  try {
    const raw = localStorage.getItem(LOCAL_DB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
