import { createClient } from '@supabase/supabase-js';
import {
  SUPABASE_URL, SUPABASE_KEY, isConfigured, LOCAL_MODE,
  IMAGE_BUCKET, LOCAL_DB_KEY, readLocalSections,
} from '../lib/config.js';
import { slugify } from '../lib/format.js';

/* Data access for the admin. Two backends with the same surface:
   - supabase: real login, `sections` table, `menu-images` bucket
   - local:    dev-only demo (no keys) — localStorage, no login;
               the website never sees these edits                  */

const sortRows = (rows) => [...rows].sort((a, b) => a.sort - b.sort);

/* Shrink photos before upload: max 1200px, keeps PNG transparency. */
async function prepareImage(file, maxSide = 1200, quality = 0.85) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise((r) => canvas.toBlob(r, type, quality));
  return { blob, ext: type === 'image/png' ? 'png' : 'jpg', type };
}

/* A password-reset email links back to /admin/#...&type=recovery (or an
   #error=... if the link expired). Read it before supabase-js consumes the
   hash, so the app can show the "new password" screen reliably. */
function readAuthRedirect() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  if (hash.get('type') === 'recovery') return { recovery: true };
  if (hash.get('error')) {
    const expired = hash.get('error_code') === 'otp_expired';
    const message = expired
      ? 'Link reset password sudah kedaluwarsa atau sudah dipakai. Minta link baru.'
      : hash.get('error_description') || 'Link tidak valid.';
    history.replaceState(null, '', window.location.pathname + window.location.search);
    return { error: message };
  }
  return {};
}

function supabaseStore() {
  const redirect = readAuthRedirect();
  const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, storageKey: 'sb-admin-auth' },
  });
  const must = ({ data, error }) => {
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    mode: 'supabase',
    recovery: !!redirect.recovery,
    authError: redirect.error || '',
    async getUser() {
      const { data } = await sb.auth.getSession();
      return data.session?.user ?? null;
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((event, session) => cb(session?.user ?? null, event));
      return () => data.subscription.unsubscribe();
    },
    async signIn(email, password) {
      must(await sb.auth.signInWithPassword({ email, password }));
    },
    async signOut() {
      await sb.auth.signOut();
    },
    /* Re-checks the current password first: protects an unattended
       logged-in browser and keeps the session "recent" for Supabase. */
    async changePassword(email, currentPassword, newPassword) {
      const check = await sb.auth.signInWithPassword({ email, password: currentPassword });
      if (check.error) throw new Error('Password lama salah.');
      must(await sb.auth.updateUser({ password: newPassword }));
    },
    async setNewPassword(newPassword) {
      must(await sb.auth.updateUser({ password: newPassword }));
    },
    async sendPasswordReset(email) {
      const redirectTo = window.location.origin + window.location.pathname;
      must(await sb.auth.resetPasswordForEmail(email, { redirectTo }));
    },
    async isAdmin() {
      return must(await sb.rpc('is_admin')) === true;
    },
    async listSections() {
      return must(await sb.from('sections').select('*').order('sort'));
    },
    async upsertSections(rows) {
      const clean = rows.map(({ id, kind, sort, visible, data }) => ({ id, kind, sort, visible, data }));
      return must(await sb.from('sections').upsert(clean).select());
    },
    async deleteSection(id) {
      must(await sb.from('sections').delete().eq('id', id));
    },
    async uploadImage(file) {
      const { blob, ext, type } = await prepareImage(file);
      const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'photo';
      const path = `${Date.now()}-${base}.${ext}`;
      must(await sb.storage.from(IMAGE_BUCKET).upload(path, blob, { contentType: type, upsert: false }));
      return sb.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
    },
    async listImages() {
      const files = must(await sb.storage.from(IMAGE_BUCKET).list('', {
        limit: 200, sortBy: { column: 'created_at', order: 'desc' },
      }));
      return files
        .filter((f) => f.id) // skip folder placeholders
        .map((f) => ({ name: f.name, url: sb.storage.from(IMAGE_BUCKET).getPublicUrl(f.name).data.publicUrl }));
    },
  };
}

function localStore() {
  const save = (rows) => localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(sortRows(rows)));
  return {
    mode: 'local',
    recovery: false,
    authError: '',
    async getUser() { return { email: 'demo@lokal' }; },
    onAuthChange() { return () => {}; },
    async signIn() {},
    async signOut() {},
    async changePassword() {},
    async setNewPassword() {},
    async sendPasswordReset() {},
    async isAdmin() { return true; },
    async listSections() { return sortRows(readLocalSections()); },
    async upsertSections(rows) {
      const all = readLocalSections();
      for (const r of rows) {
        const i = all.findIndex((x) => x.id === r.id);
        const row = { ...r, updated_at: new Date().toISOString() };
        if (i >= 0) all[i] = row; else all.push(row);
      }
      save(all);
      return rows;
    },
    async deleteSection(id) { save(readLocalSections().filter((r) => r.id !== id)); },
    async uploadImage(file) {
      // Demo only: small data URL so localStorage doesn't overflow
      const { blob } = await prepareImage(file, 700, 0.8);
      return new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
    },
    async listImages() { return []; },
  };
}

export const store = isConfigured ? supabaseStore() : LOCAL_MODE ? localStore() : null;
