# 🔐 Sweetie Batter — Admin (BE)

Panel admin untuk mengelola **menu** (Choux, Floss Cake, Premium Cake, Custom Order,
Cookies, + kategori baru) dan **edisi seasonal** (Christmas, Eid, CNY) di website
[SweetieBatter_Web](https://github.com/TinnTunn/SweetieBatter_Web).
Admin dibuka di **`<website>/admin`**.

```
            sweetiebatter.vercel.app/          sweetiebatter.vercel.app/admin
                     │                                     │ (rewrite di vercel.json FE)
          SweetieBatter_Web (FE)                SweetieBatter_Admin (BE, repo ini)
                     │ read                                │ write
                     └──────────────▶  Supabase  ◀─────────┘
                                   (DB + Storage + Auth)
```

Setelah klik **Simpan & publish**, website langsung ter-update tanpa perlu build atau
deploy ulang.

## 🚀 Menjalankan di laptop

Struktur folder yang disarankan (dua repo berdampingan):

```
SweetieBatter/
├── FE/   ← repo SweetieBatter_Web
└── BE/   ← repo ini
```

Jalankan keduanya di dua terminal:

```bash
cd BE && npm install && npm run dev   # admin, port 5174
cd FE && npm install && npm run dev   # website, port 5173
```

Lalu buka **http://localhost:5173/admin**. Dev server website meneruskan `/admin` ke
server admin di port 5174.

Tanpa `.env.local`, admin berjalan dalam **mode demo lokal**: tidak perlu login, dan data
hanya tersimpan di browser (tidak tampil di website). Mode ini cocok untuk mencoba UI.

## 1. Setup Supabase (sekali saja)

`supabase/schema.sql` berisi **semuanya**: tabel, keamanan (RLS), storage foto, akun admin,
dan **data menu awal** (semua menu + edisi seasonal yang sekarang tampil di website).

1. Buat project di https://supabase.com (pilih region Singapore).
2. Buka `supabase/schema.sql`, lalu ganti email di **BAGIAN 1**:
   ```sql
   admin_email text := 'GANTI-DENGAN-EMAIL-ADMIN@gmail.com';   -- ⬅️ GANTI INI
   ```
   Kalau lupa diganti, script berhenti dengan pesan *“Ganti dulu email admin…”* dan tidak
   ada yang berubah.
3. **SQL Editor → New query** → paste **seluruh isi** file → **Run**.
4. **Authentication → Users → Add user → Create new user**: pakai email yang **sama**
   dengan langkah 2 (centang *Auto Confirm User*).
5. (Disarankan) **Authentication → Sign In / Providers → Email**: matikan
   *Allow new users to sign up*.
6. Salin `.env.example` → `.env.local` di **FE dan BE**, lalu isi URL & key dari
   **Project Settings → API**.

File ini aman dijalankan ulang: menu yang sudah diedit dari admin **tidak** ditimpa.
Untuk menambah admin lain, jalankan:
```sql
insert into public.admin_users (email) values ('email-lain@contoh.com');
```

## 2. Deploy ke Vercel

Deploy **dua project Vercel** dari dua repo:

| Project Vercel | Repo | Environment variables |
|---|---|---|
| `sweetiebatter-admin` | SweetieBatter_Admin (ini) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `sweetiebatter` | SweetieBatter_Web | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |

1. **Deploy admin dulu**: Vercel → Add New → Project → import repo ini (preset *Vite*
   terdeteksi otomatis), isi env var, lalu Deploy. Catat URL-nya, misalnya
   `https://sweetiebatter-admin.vercel.app`.
2. Kalau URL admin **berbeda** dari `sweetiebatter-admin.vercel.app`, ganti URL tersebut
   di `vercel.json` repo FE, lalu commit.
3. **Deploy website** (repo FE) dengan cara yang sama.
4. Buka `https://<website>.vercel.app/admin`.

Saat domain `sweetiebatter.com` sudah dibeli, cukup tambahkan domain itu di project
Vercel **website** (Settings → Domains). Admin otomatis ikut di
`sweetiebatter.com/admin`, tanpa perlu ubah kode.

## 3. Mulai edit

Login di `<website>/admin`. Data menu sudah terisi dari `schema.sql`. Kalau database
kosong (misalnya BAGIAN 4 dihapus), admin menampilkan tombol **Import data awal**.

## 🔑 Password admin

Password dibuat di Supabase (**Authentication → Users → Add user**), tidak disimpan di kode.

| Situasi | Caranya |
|---|---|
| **Ganti password** (masih ingat yang lama) | Di admin, klik email kamu di kanan atas → **Ganti password** → isi password lama + baru |
| **Lupa password** | Di halaman login, klik **Lupa password?** → isi email → buka link dari email → buat password baru |
| Darurat (email tidak sampai) | SQL Editor: `update auth.users set encrypted_password = extensions.crypt('PasswordBaru', extensions.gen_salt('bf')) where email = 'email-admin@contoh.com';` lalu hapus query itu dari SQL Editor |

**Wajib diatur sekali supaya “Lupa password” jalan.** Buka Supabase → **Authentication → URL
Configuration**:
- **Site URL**: URL website, misalnya `https://sweetiebatter.vercel.app`.
- **Redirect URLs**: tambahkan `https://sweetiebatter.vercel.app/admin/**` dan
  `http://localhost:5173/admin/**` (ganti dengan domain asli kalau sudah dibeli).

Tanpa ini, link di email akan membuka halaman utama website, bukan form password baru.

Layanan email bawaan Supabase dibatasi: hanya beberapa email per jam, dan bisa jadi hanya
terkirim ke email anggota tim project Supabase. Pakai email yang sama dengan akun Supabase
kamu sebagai email admin. Kalau email tidak pernah sampai, atur **Custom SMTP** di
**Authentication → Emails → SMTP Settings**, atau pakai cara darurat di tabel atas.

## Cara pakai

| Mau apa | Caranya |
|---|---|
| Ubah harga / nama / foto | Klik item → edit → **Simpan item** → **Simpan & publish** |
| Tambah produk | **+ Tambah item** di grup yang diinginkan |
| Stok habis sementara | Tombol 👁 di item (atau toggle *Sembunyikan dari website*) |
| Sub-judul seperti Regular / Premium | **+ Tambah grup** |
| Kategori baru (mis. Hampers) | **+ Kategori baru** di sidebar |
| Urutan kategori | Tombol ↑ ↓ di sidebar (langsung tersimpan) |
| Musim Lebaran / Imlek / Natal | Buka edisinya → toggle **Tampil di website** |

**Format harga** mengikuti tampilan kartu: isi angka dalam ribuan dan satuan (opsional),
contohnya `24` + `3 pcs` → **Rp 24K** / 3 pcs. Centang *Start from* untuk “from Rp 85K”.
Pakai *Tulis bebas* hanya untuk harga non-standar.

**Foto** otomatis dikecilkan ke maks 1200px sebelum diupload (JPG/PNG/WEBP, maks 5MB).

## 📁 Struktur

```
├── index.html
├── supabase/schema.sql      ← tabel, RLS, storage bucket, allow-list admin
└── src/
    ├── main.jsx
    ├── admin/               ← UI admin (login, editor, form, store Supabase)
    ├── lib/config.js        ← env vars
    ├── lib/format.js        ← aturan format (badge, tint, harga) = kontrak dgn website
    ├── data/defaultContent.js  ← data awal untuk "Import data awal"
    └── components/, index.css, animations.js
                             ← SALINAN dari SweetieBatter_Web untuk live preview
```

### ⚠️ File yang harus sinkron dengan SweetieBatter_Web

Preview di admin memakai salinan komponen website (ditandai *“keep in sync”* di baris
pertama file). Kalau tampilan kartu di website diubah, salin ulang file ini:

- `src/components/ProductCard.jsx`, `PriceTag.jsx`, `SeasonBanner.jsx`
- `src/index.css`, `src/animations.js`
- `BADGES` di `src/lib/format.js` dan `WA_NUMBER` di `src/data/menu.js`

## Catatan

- **Project Supabase gratis di-pause** setelah ±7 hari tanpa aktivitas. Buka dashboard
  Supabase untuk mengaktifkannya lagi. Selama di-pause, website memakai data cadangan.
- **Backup JSON** di header admin mengunduh semua data menu sebagai file cadangan.
- Admin juga bisa dibuka langsung di URL Vercel-nya sendiri. Dalam kasus itu, isi
  `VITE_SITE_URL` (lihat `.env.example`) supaya preview foto bawaan tetap muncul.
