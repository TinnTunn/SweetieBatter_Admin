-- =====================================================================
-- Sweetie Batter — Supabase setup (schema + data menu awal)
-- ---------------------------------------------------------------------
-- CARA PAKAI
--   1. Ganti email admin di BAGIAN 1 di bawah (satu baris saja).
--   2. Supabase Dashboard → SQL Editor → New query → paste SEMUA isi
--      file ini → Run.
--   3. Authentication → Users → Add user → Create new user, pakai email
--      yang SAMA dengan langkah 1 (centang "Auto Confirm User").
--   4. Buka <website>/admin dan login.
--
-- Aman dijalankan ulang: tabel/policy dibuat ulang, dan data menu yang
-- sudah kamu edit dari admin TIDAK akan ditimpa.
-- =====================================================================


-- ─── 1. EMAIL ADMIN ────────────────────────────────────────────────────
-- Hanya email di tabel ini yang boleh mengubah menu. Punya akun login
-- saja tidak cukup, jadi pendaftar asing tidak bisa mengedit.
create table if not exists public.admin_users (
  email text primary key
);
alter table public.admin_users enable row level security;
-- (tanpa policy → tabel ini tidak bisa dibaca/diubah dari browser)

do $$
declare
  admin_email text := 'GANTI-DENGAN-EMAIL-ADMIN@gmail.com';   -- ⬅️ GANTI INI
begin
  if admin_email ilike 'GANTI-%' then
    raise exception 'Ganti dulu email admin di BAGIAN 1 (admin_email), lalu Run lagi.';
  end if;
  insert into public.admin_users (email) values (lower(trim(admin_email)))
  on conflict (email) do nothing;
end $$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;


