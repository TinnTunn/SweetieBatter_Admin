/* Content-format rules — the contract between this admin and the website
   (SweetieBatter_Web/src/lib/format.js). BADGES and TINTS must match the
   website CSS, so admin input always renders correctly on the catalog. */

/* ─── Badges (sticker on the card photo) ─────────────────────────────── */
export const BADGES = {
  bestseller: { cls: 'bestseller', label: '★ Bestseller' },
  Signature:  { cls: 'bestseller', label: '✦ Signature' },
  new:        { cls: '',           label: 'New!' },
  limited:    { cls: '',           label: 'Limited' },
};

/* ─── Tints (card background behind photo / emoji) — see index.css ──── */
export const TINTS = [
  { id: 'cream',  label: 'Cream',  swatch: 'linear-gradient(135deg, #F8EFD5, #E8D9B0)' },
  { id: 'choco',  label: 'Choco',  swatch: 'linear-gradient(135deg, #C9A47F, #8B6B4F)' },
  { id: 'matcha', label: 'Matcha', swatch: 'linear-gradient(135deg, #DDE7B8, #C6D89A)' },
  { id: 'pink',   label: 'Pink',   swatch: 'linear-gradient(135deg, #F3D5D2, #E8A8A8)' },
  { id: 'taro',   label: 'Taro',   swatch: 'linear-gradient(135deg, #DCC6E5, #B294C2)' },
  { id: 'lemon',  label: 'Lemon',  swatch: 'linear-gradient(135deg, #F7E59B, #E8C760)' },
];

/* ─── Price strings ──────────────────────────────────────────────────────
   PriceTag renders:  [Start from] Rp 24K [/ 3 pcs]
   Canonical format:  "Start from Rp 85K" | "Rp 24K / 3 pcs" | "Rp 125K"   */
const PRICE_RE = /^(?:(Start from|From)\s+)?Rp\s?(\d+(?:[.,]\d+)?)\s?K(?:\s*\/\s*(.+))?$/i;

export function parsePrice(str = '') {
  const m = String(str).trim().match(PRICE_RE);
  if (!m) return null;
  return { from: !!m[1], amount: m[2].replace(',', '.'), unit: (m[3] || '').trim() };
}

export function composePrice({ from, amount, unit }) {
  const a = String(amount ?? '').trim();
  if (!a) return '';
  const u = String(unit ?? '').trim();
  return `${from ? 'Start from ' : ''}Rp ${a}K${u ? ` / ${u}` : ''}`;
}

/* ─── Images ─────────────────────────────────────────────────────────── */
let assetRoot = import.meta.env.BASE_URL;
/* Relative photo paths live on the website, so main.jsx points this at
   SITE_URL. */
export const setAssetRoot = (root) => { assetRoot = root; };

export function resolveImg(img) {
  if (!img) return null;
  if (/^(https?:|data:|blob:)/.test(img)) return img;
  return assetRoot + img.replace(/^\.?\//, '');
}

/* ─── Misc ───────────────────────────────────────────────────────────── */
export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random())).slice(0, 8);

export const slugify = (s) =>
  String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '')
    .trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
