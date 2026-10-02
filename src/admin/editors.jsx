import { useState } from 'react';
import SeasonBanner from '../components/SeasonBanner.jsx';
import { uid } from '../lib/format.js';
import { Text, TextArea, Toggle, PriceInput, SymbolList, Field } from './fields.jsx';
import { ItemList, ItemModal, blankItem } from './items.jsx';
import { Icon, IconBtn } from './icons.jsx';
import { move } from './list.js';

/* Every editor gets `data` (the section's JSON) and `update(fn)`, where
   fn mutates a draft copy: update((d) => { d.title = 'x'; }). */

export function Card({ eyebrow, title, hint, count, actions, children, className = '' }) {
  return (
    <section className={`adm-card ${className}`}>
      {(title || actions) && (
        <header className="adm-card-head">
          <div className="adm-card-titles">
            {eyebrow && <span className="adm-eyebrow">{eyebrow}</span>}
            <h3>
              {title}
              {count != null && <span className="adm-count-pill">{count}</span>}
            </h3>
            {hint && <p className="adm-hint">{hint}</p>}
          </div>
          {actions && <div className="adm-card-actions">{actions}</div>}
        </header>
      )}
      <div className="adm-card-body">{children}</div>
    </section>
  );
}

function SectionHead({ title, hint, action }) {
  return (
    <div className="adm-section-head">
      <div>
        <h3>{title}</h3>
        {hint && <p className="adm-hint">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

function RowActions({ list, i, onMove, onRemove, removeLabel = 'Hapus' }) {
  return (
    <div className="adm-row-actions">
      <IconBtn icon="up" label="Naikkan" disabled={i === 0} onClick={() => onMove(-1)} />
      <IconBtn icon="down" label="Turunkan" disabled={i === list.length - 1} onClick={() => onMove(1)} />
      <IconBtn icon="trash" label={removeLabel} danger onClick={onRemove} />
    </div>
  );
}

function HeaderFields({ data, update }) {
  return (
    <Card title="Judul & label" hint="Bagian atas kategori di halaman menu.">
      <div className="adm-grid2">
        <Text label="Label tombol filter" value={data.filterLabel} limit={20}
          onChange={(v) => update((d) => { d.filterLabel = v; })}
          placeholder="mis. 🥐 Choux" hint="Tombol filter di atas menu. Awali dengan emoji." />
        <Text label="Pill (label kecil)" value={data.pill} limit={20}
          onChange={(v) => update((d) => { d.pill = v; })}
          placeholder="mis. 🥐 Choux" hint="Label kecil di atas judul kategori." />
        <Text label="Judul" required value={data.title} limit={32} wide
          onChange={(v) => update((d) => { d.title = v; })} placeholder="mis. Choux Au Craquelin" />
        <TextArea label="Intro (opsional)" value={data.intro} limit={120} rows={2}
          onChange={(v) => update((d) => { d.intro = v; })}
          placeholder="mis. Soft, savoury & seriously addictive — now in four flavor variants." />
      </div>
    </Card>
  );
}

/* ─── Menu category ─────────────────────────────────────────────────── */

export function MenuEditor({ data, update }) {
  const [editing, setEditing] = useState(null); // { gi, ii|null }
  const groups = data.groups || [];

  const saveItem = (item, newGi) => {
    const { gi, ii } = editing;
    update((d) => {
      if (ii !== null && newGi === gi) {
        d.groups[gi].items[ii] = item;
      } else {
        if (ii !== null) d.groups[gi].items.splice(ii, 1);
        d.groups[newGi].items.push(item);
      }
    });
    setEditing(null);
  };

  const addGroup = () => update((d) => {
    d.groups = [...(d.groups || []), { id: uid(), heading: '', note: '', items: [] }];
  });

  const pt = data.priceTable;

  return (
    <>
      <HeaderFields data={data} update={update} />

      <SectionHead
        title="Produk"
        hint="Produk dikelompokkan per grup. Beri sub-judul (mis. Regular / Premium) kalau kategori punya beberapa jenis; kosongkan kalau cuma satu."
        action={(
          <button type="button" className="adm-btn adm-btn--sm" onClick={addGroup}>
            <Icon name="plus" size={14} /> Tambah grup
          </button>
        )}
      />

      {groups.map((g, gi) => {
        const inlinePossible = !!(g.heading && g.note);
        return (
          <Card
            key={g.id || gi}
            className="adm-card--group"
            eyebrow={groups.length > 1 ? `Grup ${gi + 1}` : null}
            title={g.heading || 'Tanpa sub-judul'}
            count={`${(g.items || []).length} item`}
            actions={(
              <>
                <IconBtn icon="up" label="Naikkan grup" disabled={gi === 0}
                  onClick={() => update((d) => { d.groups = move(d.groups, gi, -1); })} />
                <IconBtn icon="down" label="Turunkan grup" disabled={gi === groups.length - 1}
                  onClick={() => update((d) => { d.groups = move(d.groups, gi, 1); })} />
                <IconBtn icon="trash" label="Hapus grup" danger disabled={groups.length === 1}
                  onClick={() => {
                    if (g.items?.length && !window.confirm(`Hapus grup "${g.heading || gi + 1}" beserta ${g.items.length} item di dalamnya?`)) return;
                    update((d) => { d.groups.splice(gi, 1); });
                  }} />
              </>
            )}
          >
            <div className="adm-grid3 adm-group-fields">
              <Text label="Sub-judul grup" value={g.heading} limit={28}
                onChange={(v) => update((d) => { d.groups[gi].heading = v; })} placeholder="mis. Premium" />
              <Text label="Catatan" value={g.note} limit={50}
                onChange={(v) => update((d) => { d.groups[gi].note = v; })} placeholder="mis. (+2K / pc)" />
              <div className={`adm-field adm-inline-toggle${inlinePossible ? '' : ' is-disabled'}`}>
                <span className="adm-field-label">Posisi catatan</span>
                <Toggle
                  checked={inlinePossible && g.noteInline}
                  onChange={(v) => inlinePossible && update((d) => { d.groups[gi].noteInline = v || undefined; })}
                  label={inlinePossible && g.noteInline ? 'Di samping sub-judul' : 'Di bawah sub-judul'}
                />
              </div>
            </div>
            <ItemList
              items={g.items || []}
              onChange={(items) => update((d) => { d.groups[gi].items = items; })}
              onEdit={(ii) => setEditing({ gi, ii })}
              onAdd={() => setEditing({ gi, ii: null })}
            />
          </Card>
        );
      })}

      <Card
        title="Tabel harga"
        hint="Kotak daftar ukuran & harga di bawah produk (opsional)."
        actions={(
          <Toggle checked={!!pt} label={pt ? 'Dipakai' : 'Tidak dipakai'}
            onChange={(on) => update((d) => { d.priceTable = on ? { heading: '', rows: [{ id: uid(), label: '', value: '' }] } : null; })} />
        )}
      >
        {pt && (
          <div className="adm-pricetable">
            <div className="adm-pricetable-edit">
              <Text label="Judul tabel" value={pt.heading} limit={32} wide
                onChange={(v) => update((d) => { d.priceTable.heading = v; })} placeholder="mis. Choux Sizes & Pricing" />
              <div className="adm-rows">
                <div className="adm-rows-head"><span>Keterangan</span><span>Harga</span><span /></div>
                {pt.rows.map((r, ri) => (
                  <div key={r.id || ri} className="adm-row">
                    <input className="adm-input" value={r.label} placeholder="mis. Box of 6 pcs" aria-label="Keterangan"
                      onChange={(e) => update((d) => { d.priceTable.rows[ri].label = e.target.value; })} />
                    <PriceInput compact withUnit={false} withFrom={false} value={r.value}
                      onChange={(v) => update((d) => { d.priceTable.rows[ri].value = v; })} />
                    <RowActions list={pt.rows} i={ri} removeLabel="Hapus baris"
                      onMove={(dir) => update((d) => { d.priceTable.rows = move(d.priceTable.rows, ri, dir); })}
                      onRemove={() => update((d) => { d.priceTable.rows.splice(ri, 1); })} />
                  </div>
                ))}
                <button type="button" className="adm-btn adm-btn--dashed"
                  onClick={() => update((d) => { d.priceTable.rows.push({ id: uid(), label: '', value: '' }); })}>
                  <Icon name="plus" size={14} /> Tambah baris
                </button>
              </div>
            </div>
            <div className="adm-pricetable-preview">
              <span className="adm-field-label">Preview</span>
              <div className="sb-pricing">
                {pt.heading ? <h4>{pt.heading}</h4> : null}
                {pt.rows.map((r, i) => (
                  <div className="sb-pricing-row" key={r.id || i}>
                    <span>{r.label || '…'}</span><span className="val">{r.value || '…'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {editing && (
        <ItemModal
          item={editing.ii === null ? blankItem() : groups[editing.gi].items[editing.ii]}
          groups={groups}
          groupIndex={editing.gi}
          onSave={saveItem}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

/* ─── Custom order block ────────────────────────────────────────────── */

export function CustomEditor({ data, update }) {
  const feats = data.feats || [];
  return (
    <>
      <HeaderFields data={data} update={update} />
      <Card title="Kotak Custom Order" hint="Kotak ajakan dengan tombol “Discuss Custom Order” ke WhatsApp.">
        <div className="adm-grid2">
          <Text label="Judul kotak" value={data.heading} limit={50} wide
            onChange={(v) => update((d) => { d.heading = v; })} placeholder="mis. Custom Birthday Cake, Wedding Favors & More" />
          <TextArea label="Isi" value={data.body} limit={220} rows={3}
            onChange={(v) => update((d) => { d.body = v; })} />
          <Field label="Poin-poin layanan" wide>
            <div className="adm-rows">
              {feats.map((f, i) => (
                <div key={f.id || i} className="adm-row adm-row--feat">
                  <input className="adm-input adm-emoji-input" value={f.icon} aria-label="Ikon"
                    onChange={(e) => update((d) => { d.feats[i].icon = e.target.value; })} />
                  <input className="adm-input" value={f.text} aria-label="Teks" placeholder="mis. Wedding Favors & Souvenirs"
                    onChange={(e) => update((d) => { d.feats[i].text = e.target.value; })} />
                  <RowActions list={feats} i={i}
                    onMove={(dir) => update((d) => { d.feats = move(d.feats, i, dir); })}
                    onRemove={() => update((d) => { d.feats.splice(i, 1); })} />
                </div>
              ))}
              <button type="button" className="adm-btn adm-btn--dashed"
                onClick={() => update((d) => { d.feats = [...(d.feats || []), { id: uid(), icon: '✨', text: '' }]; })}>
                <Icon name="plus" size={14} /> Tambah poin
              </button>
            </div>
          </Field>
        </div>
      </Card>
    </>
  );
}

/* ─── Seasonal edition ──────────────────────────────────────────────── */

export function SeasonEditor({ id, data, update }) {
  const [editing, setEditing] = useState(null); // index | 'new'
  const items = data.items || [];
  const set = (k) => (v) => update((d) => { d[k] = v; });

  const saveItem = (item) => {
    update((d) => {
      d.items = d.items || [];
      if (editing === 'new') d.items.push(item); else d.items[editing] = item;
    });
    setEditing(null);
  };

  return (
    <>
      <Card title="Banner edisi" hint="Teks di banner bertema. Warna & latar mengikuti tema edisi ini.">
        <div className="adm-season-layout">
          <div className="adm-grid2">
            <Text label="Label tab" value={data.label} limit={22} onChange={set('label')} placeholder="mis. 🎄 Christmas" />
            <Text label="Tagline" value={data.tagline} limit={30} onChange={set('tagline')} placeholder="mis. Merry Christmas Edition" />
            <Text label="Baris dekorasi" value={data.chars} limit={24} wide onChange={set('chars')} placeholder="mis. 福 · 禄 · 寿 · 喜" />
            <TextArea label="Intro" value={data.intro} limit={140} rows={3} onChange={set('intro')} />
            <Text label="Ucapan" value={data.greeting} limit={70} wide onChange={set('greeting')} />
            <Text label="Info ketersediaan" value={data.available} limit={56} wide onChange={set('available')}
              placeholder="mis. 📅 Available December · Order H-3" />
          </div>
          <div className="adm-season-banner-preview">
            <span className="adm-field-label">Preview banner</span>
            <div id="seasonal" className={`theme-${id} adm-season-preview`}>
              <SeasonBanner season={{ id, ...data }} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Dekorasi" hint="Emoji di atas banner dan partikel yang berjatuhan di latar.">
        <div className="adm-grid3">
          <SymbolList label="Motif (emoji besar)" value={data.motifs} max={6} placeholder="🎄"
            onChange={set('motifs')} hint="Maks 6. Ketik 1 emoji lalu Enter." />
          <SymbolList label="Partikel jatuh" value={data.glyphs} max={4} placeholder="❄"
            onChange={set('glyphs')} hint="Maks 4 simbol." />
          <Field label="Warna partikel" hint="Klik kotak untuk memilih warna.">
            <input type="color" className="adm-color" value={data.pColor || '#ffffff'}
              onChange={(e) => update((d) => { d.pColor = e.target.value; })} />
          </Field>
        </div>
      </Card>

      <Card title="Produk" count={`${items.length} item`} hint="Kartu produk di bawah banner.">
        <ItemList
          items={items}
          onChange={(next) => update((d) => { d.items = next; })}
          onEdit={(i) => setEditing(i)}
          onAdd={() => setEditing('new')}
        />
      </Card>

      {editing !== null && (
        <ItemModal
          item={editing === 'new' ? blankItem() : items[editing]}
          theme={id}
          onSave={saveItem}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
