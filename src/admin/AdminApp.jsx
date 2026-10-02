import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { store } from './store.js';
import { withIds } from './list.js';
import { MenuEditor, CustomEditor, SeasonEditor } from './editors.jsx';
import { Text, Toggle } from './fields.jsx';
import { Icon, IconBtn } from './icons.jsx';
import { ChangePasswordModal, ForgotPassword, ResetPassword } from './password.jsx';
import { DEFAULT_SECTIONS, SEASON_IDS } from '../data/defaultContent.js';
import { slugify, uid } from '../lib/format.js';
import { SITE_URL } from '../lib/config.js';

const LOGO = './logo-mark.png';
const SITE = SITE_URL;

/* ─── Auth gate ─────────────────────────────────────────────────────── */

export default function AdminApp() {
  const [state, setState] = useState('loading'); // loading | out | denied | recovery | in
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState(store?.authError || '');
  const [welcome, setWelcome] = useState('');

  const check = useCallback(async (u) => {
    setUser(u);
    if (!u) return setState('out');
    try {
      setState((await store.isAdmin()) ? 'in' : 'denied');
    } catch {
      setState('denied');
    }
  }, []);

  useEffect(() => {
    if (!store) return;
    store.getUser().then((u) => {
      if (store.recovery) {
        // Opened from the reset-password email
        history.replaceState(null, '', window.location.pathname + window.location.search);
        if (u) { setUser(u); setState('recovery'); return; }
        setNotice('Link reset password tidak valid atau sudah kedaluwarsa. Minta link baru.');
      }
      check(u);
    });
    return store.onAuthChange((u, event) => {
      if (event === 'PASSWORD_RECOVERY' && u) { setUser(u); setState('recovery'); return; }
      if (!u) { setUser(null); setState('out'); }
    });
  }, [check]);

  if (!store) return <SetupNotice />;
  if (state === 'loading') return <Splash text="Memuat…" />;
  if (state === 'recovery') {
    return (
      <AuthCard>
        <ResetPassword
          email={user?.email}
          onDone={() => { setNotice(''); setWelcome('Password baru tersimpan ✓'); check(user); }}
        />
      </AuthCard>
    );
  }
  if (state === 'out') return <Login notice={notice} onDone={() => { setNotice(''); store.getUser().then(check); }} />;
  if (state === 'denied') {
    return (
      <Splash text={`Akun ${user?.email} belum terdaftar sebagai admin.`}>
        <p className="adm-muted">Tambahkan email ini ke tabel <code>admin_users</code> di Supabase.</p>
        <button type="button" className="adm-btn" onClick={() => store.signOut()}>Keluar</button>
      </Splash>
    );
  }
  return <Dashboard user={user} welcome={welcome} />;
}

function Splash({ text, children }) {
  return (
    <div className="adm-splash">
      <img src={LOGO} alt="" width="64" height="64" />
      <p>{text}</p>
      {children}
    </div>
  );
}

function SetupNotice() {
  return (
    <Splash text="Supabase belum dikonfigurasi.">
      <p className="adm-muted">
        Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di environment hosting,
        lalu build ulang. Lihat <code>README.md</code>.
      </p>
    </Splash>
  );
}

function AuthCard({ children }) {
  return (
    <div className="adm-splash">
      <div className="adm-login">
        <img src={LOGO} alt="" width="64" height="64" />
        {children}
      </div>
    </div>
  );
}

function Login({ onDone, notice }) {
  const [mode, setMode] = useState('login'); // login | forgot
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await store.signIn(email.trim(), password);
      onDone();
    } catch (err) {
      setError(/invalid/i.test(err.message) ? 'Email atau password salah.' : err.message);
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'forgot') {
    return (
      <AuthCard>
        <ForgotPassword initialEmail={email} onBack={() => setMode('login')} />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form className="adm-stack" onSubmit={submit}>
        <h1>Sweetie Batter Admin</h1>
        {notice && <p className="adm-notice">{notice}</p>}
        <label className="adm-field">
          <span className="adm-field-label">Email</span>
          <input className="adm-input" type="email" autoComplete="username" required
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="adm-field">
          <span className="adm-field-label">
            Password
            {store.mode === 'supabase' && (
              <button type="button" className="adm-linkbtn" onClick={() => setMode('forgot')}>Lupa password?</button>
            )}
          </span>
          <input className="adm-input" type="password" autoComplete="current-password" required
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="adm-hint warn">{error}</p>}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
          {busy ? 'Masuk…' : 'Masuk'}
        </button>
      </form>
    </AuthCard>
  );
}

