import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import PriceTag from '../components/PriceTag.jsx';
import { BADGES, resolveImg, uid } from '../lib/format.js';
import {
  Text, TextArea, Toggle, PriceInput, TintPicker, BadgePicker, EmojiInput, ImagePicker, Field,
} from './fields.jsx';
import { Icon, IconBtn } from './icons.jsx';
import { move } from './list.js';

export const blankItem = () => ({
  id: uid(), name: '', desc: '', price: '', emoji: '🍰', tint: 'cream', img: null,
});

/* Renders the real catalog card, themed like the section it lives in. */
export function CardPreview({ item, theme }) {
  const card = (
    <div className="adm-preview-grid">
      <ProductCard key={item.img || 'none'} item={{ ...item, name: item.name || 'Nama produk', price: item.price || 'Rp 0K' }} />
    </div>
  );
  return theme ? (
    <div id="seasonal" className={`theme-${theme} adm-season-preview`}>{card}</div>
  ) : (
    <div className="adm-menu-preview">{card}</div>
  );
}

export function ItemModal({ item, groups, groupIndex, theme, onSave, onClose }) {
  const [form, setForm] = useState(item);
  const [gi, setGi] = useState(groupIndex ?? 0);
  const [tried, setTried] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const errors = [];
  if (!form.name?.trim()) errors.push('Nama wajib diisi');
  if (!form.price?.trim()) errors.push('Harga wajib diisi');
  if (!form.emoji?.trim()) errors.push('Emoji wajib diisi (dipakai jika foto tidak ada)');

  const submit = (e) => {
    e.preventDefault();
    setTried(true);
    if (errors.length) return;
    const clean = { ...form, name: form.name.trim(), desc: form.desc?.trim() || '' };
    if (!clean.badge) delete clean.badge;
    if (!clean.hidden) delete clean.hidden;
    onSave(clean, gi);
  };

  return (
    <div className="adm-modal-backdrop">
      <form className="adm-modal adm-modal--item" onSubmit={submit} role="dialog" aria-label="Edit item">
        <div className="adm-modal-head">
          <h3>{item.name ? `Edit: ${item.name}` : 'Item baru'}</h3>
          <IconBtn icon="x" label="Tutup" onClick={onClose} size={18} />
        </div>

        <div className="adm-modal-body adm-item-layout">
          <div className="adm-form">
            <Text label="Nama produk" required value={form.name} onChange={(v) => set({ name: v })}
              limit={28} placeholder="mis. Lotus Biscoff" wide />
            <TextArea label="Deskripsi singkat" value={form.desc} onChange={(v) => set({ desc: v })}
              limit={70} rows={2} placeholder="mis. Biscoff spread cream, caramel cookie crunch"
              hint="± 1–2 baris di kartu. Tulis rasa / tekstur utama." />
            <PriceInput value={form.price} onChange={(v) => set({ price: v })} />

            <ImagePicker value={form.img} onChange={(v) => set({ img: v })} tint={form.tint} emoji={form.emoji} />
            <EmojiInput value={form.emoji} onChange={(v) => set({ emoji: v })}
              hint="Tampil kalau tidak ada foto / foto gagal dimuat." />
            <TintPicker value={form.tint} onChange={(v) => set({ tint: v })} />
            <BadgePicker value={form.badge} onChange={(v) => set({ badge: v })} />
            {groups && groups.length > 1 && (
              <Field label="Grup">
                <select className="adm-input" value={gi} onChange={(e) => setGi(Number(e.target.value))}>
                  {groups.map((g, i) => <option key={i} value={i}>{g.heading || `Grup ${i + 1} (tanpa judul)`}</option>)}
                </select>
              </Field>
            )}
            <Toggle checked={form.hidden} onChange={(v) => set({ hidden: v })}
              label="Sembunyikan dari website" hint="Mis. stok habis — data tetap tersimpan." />
          </div>

          <aside className="adm-item-preview">
            <span className="adm-field-label">Preview di website</span>
            <CardPreview item={form} theme={theme} />
          </aside>
        </div>

        <div className="adm-modal-foot">
          {tried && errors.length > 0 && <span className="adm-hint warn">{errors.join(' · ')}</span>}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="adm-btn adm-btn--primary">Simpan item</button>
        </div>
      </form>
    </div>
  );
}

/* One row per product: thumb · name/desc · price · badge · actions. */
export function ItemList({ items, onChange, onEdit, onAdd }) {
  const patch = (i, fn) => onChange(items.map((x, j) => (j === i ? fn(x) : x)));
  return (
    <div className="adm-items">
      {items.length === 0 && <p className="adm-empty-row">Belum ada produk di sini.</p>}
      {items.map((it, i) => {
        const src = resolveImg(it.img);
        const badge = BADGES[it.badge];
        return (
          <div key={it.id || i} className={`adm-item${it.hidden ? ' is-hidden' : ''}`}>
            <button type="button" className={`adm-item-thumb sb-card-img ${it.tint || ''}`} onClick={() => onEdit(i)}
              aria-label={`Edit ${it.name}`}>
              <span>{it.emoji}</span>
              {src && <img src={src} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
            </button>
            <button type="button" className="adm-item-main" onClick={() => onEdit(i)}>
              <strong>{it.name || '(tanpa nama)'}</strong>
              <span className="adm-item-desc">{it.desc || '—'}</span>
            </button>
            <div className="adm-item-price"><PriceTag price={it.price || ''} className="sb-price--sm" /></div>
            <div className="adm-item-tags">
              {it.hidden
                ? <span className="adm-tag adm-tag--muted"><Icon name="eyeOff" size={12} /> Disembunyikan</span>
                : badge && <span className={`adm-tag${badge.cls ? ' adm-tag--best' : ''}`}>{badge.label}</span>}
            </div>
            <div className="adm-item-actions">
              <IconBtn icon="pencil" label="Edit" onClick={() => onEdit(i)} />
              <IconBtn icon="up" label="Naikkan" disabled={i === 0} onClick={() => onChange(move(items, i, -1))} />
              <IconBtn icon="down" label="Turunkan" disabled={i === items.length - 1} onClick={() => onChange(move(items, i, 1))} />
              <IconBtn icon={it.hidden ? 'eyeOff' : 'eye'} label={it.hidden ? 'Tampilkan di website' : 'Sembunyikan dari website'}
                onClick={() => patch(i, (x) => ({ ...x, hidden: !x.hidden || undefined }))} />
              <IconBtn icon="copy" label="Duplikat"
                onClick={() => onChange([...items.slice(0, i + 1), { ...it, id: uid(), name: `${it.name} (copy)` }, ...items.slice(i + 1)])} />
              <IconBtn icon="trash" label="Hapus" danger
                onClick={() => window.confirm(`Hapus "${it.name}"?`) && onChange(items.filter((_, j) => j !== i))} />
            </div>
          </div>
        );
      })}
      <button type="button" className="adm-btn adm-btn--dashed" onClick={onAdd}>
        <Icon name="plus" size={14} /> Tambah produk
      </button>
    </div>
  );
}
