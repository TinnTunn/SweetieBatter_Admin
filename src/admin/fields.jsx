import { useEffect, useRef, useState } from 'react';
import PriceTag from '../components/PriceTag.jsx';
import { BADGES, TINTS, parsePrice, composePrice, resolveImg } from '../lib/format.js';
import { BUNDLED_IMAGES } from './bundledImages.js';
import { store } from './store.js';
import { Icon, IconBtn } from './icons.jsx';

/* ─── Layout primitives ─────────────────────────────────────────────── */

export function Field({ label, hint, count, limit, children, wide }) {
  const over = limit && count > limit;
  return (
    <label className={`adm-field${wide ? ' adm-field--wide' : ''}`}>
      <span className="adm-field-label">
        {label}
        {limit ? <span className={`adm-count${over ? ' over' : ''}`}>{count}/{limit}</span> : null}
      </span>
      {children}
      {over ? (
        <span className="adm-hint warn">Terlalu panjang — teks bisa terpotong / tidak rapi di kartu.</span>
      ) : hint ? (
        <span className="adm-hint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Text({ label, hint, value, onChange, limit, placeholder, wide, required }) {
  const v = value ?? '';
  return (
    <Field label={required ? `${label} *` : label} hint={hint} count={[...v].length} limit={limit} wide={wide}>
      <input
        className="adm-input"
        value={v}
        placeholder={placeholder}
        maxLength={limit ? limit * 2 : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextArea({ label, hint, value, onChange, limit, placeholder, rows = 3 }) {
  const v = value ?? '';
  return (
    <Field label={label} hint={hint} count={[...v].length} limit={limit} wide>
      <textarea
        className="adm-input adm-textarea"
        rows={rows}
        value={v}
        placeholder={placeholder}
        maxLength={limit ? limit * 2 : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className="adm-toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="adm-toggle-track" aria-hidden="true"><span /></span>
      <span>
        <span className="adm-toggle-label">{label}</span>
        {hint && <span className="adm-hint">{hint}</span>}
      </span>
    </label>
  );
}

/* ─── Price ─────────────────────────────────────────────────────────────
   Builds the exact string PriceTag understands:
   "Rp 24K / 3 pcs" · "Start from Rp 85K" · "Rp 125K"                    */

const UNIT_SUGGESTIONS = ['2 pcs', '3 pcs', '4 pcs', '6 pcs', '9 pcs', '12 pcs', 'loaf', 'roll', 'box', 'jar', 'pack'];

export function PriceInput({ label = 'Harga', value, onChange, withUnit = true, withFrom = true, compact }) {
  const parsed = parsePrice(value);
  const [raw, setRaw] = useState(() => !!value && !parsed);
  const [parts, setParts] = useState(() => parsed || { from: false, amount: '', unit: '' });

  const set = (patch) => {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(composePrice(next));
  };

  const switchMode = () => {
    if (raw) {
      const p = parsePrice(value) || { from: false, amount: '', unit: '' };
      setParts(p);
      onChange(composePrice(p));
    }
    setRaw(!raw);
  };

  return (
    <div className={`adm-field adm-field--wide${compact ? ' adm-price--compact' : ''}`}>
      {!compact && (
        <span className="adm-field-label">
          {label} *
          <button type="button" className="adm-linkbtn" onClick={switchMode}>
            {raw ? 'Pakai format standar' : 'Tulis bebas'}
          </button>
        </span>
      )}
      {raw ? (
        <input
          className="adm-input"
          value={value ?? ''}
          placeholder="mis. Custom Quote"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="adm-price">
          {withFrom && (
            <label className="adm-check">
              <input type="checkbox" checked={parts.from} onChange={(e) => set({ from: e.target.checked })} />
              Start from
            </label>
          )}
          <span className="adm-price-amt">
            <span>Rp</span>
            <input
              className="adm-input"
              inputMode="decimal"
              value={parts.amount}
              placeholder="24"
              aria-label="Harga dalam ribuan"
              onChange={(e) => set({ amount: e.target.value.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1') })}
            />
            <span>K</span>
          </span>
          {withUnit && (
            <span className="adm-price-unit">
              <span>/</span>
              <input
                className="adm-input"
                list="adm-units"
                value={parts.unit}
                placeholder="3 pcs (opsional)"
                aria-label="Satuan"
                onChange={(e) => set({ unit: e.target.value.replace(/\//g, '') })}
              />
              <datalist id="adm-units">
                {UNIT_SUGGESTIONS.map((u) => <option key={u} value={u} />)}
              </datalist>
            </span>
          )}
        </div>
      )}
      {!compact && (
        <span className="adm-hint">
          Harga dalam ribuan (24 → Rp 24K).{' '}
          {value ? <>Tampil: <span className="adm-price-preview"><PriceTag price={value} /></span></> : null}
        </span>
      )}
    </div>
  );
}

/* ─── Tint & badge ──────────────────────────────────────────────────── */

export function TintPicker({ value, onChange }) {
  return (
    <Field label="Warna latar kartu" hint="Terlihat di belakang emoji / saat foto belum dimuat.">
      <div className="adm-swatches" role="radiogroup">
        {TINTS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={value === t.id}
            className={`adm-swatch${value === t.id ? ' active' : ''}`}
            style={{ background: t.swatch }}
            onClick={() => onChange(t.id)}
            title={t.label}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

export function BadgePicker({ value, onChange }) {
  const opts = [['', 'Tanpa badge'], ...Object.entries(BADGES).map(([k, b]) => [k, b.label])];
  return (
    <Field label="Badge / stiker">
      <div className="adm-chips-select">
        {opts.map(([k, label]) => (
          <button
            key={k || 'none'}
            type="button"
            className={`adm-chip${(value || '') === k ? ' active' : ''}`}
            onClick={() => onChange(k || undefined)}
          >
            {label}
          </button>
        ))}
      </div>
    </Field>
  );
}

/* ─── Emoji ─────────────────────────────────────────────────────────── */

/* One visible character (emoji may be several code points, e.g. 🌶️). */
const graphemes = (s) =>
  Intl.Segmenter ? [...new Intl.Segmenter().segment(s)].map((g) => g.segment) : [...s];

const EMOJI_QUICK = ['🍦', '🍫', '🍪', '🍵', '🥮', '🍓', '🫐', '🧀', '☕', '🐔', '🌶️', '🍄', '🎨',
  '🌿', '🌰', '🎂', '🍰', '🥐', '🍍', '🌙', '🎄', '🎁', '🧧', '🐉', '🥜', '🍊', '🍋', '🥥', '🍯', '✨'];

export function EmojiInput({ label = 'Emoji', value, onChange, hint }) {
  return (
    <Field label={`${label} *`} hint={hint}>
      <div className="adm-emoji">
        <input
          className="adm-input adm-emoji-input"
          value={value ?? ''}
          onChange={(e) => onChange(graphemes(e.target.value).slice(-1).join(''))}
          aria-label={label}
        />
        <div className="adm-emoji-quick">
          {EMOJI_QUICK.map((e) => (
            <button key={e} type="button" onClick={() => onChange(e)} className={value === e ? 'active' : ''}>{e}</button>
          ))}
        </div>
      </div>
    </Field>
  );
}

/* Small list of single symbols (season motifs, particle glyphs). */
export function SymbolList({ label, hint, value = [], onChange, max = 6, placeholder }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (!v || value.length >= max) return;
    onChange([...value, v]);
    setDraft('');
  };
  return (
    <Field label={label} hint={hint}>
      <div className="adm-symbols">
        {value.map((s, i) => (
          <span key={i} className="adm-symbol">
            {s}
            <button type="button" aria-label={`Hapus ${s}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        {value.length < max && (
          <span className="adm-symbol-add">
            <input
              className="adm-input"
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(graphemes(e.target.value).slice(0, 1).join(''))}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
            />
            <button type="button" className="adm-btn adm-btn--sm" onClick={add}>+</button>
          </span>
        )}
      </div>
    </Field>
  );
}

/* ─── Image ─────────────────────────────────────────────────────────── */

export function ImagePicker({ value, onChange, tint, emoji }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [gallery, setGallery] = useState(false);
  const src = resolveImg(value);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setError('Format harus JPG, PNG, atau WEBP.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onChange(await store.uploadImage(file));
    } catch (err) {
      setError(`Upload gagal: ${err.message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Field wide label="Foto produk" hint="Foto otomatis dikecilkan (maks 1200px). Rasio kartu ± 4:3 landscape, produk di tengah.">
      <div className="adm-image">
        <div className={`adm-image-thumb sb-card-img ${tint || ''}`}>
          <span className="adm-image-emoji">{emoji}</span>
          {src && <img src={src} alt="" />}
          {busy && <span className="adm-image-busy">Mengupload…</span>}
        </div>
        <div className="adm-image-actions">
          <button type="button" className="adm-btn" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Icon name="upload" size={14} /> Upload foto
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => setGallery(true)} disabled={busy}>
            <Icon name="image" size={14} /> Pilih dari galeri
          </button>
          {value && (
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange(null)} disabled={busy}>
              <Icon name="x" size={14} /> Hapus foto
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onFile} />
          {error && <span className="adm-hint warn">{error}</span>}
        </div>
      </div>
      {gallery && (
        <Gallery
          current={value}
          onPick={(v) => { onChange(v); setGallery(false); }}
          onClose={() => setGallery(false)}
        />
      )}
    </Field>
  );
}

function Gallery({ current, onPick, onClose }) {
  const [uploaded, setUploaded] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    store.listImages().then(setUploaded).catch((e) => { setUploaded([]); setError(e.message); });
  }, []);

  const Tile = ({ v, label }) => (
    <button
      type="button"
      className={`adm-gallery-tile${current === v ? ' active' : ''}`}
      onClick={() => onPick(v)}
      title={label}
    >
      <img src={resolveImg(v)} alt={label} loading="lazy" />
    </button>
  );

  return (
    <div className="adm-modal-backdrop adm-modal-backdrop--top" onClick={onClose}>
      <div className="adm-modal adm-modal--gallery" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Galeri foto">
        <div className="adm-modal-head">
          <h3>Galeri foto</h3>
          <IconBtn icon="x" label="Tutup" onClick={onClose} size={18} />
        </div>
        <div className="adm-modal-body">
          <h4 className="adm-subhead">Foto yang sudah diupload</h4>
          {uploaded === null ? (
            <p className="adm-muted">Memuat…</p>
          ) : uploaded.length === 0 ? (
            <p className="adm-muted">{error ? `Gagal memuat: ${error}` : 'Belum ada foto yang diupload.'}</p>
          ) : (
            <div className="adm-gallery">
              {uploaded.map((f) => <Tile key={f.url} v={f.url} label={f.name} />)}
            </div>
          )}
          <h4 className="adm-subhead">Foto bawaan website</h4>
          <div className="adm-gallery">
            {BUNDLED_IMAGES.map((p) => <Tile key={p} v={p} label={p.split('/').pop()} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