/* Account chip in the header → change password / sign out. */
function UserMenu({ email, onChangePassword, onSignOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const canManage = store.mode === 'supabase';

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [open]);

  const chip = (
    <>
      <span className="adm-avatar" aria-hidden="true">{(email || '?')[0].toUpperCase()}</span>
      <span className="adm-user-email">{email}</span>
    </>
  );
  if (!canManage) return <span className="adm-user" title={email}>{chip}</span>;

  return (
    <div className="adm-usermenu" ref={ref}>
      <button type="button" className="adm-user adm-user--btn" aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen((v) => !v)} title={email}>
        {chip}
        <Icon name="chevronDown" size={14} />
      </button>
      {open && (
        <div className="adm-menu" role="menu">
          <div className="adm-menu-head">
            <span className="adm-hint">Login sebagai</span>
            <strong>{email}</strong>
          </div>
          <button type="button" role="menuitem" className="adm-menu-item"
            onClick={() => { setOpen(false); onChangePassword(); }}>
            <Icon name="key" size={15} /> Ganti password
          </button>
          <button type="button" role="menuitem" className="adm-menu-item adm-menu-item--danger"
            onClick={() => { setOpen(false); onSignOut(); }}>
            <Icon name="logout" size={15} /> Keluar
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Dashboard ─────────────────────────────────────────────────────── */

const KIND_LABEL = { menu: 'Kategori menu', custom: 'Custom order', season: 'Edisi seasonal' };

const itemCount = (r) => (r.kind === 'season'
  ? (r.data.items || []).length
  : (r.data.groups || []).reduce((n, g) => n + (g.items || []).length, 0));

function summary(r) {
  if (r.kind === 'custom') return `${(r.data.feats || []).length} poin layanan`;
  if (r.kind === 'season') return `${itemCount(r)} produk`;
  const g = (r.data.groups || []).length;
  return `${g} grup · ${itemCount(r)} produk${r.data.priceTable ? ' · tabel harga' : ''}`;
}

function Dashboard({ user, welcome }) {
  const [rows, setRows] = useState(null);      // saved state (server)
  const [drafts, setDrafts] = useState({});    // id → edited copy (unsaved)
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [adding, setAdding] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);

  const notify = (msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), kind === 'err' ? 6000 : 2500);
  };

  const load = useCallback(async () => {
    try {
      const data = await store.listSections();
      setRows(data.map(withIds));
    } catch (e) {
      setRows([]);
      notify(`Gagal memuat data: ${e.message}`, 'err');
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (welcome) notify(welcome); }, [welcome]); // eslint-disable-line react-hooks/exhaustive-deps

  // Warn before leaving with unsaved edits
  const dirtyCount = Object.keys(drafts).length;
  useEffect(() => {
    if (!dirtyCount) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirtyCount]);

  const all = useMemo(() => {
    const byId = new Map((rows || []).map((r) => [r.id, r]));
    for (const d of Object.values(drafts)) if (!byId.has(d.id)) byId.set(d.id, d); // new, unsaved
    return [...byId.values()].map((r) => drafts[r.id] || r).sort((a, b) => a.sort - b.sort);
  }, [rows, drafts]);

  const menuRows = all.filter((r) => r.kind !== 'season');
  const seasonRows = all.filter((r) => r.kind === 'season');
  const current = all.find((r) => r.id === selected) || all[0];
  const isNew = current && !rows?.some((r) => r.id === current.id);

  useEffect(() => { if (!selected && all[0]) setSelected(all[0].id); }, [all, selected]);

  const updateRow = (id, fn) => {
    setDrafts((prev) => {
      const base = prev[id] || rows.find((r) => r.id === id);
      const next = structuredClone(base);
      fn(next);
      return { ...prev, [id]: next };
    });
  };
  const updateData = (fn) => updateRow(current.id, (r) => fn(r.data));

  const validate = (row) => {
    const items = row.kind === 'season' ? row.data.items || [] : (row.data.groups || []).flatMap((g) => g.items || []);
    const bad = items.find((it) => !it.name?.trim() || !it.price?.trim());
    if (bad) return `Ada item tanpa nama/harga${bad.name ? `: "${bad.name}"` : ''}.`;
    if (row.kind !== 'season' && !row.data.title?.trim()) return 'Judul kategori wajib diisi.';
    return null;
  };

  const save = async () => {
    const draft = drafts[current.id];
    if (!draft) return;
    const err = validate(draft);
    if (err) return notify(err, 'err');
    setSaving(true);
    try {
      await store.upsertSections([draft]);
      setRows((prev) => {
        const i = prev.findIndex((r) => r.id === draft.id);
        return i >= 0 ? prev.map((r) => (r.id === draft.id ? draft : r)) : [...prev, draft];
      });
      setDrafts(({ [draft.id]: _, ...rest }) => rest);
      notify('Tersimpan — website sudah ter-update ✓');
    } catch (e) {
      notify(`Gagal menyimpan: ${e.message}`, 'err');
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!window.confirm(isNew ? 'Buang kategori baru ini?' : 'Buang semua perubahan yang belum disimpan?')) return;
    setDrafts(({ [current.id]: _, ...rest }) => rest);
    if (isNew) setSelected(null);
  };

  const remove = async () => {
    if (!window.confirm(`Hapus kategori "${current.data.title}" beserta semua produknya? Ini tidak bisa dibatalkan.`)) return;
    try {
      await store.deleteSection(current.id);
      setRows((prev) => prev.filter((r) => r.id !== current.id));
      setDrafts(({ [current.id]: _, ...rest }) => rest);
      setSelected(null);
      notify('Kategori dihapus');
    } catch (e) {
      notify(`Gagal menghapus: ${e.message}`, 'err');
    }
  };

  // Reordering saves immediately (only `sort` changes on the saved rows)
  const reorder = async (list, i, dir) => {
    const a = list[i];
    const b = list[i + dir];
    if (!a || !b) return;
    const savedA = rows.find((r) => r.id === a.id);
    const savedB = rows.find((r) => r.id === b.id);
    if (!savedA || !savedB) return notify('Simpan kategori baru dulu sebelum mengubah urutan.', 'err');
    const nextA = { ...savedA, sort: savedB.sort };
    const nextB = { ...savedB, sort: savedA.sort };
    if (nextA.sort === nextB.sort) nextB.sort += dir > 0 ? -1 : 1;
    try {
      await store.upsertSections([nextA, nextB]);
      setRows((prev) => prev.map((r) => (r.id === a.id ? nextA : r.id === b.id ? nextB : r)));
      setDrafts((prev) => {
        const next = { ...prev };
        if (next[a.id]) next[a.id] = { ...next[a.id], sort: nextA.sort };
        if (next[b.id]) next[b.id] = { ...next[b.id], sort: nextB.sort };
        return next;
      });
    } catch (e) {
      notify(`Gagal mengubah urutan: ${e.message}`, 'err');
    }
  };

  const importDefaults = async () => {
    setSaving(true);
    try {
      const seeded = DEFAULT_SECTIONS.map(withIds);
      await store.upsertSections(seeded);
      setRows(seeded);
      notify('Data awal berhasil diimport ✓');
    } catch (e) {
      notify(`Import gagal: ${e.message}`, 'err');
    } finally {
      setSaving(false);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sweetie-batter-menu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const createSection = ({ id, title, filterLabel }) => {
    const sort = Math.max(0, ...menuRows.map((r) => r.sort)) + 10;
    const row = {
      id, kind: 'menu', sort, visible: true,
      data: { filterLabel, pill: filterLabel, title, intro: '', groups: [{ id: uid(), heading: '', items: [] }], priceTable: null },
    };
    setDrafts((prev) => ({ ...prev, [id]: row }));
    setSelected(id);
    setAdding(false);
  };

  const select = (id) => { setSelected(id); setNavOpen(false); window.scrollTo(0, 0); };

  if (rows === null) return <Splash text="Memuat data menu…" />;

  const NavItem = ({ r, list, i }) => (
    <li className={`adm-nav-item${current?.id === r.id ? ' active' : ''}${r.visible ? '' : ' is-off'}`}>
      <button type="button" className="adm-nav-link" onClick={() => select(r.id)}>
        <span className="adm-nav-label">{r.kind === 'season' ? r.data.label : r.data.filterLabel || r.data.title}</span>
        {drafts[r.id] && <span className="adm-dot" title="Belum disimpan" />}
        {!r.visible && <span className="adm-nav-flag" title="Disembunyikan dari website"><Icon name="eyeOff" size={13} /></span>}
        {r.kind !== 'custom' && <span className="adm-nav-count">{itemCount(r)}</span>}
      </button>
      {list && (
        <span className="adm-nav-move">
          <button type="button" disabled={i === 0} aria-label="Naikkan" title="Naikkan" onClick={() => reorder(list, i, -1)}>
            <Icon name="chevronUp" size={14} />
          </button>
          <button type="button" disabled={i === list.length - 1} aria-label="Turunkan" title="Turunkan" onClick={() => reorder(list, i, 1)}>
            <Icon name="chevronDown" size={14} />
          </button>
        </span>
      )}
    </li>
  );

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top-inner">
          <button type="button" className="adm-iconbtn adm-navtoggle" onClick={() => setNavOpen((v) => !v)} aria-label="Menu">
            <Icon name={navOpen ? 'x' : 'menu'} size={20} />
          </button>
          <a className="adm-brand" href="./">
            <img src={LOGO} alt="" width="36" height="36" />
            <span>Sweetie Batter <em>Admin</em></span>
          </a>
          {store.mode === 'local' && (
            <span className="adm-tag adm-tag--warn" title="Tanpa Supabase — data hanya tersimpan di browser ini dan tidak tampil di website">
              Mode demo lokal
            </span>
          )}
          <div className="adm-top-actions">
            <a className="adm-btn adm-btn--ghost adm-btn--sm" href={SITE} target="_blank" rel="noopener noreferrer">
              <Icon name="external" size={14} /> <span className="adm-hide-sm">Lihat website</span>
            </a>
            {rows.length > 0 && (
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={exportJson} title="Unduh semua data sebagai file JSON">
                <Icon name="download" size={14} /> <span className="adm-hide-sm">Backup</span>
              </button>
            )}
            <UserMenu
              email={user?.email}
              onChangePassword={() => setPwOpen(true)}
              onSignOut={() => {
                if (dirtyCount && !window.confirm('Ada perubahan belum disimpan. Tetap keluar?')) return;
                store.signOut();
              }}
            />
          </div>
        </div>
      </header>

      {rows.length === 0 && dirtyCount === 0 ? (
        <main className="adm-empty">
          <h2>Database masih kosong</h2>
          <p>
            Jalankan <code>supabase/schema.sql</code> di Supabase (sudah berisi data menu), atau
            import menu yang sekarang tampil di website dari sini.
          </p>
          <button type="button" className="adm-btn adm-btn--primary" onClick={importDefaults} disabled={saving}>
            <Icon name="download" size={15} /> {saving ? 'Mengimport…' : 'Import data awal'}
          </button>
        </main>
      ) : (
        <div className="adm-body">
          <nav className={`adm-nav${navOpen ? ' open' : ''}`} aria-label="Bagian">
            <div className="adm-nav-group">
              <h4>Menu</h4>
              <ul>{menuRows.map((r, i) => <NavItem key={r.id} r={r} list={menuRows} i={i} />)}</ul>
              <button type="button" className="adm-nav-add" onClick={() => setAdding(true)}>
                <Icon name="plus" size={14} /> Kategori baru
              </button>
            </div>
            <div className="adm-nav-group">
              <h4>Seasonal</h4>
              <ul>{seasonRows.map((r) => <NavItem key={r.id} r={r} />)}</ul>
            </div>
          </nav>

          {current && (
            <main className="adm-main" key={current.id}>
              <div className="adm-main-head">
                <div className="adm-main-titles">
                  <span className="adm-eyebrow">{KIND_LABEL[current.kind]}{isNew ? ' · baru' : ''}</span>
                  <h2>{current.kind === 'season' ? current.data.label : current.data.title || '(tanpa judul)'}</h2>
                  <p className="adm-main-meta">{summary(current)}</p>
                </div>
                <div className="adm-main-head-actions">
                  <div className={`adm-status${current.visible ? ' on' : ''}`}>
                    <Toggle
                      checked={current.visible}
                      onChange={(v) => updateRow(current.id, (r) => { r.visible = v; })}
                      label={current.visible ? 'Tampil di website' : 'Disembunyikan'}
                    />
                  </div>
                  {current.kind === 'menu' && !isNew && (
                    <button type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={remove}>
                      <Icon name="trash" size={14} /> Hapus kategori
                    </button>
                  )}
                </div>
              </div>

              {current.kind === 'menu' && <MenuEditor data={current.data} update={updateData} />}
              {current.kind === 'custom' && <CustomEditor data={current.data} update={updateData} />}
              {current.kind === 'season' && SEASON_IDS.includes(current.id) && (
                <SeasonEditor id={current.id} data={current.data} update={updateData} />
              )}

              {drafts[current.id] && (
                <div className="adm-savebar" role="region" aria-label="Simpan perubahan">
                  <span className="adm-dot" aria-hidden="true" />
                  <span className="adm-savebar-text">{isNew ? 'Kategori baru belum disimpan' : 'Ada perubahan yang belum disimpan'}</span>
                  <button type="button" className="adm-btn adm-btn--ghost" onClick={discard} disabled={saving}>Batal</button>
                  <button type="button" className="adm-btn adm-btn--primary" onClick={save} disabled={saving}>
                    <Icon name="save" size={15} /> {saving ? 'Menyimpan…' : 'Simpan & publish'}
                  </button>
                </div>
              )}
            </main>
          )}
        </div>
      )}

      {adding && (
        <NewSectionModal
          taken={['all', ...all.map((r) => r.id)]}
          onCreate={createSection}
          onClose={() => setAdding(false)}
        />
      )}

      {pwOpen && (
        <ChangePasswordModal
          email={user?.email}
          onClose={() => setPwOpen(false)}
          onDone={() => { setPwOpen(false); notify('Password berhasil diganti ✓'); }}
        />
      )}

      {toast && <div className={`adm-toast adm-toast--${toast.kind}`} role="status">{toast.msg}</div>}
    </div>
  );
}

function NewSectionModal({ taken, onCreate, onClose }) {
  const [title, setTitle] = useState('');
  const [filterLabel, setFilterLabel] = useState('');
  const id = slugify(title);
  const clash = taken.includes(id);

  const submit = (e) => {
    e.preventDefault();
    if (!id || clash) return;
    onCreate({ id, title: title.trim(), filterLabel: filterLabel.trim() || title.trim() });
  };

  return (
    <div className="adm-modal-backdrop" onClick={onClose}>
      <form className="adm-modal adm-modal--sm" onSubmit={submit} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Kategori baru">
        <div className="adm-modal-head">
          <h3>Kategori menu baru</h3>
          <IconBtn icon="x" label="Tutup" onClick={onClose} size={18} />
        </div>
        <div className="adm-modal-body adm-form">
          <Text label="Judul kategori" required value={title} onChange={setTitle} limit={32} placeholder="mis. Hampers" wide />
          <Text label="Label tombol filter" value={filterLabel} onChange={setFilterLabel} limit={20} placeholder="mis. 🎁 Hampers"
            hint="Awali dengan emoji, seperti kategori lain." wide />
          {id && (
            <p className={`adm-hint${clash ? ' warn' : ''}`}>
              ID: <code>{id}</code>{clash ? ' — sudah dipakai, ganti judul.' : ' (tidak bisa diubah setelah disimpan)'}
            </p>
          )}
        </div>
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={!id || clash}>Buat kategori</button>
        </div>
      </form>
    </div>
  );
}