-- ─── 2. TABEL KONTEN (kategori menu, custom order, seasonal) ──────────
-- Satu baris = satu bagian website. Isi detail (grup, produk, harga,
-- tabel harga, banner seasonal) disimpan di kolom `data` (JSON).
create table if not exists public.sections (
  id         text primary key check (id ~ '^[a-z0-9][a-z0-9-]*$'),
  kind       text not null check (kind in ('menu', 'custom', 'season')),
  sort       integer not null default 0,
  visible    boolean not null default true,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists sections_touch on public.sections;
create trigger sections_touch before update on public.sections
  for each row execute function public.touch_updated_at();

alter table public.sections enable row level security;

drop policy if exists "sections: public read"  on public.sections;
drop policy if exists "sections: admin insert" on public.sections;
drop policy if exists "sections: admin update" on public.sections;
drop policy if exists "sections: admin delete" on public.sections;

create policy "sections: public read"  on public.sections
  for select using (true);
create policy "sections: admin insert" on public.sections
  for insert to authenticated with check (public.is_admin());
create policy "sections: admin update" on public.sections
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "sections: admin delete" on public.sections
  for delete to authenticated using (public.is_admin());


-- ─── 3. STORAGE FOTO PRODUK ────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "menu-images: public read"  on storage.objects;
drop policy if exists "menu-images: admin insert" on storage.objects;
drop policy if exists "menu-images: admin update" on storage.objects;
drop policy if exists "menu-images: admin delete" on storage.objects;

create policy "menu-images: public read"  on storage.objects
  for select using (bucket_id = 'menu-images');
create policy "menu-images: admin insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'menu-images' and public.is_admin());
create policy "menu-images: admin update" on storage.objects
  for update to authenticated using (bucket_id = 'menu-images' and public.is_admin());
create policy "menu-images: admin delete" on storage.objects
  for delete to authenticated using (bucket_id = 'menu-images' and public.is_admin());


-- ─── 4. DATA MENU AWAL ─────────────────────────────────────────────────
-- Menu & edisi seasonal yang sekarang tampil di website
-- (sama dengan src/data/defaultContent.js). Format tiap produk:
--   name   nama produk            desc   deskripsi 1–2 baris
--   price  "Rp 24K / 3 pcs" | "Start from Rp 85K" | "Rp 125K"
--   emoji  cadangan kalau foto tidak ada
--   tint   cream | choco | matcha | pink | taro | lemon
--   img    "assets/products/x.jpg" (foto bawaan) atau URL upload, atau null
--   badge  bestseller | Signature | new | limited (opsional)
--   hidden true = disembunyikan dari website (opsional)
-- `on conflict do nothing` → baris yang sudah ada tidak ditimpa.

insert into public.sections (id, kind, sort, visible, data) values
  -- Menu: Choux Au Craquelin
  ('choux', 'menu', 10, true, $json${
  "filterLabel": "🥐 Choux",
  "pill": "🥐 Choux",
  "title": "Choux Au Craquelin",
  "intro": "",
  "groups": [
    {
      "id": "choux-g1",
      "heading": "Regular",
      "items": [
        {
          "id": "choux-1",
          "name": "Vanilla",
          "desc": "Creamy vanilla custard, crispy craquelin topping",
          "price": "Rp 24K / 3 pcs",
          "emoji": "🍦",
          "tint": "cream",
          "img": "assets/products/choux-vanilla.jpg",
          "badge": "bestseller"
        },
        {
          "id": "choux-2",
          "name": "Chocolate",
          "desc": "Rich dark chocolate cream, crunchy craquelin",
          "price": "Rp 24K / 3 pcs",
          "emoji": "🍫",
          "tint": "choco",
          "img": "assets/products/choux-chocolate.jpg",
          "badge": "bestseller"
        }
      ]
    },
    {
      "id": "choux-g2",
      "heading": "Premium",
      "note": "(+2K / pc)",
      "noteInline": true,
      "items": [
        {
          "id": "choux-3",
          "name": "Cookies & Cream",
          "desc": "Oreo cream filling, cookie crumble topping",
          "price": "Rp 30K / 3 pcs",
          "emoji": "🍪",
          "tint": "cream",
          "img": "assets/products/choux-cookies-cream.jpg"
        },
        {
          "id": "choux-4",
          "name": "Matcha",
          "desc": "Silky matcha cream, earthy & aromatic",
          "price": "Rp 30K / 3 pcs",
          "emoji": "🍵",
          "tint": "matcha",
          "img": "assets/products/choux-matcha.jpg"
        },
        {
          "id": "choux-5",
          "name": "Lotus Biscoff",
          "desc": "Biscoff spread cream, caramel cookie crunch",
          "price": "Rp 30K / 3 pcs",
          "emoji": "🥮",
          "tint": "cream",
          "img": "assets/products/choux-biscoff.jpg",
          "badge": "bestseller"
        }
      ]
    },
    {
      "id": "choux-g3",
      "heading": "Assorted Special Choux",
      "note": "Box of 2 pcs Rp 30K · Box of 4 pcs Rp 60K",
      "items": [
        {
          "id": "choux-6",
          "name": "Ichigo Matcha",
          "desc": "Strawberry & matcha cream duo, berry fresh",
          "price": "Rp 30K / 2 pcs",
          "emoji": "🍓",
          "tint": "pink",
          "img": "assets/products/choux-ichigo-matcha.jpg"
        },
        {
          "id": "choux-7",
          "name": "Chocoberry",
          "desc": "Dark chocolate & blueberry cream blend",
          "price": "Rp 30K / 2 pcs",
          "emoji": "🫐",
          "tint": "taro",
          "img": "assets/products/choux-chocoberry.jpg"
        },
        {
          "id": "choux-8",
          "name": "Cheesy Caramel",
          "desc": "Salted caramel meets savory cream cheese",
          "price": "Rp 30K / 2 pcs",
          "emoji": "🧀",
          "tint": "lemon",
          "img": "assets/products/choux-cheesy-caramel.jpg"
        },
        {
          "id": "choux-9",
          "name": "Tiramisu Almond",
          "desc": "Espresso cream, mascarpone & toasted almond",
          "price": "Rp 30K / 2 pcs",
          "emoji": "☕",
          "tint": "choco",
          "img": "assets/products/choux-tiramisu.jpg"
        }
      ]
    }
  ],
  "priceTable": {
    "heading": "Choux Sizes & Pricing",
    "rows": [
      {
        "id": "choux-r1",
        "label": "Box of 3 pcs (Regular)",
        "value": "Rp 24K"
      },
      {
        "id": "choux-r2",
        "label": "Box of 6 pcs",
        "value": "Rp 48K"
      },
      {
        "id": "choux-r3",
        "label": "Box of 9 pcs",
        "value": "Rp 85K"
      },
      {
        "id": "choux-r4",
        "label": "Box of 12 pcs",
        "value": "Rp 112K"
      }
    ]
  }
}$json$::jsonb),

  -- Menu: Chicken Floss Cake
  ('floss', 'menu', 20, true, $json${
  "filterLabel": "🍰 Floss Cake",
  "pill": "🍰 Cake",
  "title": "Chicken Floss Cake",
  "intro": "Soft, savoury & seriously addictive — now in four flavor variants.",
  "groups": [
    {
      "id": "floss-g1",
      "heading": "",
      "items": [
        {
          "id": "floss-1",
          "name": "Original (OG)",
          "desc": "Classic chicken floss, creamy mayo topping",
          "price": "Rp 24K / 3 pcs",
          "emoji": "🐔",
          "tint": "lemon",
          "img": "assets/products/floss-original.jpg",
          "badge": "bestseller"
        },
        {
          "id": "floss-2",
          "name": "Mentai",
          "desc": "Spicy mentai sauce, extra savory kick",
          "price": "Rp 30K / 3 pcs",
          "emoji": "🌶️",
          "tint": "pink",
          "img": null
        },
        {
          "id": "floss-3",
          "name": "Truffle ✨",
          "desc": "Earthy truffle aroma, indulgent & rich",
          "price": "Rp 66K / 6 pcs",
          "emoji": "🍄",
          "tint": "choco",
          "img": null,
          "badge": "new"
        },
        {
          "id": "floss-4",
          "name": "Mix (OG × Mentai)",
          "desc": "Best of both worlds — floss meets mentai",
          "price": "Rp 36K / 4 pcs",
          "emoji": "🎨",
          "tint": "lemon",
          "img": null
        }
      ]
    }
  ],
  "priceTable": {
    "heading": "Flosscake Tower & Mix",
    "rows": [
      {
        "id": "floss-r1",
        "label": "Truffle — Box of 6",
        "value": "Rp 66K"
      },
      {
        "id": "floss-r2",
        "label": "Truffle — Box of 9",
        "value": "Rp 98K"
      },
      {
        "id": "floss-r3",
        "label": "Truffle — Box of 12",
        "value": "Rp 130K"
      },
      {
        "id": "floss-r4",
        "label": "Mix Box 6 (OG × Truffle)",
        "value": "Rp 57K"
      },
      {
        "id": "floss-r5",
        "label": "Mix Box 6 (Mentai × Truffle)",
        "value": "Rp 63K"
      },
      {
        "id": "floss-r6",
        "label": "Mix Box 6 (OG × Mentai × Truffle)",
        "value": "Rp 58K"
      },
      {
        "id": "floss-r7",
        "label": "Mix Box 12 (OG × Mentai × Truffle)",
        "value": "Rp 112K"
      },
      {
        "id": "floss-r8",
        "label": "Flosscake Tower — OG",
        "value": "Rp 210K"
      },
      {
        "id": "floss-r9",
        "label": "Flosscake Tower — OG × Mentai",
        "value": "Rp 224K"
      }
    ]
  }
}$json$::jsonb),

  -- Menu: Premium Cake
  ('cake', 'menu', 30, true, $json${
  "filterLabel": "🎂 Premium Cake",
  "pill": "🎂 Cake",
  "title": "Premium Cake",
  "intro": "Whole cake & roll cake collections, crafted for every occasion.",
  "groups": [
    {
      "id": "cake-g1",
      "heading": "",
      "items": [
        {
          "id": "cake-1",
          "name": "Premium Marble",
          "desc": "Classic marble swirl, rich buttery crumb",
          "price": "Rp 168K / loaf",
          "emoji": "🍫",
          "tint": "cream",
          "img": "assets/products/marble-cake.jpg",
          "badge": "bestseller"
        },
        {
          "id": "cake-2",
          "name": "Pandan Chiffon",
          "desc": "Light & airy pandan, fragrant & soft",
          "price": "Rp 105K / loaf",
          "emoji": "🌿",
          "tint": "matcha",
          "img": "assets/products/cake-pandan.jpg"
        },
        {
          "id": "cake-3",
          "name": "Chocolate Chiffon",
          "desc": "Moist chocolate chiffon, deep cocoa flavor",
          "price": "Rp 105K / loaf",
          "emoji": "🍫",
          "tint": "choco",
          "img": "assets/products/cake-choco-chiffon.jpg"
        },
        {
          "id": "cake-4",
          "name": "Chicken Floss RollCake",
          "desc": "Soft sponge, generous chicken floss filling",
          "price": "Rp 92K / roll",
          "emoji": "🐔",
          "tint": "lemon",
          "img": "assets/products/roll-chicken-floss.jpg"
        },
        {
          "id": "cake-5",
          "name": "Nutella RollCake",
          "desc": "Hazelnut Nutella cream, indulgent roll cake",
          "price": "Rp 88K / roll",
          "emoji": "🌰",
          "tint": "choco",
          "img": null,
          "badge": "bestseller"
        },
        {
          "id": "cake-6",
          "name": "Blueberry RollCake",
          "desc": "Fresh blueberry cream, soft sponge roll",
          "price": "Rp 75K / roll",
          "emoji": "🫐",
          "tint": "taro",
          "img": "assets/products/roll-blueberry.jpg"
        },
        {
          "id": "cake-7",
          "name": "Strawberry RollCake",
          "desc": "Fresh strawberry cream, soft sponge roll",
          "price": "Rp 75K / roll",
          "emoji": "🍓",
          "tint": "pink",
          "img": null
        },
        {
          "id": "cake-8",
          "name": "Chocolate RollCake",
          "desc": "Rich chocolate cream, soft sponge roll",
          "price": "Rp 75K / roll",
          "emoji": "🍫",
          "tint": "choco",
          "img": null
        }
      ]
    }
  ],
  "priceTable": null
}$json$::jsonb),

  -- Menu: Made Just for You
  ('custom', 'custom', 40, true, $json${
  "filterLabel": "✨ Custom Order",
  "pill": "✨ Custom Order",
  "title": "Made Just for You",
  "intro": "Have a specific design or flavor combination in mind? We'll work together to bring your vision to life.",
  "heading": "Custom Birthday Cake, Wedding Favors & More",
  "body": "We accept custom orders for special occasions — birthday cakes, wedding souvenirs, corporate hampers, and event treats. Tell us your vision and we'll make it happen.",
  "feats": [
    {
      "id": "custom-f1",
      "icon": "🎂",
      "text": "Custom Birthday & Celebration Cakes"
    },
    {
      "id": "custom-f2",
      "icon": "💍",
      "text": "Wedding Favors & Souvenirs"
    },
    {
      "id": "custom-f3",
      "icon": "🏢",
      "text": "Corporate Hampers & Bulk Orders"
    },
    {
      "id": "custom-f4",
      "icon": "📅",
      "text": "Pre-order H-3 to H-7 (bulk)"
    }
  ]
}$json$::jsonb),

  -- Menu: Signature Cookies
  ('cookies', 'menu', 50, true, $json${
  "filterLabel": "🍪 Cookies",
  "pill": "🍪 Cookies",
  "title": "Signature Cookies",
  "intro": "Handcrafted butter cookies, pastries & sweet jars — perfect for gifting or everyday snacking.",
  "groups": [
    {
      "id": "cookies-g1",
      "heading": "",
      "items": [
        {
          "id": "cookies-1",
          "name": "Butter Cookies Jar",
          "desc": "Classic Danish-style butter cookies, crumbly & rich",
          "price": "Start from Rp 85K",
          "emoji": "🍪",
          "tint": "lemon",
          "img": "assets/products/cookies-snowball.jpg",
          "badge": "Signature"
        }
      ]
    }
  ],
  "priceTable": null
}$json$::jsonb),

  -- Seasonal: 🎄 Christmas
  ('christmas', 'season', 10, true, $json${
  "label": "🎄 Christmas",
  "tagline": "Merry Christmas Edition",
  "chars": "🎄 ❄️ 🎁 🦌 ⭐",
  "intro": "Feel the warmth of Christmas — cinnamon, gingerbread, warm chocolate aromas to accompany your family moments.",
  "available": "📅 Available December · Order H-3 to secure",
  "motifs": [
    "🎄",
    "🎁",
    "⛄",
    "🔔",
    "⭐"
  ],
  "glyphs": [
    "❄",
    "❅",
    "❆"
  ],
  "pColor": "#ffffff",
  "greeting": "Wishing you a cozy, sweet & merry holiday season 🤍",
  "items": [
    {
      "id": "christmas-1",
      "name": "Christmas Tree Cookies Jar",
      "desc": "Butter cookies in tree & star shapes with festive glaze.",
      "price": "Rp 125K",
      "emoji": "🎄",
      "tint": "matcha",
      "img": "assets/products/coming-soon.png",
      "badge": "limited"
    },
    {
      "id": "christmas-2",
      "name": "Gingerbread Man Cookies",
      "desc": "Classic ginger cookies with white royal icing.",
      "price": "Rp 95K",
      "emoji": "🍪",
      "tint": "choco",
      "img": "assets/products/coming-soon.png",
      "badge": "bestseller"
    },
    {
      "id": "christmas-3",
      "name": "Yule Log Cake",
      "desc": "French log-shaped roll cake with chocolate ganache.",
      "price": "Rp 285K",
      "emoji": "🍰",
      "tint": "choco",
      "img": "assets/products/coming-soon.png"
    },
    {
      "id": "christmas-4",
      "name": "Christmas Joy Hampers",
      "desc": "3 jars + mini yule log + greeting card in green-gold box.",
      "price": "Rp 350K",
      "emoji": "🎁",
      "tint": "pink",
      "img": "assets/products/coming-soon.png"
    }
  ]
}$json$::jsonb),

  -- Seasonal: 🌙 Eid Mubarak
  ('eid', 'season', 20, true, $json${
  "label": "🌙 Eid Mubarak",
  "tagline": "Eid Mubarak Edition",
  "chars": "✦ Eid Mubarak ✦",
  "intro": "Celebrate Eid with our premium halal collection. Made for guests, hampers, and Lebaran joy.",
  "available": "📅 Available Ramadan – Syawal · Pre-order H-7",
  "motifs": [
    "🌙",
    "🕌",
    "🏮",
    "✨",
    "🌟"
  ],
  "glyphs": [
    "✦",
    "✧",
    "⋆"
  ],
  "pColor": "#e9cf8f",
  "greeting": "Minal Aidin wal Faizin — mohon maaf lahir & batin 🌙",
  "items": [
    {
      "id": "eid-1",
      "name": "Premium Kastengel",
      "desc": "Classic Eid cheese sticks with premium edam & cheddar.",
      "price": "Rp 110K",
      "emoji": "🍪",
      "tint": "lemon",
      "img": "assets/products/coming-soon.png",
      "badge": "bestseller"
    },
    {
      "id": "eid-2",
      "name": "Special Edition Nastar",
      "desc": "Pineapple tarts with homemade jam & shiny egg yolk.",
      "price": "Rp 95K",
      "emoji": "🍍",
      "tint": "lemon",
      "img": "assets/products/coming-soon.png"
    },
    {
      "id": "eid-3",
      "name": "Almond Snowball Cookies",
      "desc": "Crescent cookies coated with white powdered sugar.",
      "price": "Rp 88K",
      "emoji": "🌙",
      "tint": "cream",
      "img": "assets/products/coming-soon.png"
    },
    {
      "id": "eid-4",
      "name": "Lebaran Hampers Special",
      "desc": "Nastar + Kastengel + Snowball + mini Lapis in green-gold box.",
      "price": "Rp 380K",
      "emoji": "🎁",
      "tint": "matcha",
      "img": "assets/products/coming-soon.png"
    }
  ]
}$json$::jsonb),

  -- Seasonal: 🧧 Chinese New Year
  ('cny', 'season', 30, true, $json${
  "label": "🧧 Chinese New Year",
  "tagline": "Golden Blessings Edition",
  "chars": "福 · 禄 · 寿 · 喜",
  "intro": "Celebrate CNY wrapped in red & gold, full of fortune & abundance. Limited stock — order early!",
  "available": "📅 Available January – February · Limited Stock!",
  "motifs": [
    "🧧",
    "🏮",
    "🐉",
    "🪙",
    "🍊"
  ],
  "glyphs": [
    "✦",
    "❁",
    "♦"
  ],
  "pColor": "#f1c40f",
  "greeting": "恭喜发财 — Gong Xi Fa Cai! May fortune & joy be yours 🧧",
  "items": [
    {
      "id": "cny-1",
      "name": "Golden Prosperity",
      "desc": "Butter cookies in gold coin & 福 fortune shapes.",
      "price": "Rp 120K",
      "emoji": "🍪",
      "tint": "lemon",
      "img": "assets/products/coming-soon.png",
      "badge": "limited"
    },
    {
      "id": "cny-2",
      "name": "Pineapple Tart Nanas",
      "desc": "Premium pineapple tarts with caramelised jam.",
      "price": "Rp 95K",
      "emoji": "🍍",
      "tint": "lemon",
      "img": "assets/products/coming-soon.png"
    },
    {
      "id": "cny-3",
      "name": "Red Bean Mochi Cake",
      "desc": "Matcha layer cake with red bean & chewy mochi.",
      "price": "Rp 220K",
      "emoji": "🎂",
      "tint": "pink",
      "img": "assets/products/coming-soon.png"
    },
    {
      "id": "cny-4",
      "name": "Dragon's Fortune Box",
      "desc": "3 cookie jars + 1 cake + blessing card in luxury wooden box.",
      "price": "Rp 550K",
      "emoji": "🐉",
      "tint": "choco",
      "img": "assets/products/coming-soon.png"
    }
  ]
}$json$::jsonb)
on conflict (id) do nothing;
