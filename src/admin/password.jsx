import { useEffect, useState } from 'react';
import { store } from './store.js';
import { IconBtn } from './icons.jsx';

/* Password screens: change (logged in), forgot (login page) and the
   "new password" screen opened from the reset email. */

const MIN_LENGTH = 8;

/* Supabase auth errors → short Indonesian messages. */
export function authMessage(err) {
  const m = err?.message || String(err);
  if (/should be different/i.test(m)) return 'Password baru harus berbeda dari password lama.';
  if (/weak|at least|characters|pwned/i.test(m)) return 'Password terlalu lemah. Pakai minimal 8 karakter, campur huruf & angka.';
  if (/rate limit|security purposes|too many/i.test(m)) return 'Terlalu sering mencoba. Tunggu beberapa menit lalu coba lagi.';
  if (/sending recovery email|smtp/i.test(m)) return 'Email gagal dikirim. Cek pengaturan email di Supabase (lihat README).';
  if (/session|jwt|expired/i.test(m)) return 'Sesi sudah habis. Minta link reset baru atau login ulang.';
  return m;
}

function validate(pw, confirm) {
  if (pw.length < MIN_LENGTH) return `Password minimal ${MIN_LENGTH} karakter.`;
  if (pw !== confirm) return 'Konfirmasi password tidak sama.';
  return '';
}

function PasswordInput({ label, value, onChange, autoComplete, autoFocus }) {
  const [show, setShow] = useState(false);
  return (
    <label className="adm-field">
      <span className="adm-field-label">{label}</span>
      <span className="adm-password">
        <input
          className="adm-input"
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <IconBtn icon={show ? 'eyeOff' : 'eye'} label={show ? 'Sembunyikan password' : 'Lihat password'}
          onClick={() => setShow((v) => !v)} size={15} />
      </span>
    </label>
  );
}

/* New password + confirmation, shared by both flows. */
function NewPasswordFields({ pw, setPw, confirm, setConfirm, autoFocus }) {
  return (
    <>
      <PasswordInput label="Password baru" value={pw} onChange={setPw} autoComplete="new-password" autoFocus={autoFocus} />
      <PasswordInput label="Ulangi password baru" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <p className="adm-hint">Minimal {MIN_LENGTH} karakter. Campur huruf, angka & simbol supaya aman.</p>
    </>
  );
}

/* ─── Change password (logged in) ───────────────────────────────────── */

export function ChangePasswordModal({ email, onClose, onDone }) {
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(pw, confirm);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError('');
    try {
      await store.changePassword(email, current, pw);
      onDone();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="adm-modal-backdrop">
      <form className="adm-modal adm-modal--sm" onSubmit={submit} role="dialog" aria-label="Ganti password">
        <div className="adm-modal-head">
          <h3>Ganti password</h3>
          <IconBtn icon="x" label="Tutup" onClick={onClose} size={18} />
        </div>
        <div className="adm-modal-body adm-stack">
          <p className="adm-hint">Untuk akun <strong>{email}</strong>.</p>
          <PasswordInput label="Password lama" value={current} onChange={setCurrent} autoComplete="current-password" autoFocus />
          <NewPasswordFields pw={pw} setPw={setPw} confirm={confirm} setConfirm={setConfirm} />
          {error && <p className="adm-hint warn">{error}</p>}
        </div>
        <div className="adm-modal-foot">
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy}>Batal</button>
          <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
            {busy ? 'Menyimpan…' : 'Simpan password'}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Forgot password (login page) ──────────────────────────────────── */

export function ForgotPassword({ initialEmail, onBack }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await store.sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="adm-stack">
        <h1>Cek email kamu</h1>
        <p className="adm-muted">
          Kalau <strong>{email}</strong> terdaftar, link untuk membuat password baru sudah dikirim.
          Buka link itu di browser ini. Link hanya berlaku sebentar dan sekali pakai.
        </p>
        <p className="adm-hint">Tidak ada di inbox? Cek folder Spam / Promosi.</p>
        <button type="button" className="adm-btn adm-btn--block" onClick={onBack}>Kembali ke login</button>
      </div>
    );
  }

  return (
    <form className="adm-stack" onSubmit={submit}>
      <h1>Lupa password</h1>
      <p className="adm-muted">Masukkan email admin. Kami kirim link untuk membuat password baru.</p>
      <label className="adm-field">
        <span className="adm-field-label">Email</span>
        <input className="adm-input" type="email" autoComplete="username" required autoFocus
          value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="adm-hint warn">{error}</p>}
      <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
        {busy ? 'Mengirim…' : 'Kirim link reset'}
      </button>
      <button type="button" className="adm-linkbtn adm-linkbtn--center" onClick={onBack}>Kembali ke login</button>
    </form>
  );
}

/* ─── New password (opened from the reset email) ────────────────────── */

export function ResetPassword({ email, onDone }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const invalid = validate(pw, confirm);
    if (invalid) return setError(invalid);
    setBusy(true);
    setError('');
    try {
      await store.setNewPassword(pw);
      onDone();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="adm-stack" onSubmit={submit}>
      <h1>Buat password baru</h1>
      {email && <p className="adm-muted">Untuk akun <strong>{email}</strong>.</p>}
      <NewPasswordFields pw={pw} setPw={setPw} confirm={confirm} setConfirm={setConfirm} autoFocus />
      {error && <p className="adm-hint warn">{error}</p>}
      <button type="submit" className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
        {busy ? 'Menyimpan…' : 'Simpan & masuk'}
      </button>
    </form>
  );
}
