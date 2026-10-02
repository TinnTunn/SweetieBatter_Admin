/* =====================================================================
   Sweetie Batter — Default menu & seasonal content
   ---------------------------------------------------------------------
   Seed data for "Import data awal" in the admin. The website repo keeps
   an identical copy (SweetieBatter_Web/src/data/defaultContent.js) as its
   offline fallback — update both if you change the defaults.

   Row shape (mirrors the `sections` table):
     { id, kind: 'menu' | 'custom' | 'season', sort, visible, data }

   `img` is either a path relative to the site root
   ('assets/products/x.jpg') or a full URL (Supabase Storage upload).
   `img: null` → the card shows the emoji on the tint background.
   ===================================================================== */

const P = (name) => `assets/products/${name}`;

/* ─── CHOUX AU CRAQUELIN ─────────────────────────────────────────────── */
const choux = {
  filterLabel: '🥐 Choux',
  pill: '🥐 Choux',
  title: 'Choux Au Craquelin',
  intro: '',
  groups: [
    {
      heading: 'Regular',
      items: [
        { name: 'Vanilla',   desc: 'Creamy vanilla custard, crispy craquelin topping', price: 'Rp 24K / 3 pcs', emoji: '🍦', tint: 'cream',  img: P('choux-vanilla.jpg'),       badge: 'bestseller' },
        { name: 'Chocolate', desc: 'Rich dark chocolate cream, crunchy craquelin',      price: 'Rp 24K / 3 pcs', emoji: '🍫', tint: 'choco',  img: P('choux-chocolate.jpg'),     badge: 'bestseller' },
      ],
    },
    {
      heading: 'Premium',
      note: '(+2K / pc)',
      noteInline: true,
      items: [
        { name: 'Cookies & Cream', desc: 'Oreo cream filling, cookie crumble topping', price: 'Rp 30K / 3 pcs', emoji: '🍪', tint: 'cream',  img: P('choux-cookies-cream.jpg') },
        { name: 'Matcha',          desc: 'Silky matcha cream, earthy & aromatic',       price: 'Rp 30K / 3 pcs', emoji: '🍵', tint: 'matcha', img: P('choux-matcha.jpg') },
        { name: 'Lotus Biscoff',   desc: 'Biscoff spread cream, caramel cookie crunch', price: 'Rp 30K / 3 pcs', emoji: '🥮', tint: 'cream',  img: P('choux-biscoff.jpg'), badge: 'bestseller' },
      ],
    },
    {
      heading: 'Assorted Special Choux',
      note: 'Box of 2 pcs Rp 30K · Box of 4 pcs Rp 60K',
      items: [
        { name: 'Ichigo Matcha',   desc: 'Strawberry & matcha cream duo, berry fresh',   price: 'Rp 30K / 2 pcs', emoji: '🍓', tint: 'pink',   img: P('choux-ichigo-matcha.jpg') },
        { name: 'Chocoberry',      desc: 'Dark chocolate & blueberry cream blend',       price: 'Rp 30K / 2 pcs', emoji: '🫐', tint: 'taro',   img: P('choux-chocoberry.jpg') },
        { name: 'Cheesy Caramel',  desc: 'Salted caramel meets savory cream cheese',     price: 'Rp 30K / 2 pcs', emoji: '🧀', tint: 'lemon',  img: P('choux-cheesy-caramel.jpg') },
        { name: 'Tiramisu Almond', desc: 'Espresso cream, mascarpone & toasted almond',  price: 'Rp 30K / 2 pcs', emoji: '☕', tint: 'choco',  img: P('choux-tiramisu.jpg') },
      ],
    },
  ],
  priceTable: {
    heading: 'Choux Sizes & Pricing',
    rows: [
      { label: 'Box of 3 pcs (Regular)', value: 'Rp 24K' },
      { label: 'Box of 6 pcs',           value: 'Rp 48K' },
      { label: 'Box of 9 pcs',           value: 'Rp 85K' },
      { label: 'Box of 12 pcs',          value: 'Rp 112K' },
    ],
  },
};

/* ─── CHICKEN FLOSS CAKE ─────────────────────────────────────────────── */
const floss = {
  filterLabel: '🍰 Floss Cake',
  pill: '🍰 Cake',
  title: 'Chicken Floss Cake',
  intro: 'Soft, savoury & seriously addictive — now in four flavor variants.',
  groups: [
    {
      heading: '',
      items: [
        { name: 'Original (OG)',     desc: 'Classic chicken floss, creamy mayo topping', price: 'Rp 24K / 3 pcs', emoji: '🐔',   tint: 'lemon', img: P('floss-original.jpg'), badge: 'bestseller' },
        { name: 'Mentai',            desc: 'Spicy mentai sauce, extra savory kick',       price: 'Rp 30K / 3 pcs', emoji: '🌶️', tint: 'pink',  img: null },
        { name: 'Truffle ✨',        desc: 'Earthy truffle aroma, indulgent & rich',      price: 'Rp 66K / 6 pcs', emoji: '🍄',   tint: 'choco', img: null, badge: 'new' },
        { name: 'Mix (OG × Mentai)', desc: 'Best of both worlds — floss meets mentai',    price: 'Rp 36K / 4 pcs', emoji: '🎨',   tint: 'lemon', img: null },
      ],
    },
  ],
  priceTable: {
    heading: 'Flosscake Tower & Mix',
    rows: [
      { label: 'Truffle — Box of 6',                  value: 'Rp 66K' },
      { label: 'Truffle — Box of 9',                  value: 'Rp 98K' },
      { label: 'Truffle — Box of 12',                 value: 'Rp 130K' },
      { label: 'Mix Box 6 (OG × Truffle)',            value: 'Rp 57K' },
      { label: 'Mix Box 6 (Mentai × Truffle)',        value: 'Rp 63K' },
      { label: 'Mix Box 6 (OG × Mentai × Truffle)',   value: 'Rp 58K' },
      { label: 'Mix Box 12 (OG × Mentai × Truffle)',  value: 'Rp 112K' },
      { label: 'Flosscake Tower — OG',                value: 'Rp 210K' },
      { label: 'Flosscake Tower — OG × Mentai',       value: 'Rp 224K' },
    ],
  },
};

/* ─── PREMIUM CAKE ───────────────────────────────────────────────────── */
const cake = {
  filterLabel: '🎂 Premium Cake',
  pill: '🎂 Cake',
  title: 'Premium Cake',
  intro: 'Whole cake & roll cake collections, crafted for every occasion.',
  groups: [
    {
      heading: '',
      items: [
        { name: 'Premium Marble',         desc: 'Classic marble swirl, rich buttery crumb',     price: 'Rp 168K / loaf', emoji: '🍫', tint: 'cream',  img: P('marble-cake.jpg'),         badge: 'bestseller' },
        { name: 'Pandan Chiffon',         desc: 'Light & airy pandan, fragrant & soft',         price: 'Rp 105K / loaf', emoji: '🌿', tint: 'matcha', img: P('cake-pandan.jpg') },
        { name: 'Chocolate Chiffon',      desc: 'Moist chocolate chiffon, deep cocoa flavor',   price: 'Rp 105K / loaf', emoji: '🍫', tint: 'choco',  img: P('cake-choco-chiffon.jpg') },
        { name: 'Chicken Floss RollCake', desc: 'Soft sponge, generous chicken floss filling',  price: 'Rp 92K / roll',  emoji: '🐔', tint: 'lemon',  img: P('roll-chicken-floss.jpg') },
        { name: 'Nutella RollCake',       desc: 'Hazelnut Nutella cream, indulgent roll cake',  price: 'Rp 88K / roll',  emoji: '🌰', tint: 'choco',  img: null, badge: 'bestseller' },
        { name: 'Blueberry RollCake',     desc: 'Fresh blueberry cream, soft sponge roll',      price: 'Rp 75K / roll',  emoji: '🫐', tint: 'taro',   img: P('roll-blueberry.jpg') },
        { name: 'Strawberry RollCake',    desc: 'Fresh strawberry cream, soft sponge roll',     price: 'Rp 75K / roll',  emoji: '🍓', tint: 'pink',   img: null },
        { name: 'Chocolate RollCake',     desc: 'Rich chocolate cream, soft sponge roll',       price: 'Rp 75K / roll',  emoji: '🍫', tint: 'choco',  img: null },
      ],
    },
  ],
  priceTable: null,
};

/* ─── CUSTOM ORDER ───────────────────────────────────────────────────── */
const custom = {
  filterLabel: '✨ Custom Order',
  pill: '✨ Custom Order',
  title: 'Made Just for You',
  intro: "Have a specific design or flavor combination in mind? We'll work together to bring your vision to life.",
  heading: 'Custom Birthday Cake, Wedding Favors & More',
  body: "We accept custom orders for special occasions — birthday cakes, wedding souvenirs, corporate hampers, and event treats. Tell us your vision and we'll make it happen.",
  feats: [
    { icon: '🎂', text: 'Custom Birthday & Celebration Cakes' },
    { icon: '💍', text: 'Wedding Favors & Souvenirs' },
    { icon: '🏢', text: 'Corporate Hampers & Bulk Orders' },
    { icon: '📅', text: 'Pre-order H-3 to H-7 (bulk)' },
  ],
};

/* ─── COOKIES ────────────────────────────────────────────────────────── */
const cookies = {
  filterLabel: '🍪 Cookies',
  pill: '🍪 Cookies',
  title: 'Signature Cookies',
  intro: 'Handcrafted butter cookies, pastries & sweet jars — perfect for gifting or everyday snacking.',
  groups: [
    {
      heading: '',
      items: [
        { name: 'Butter Cookies Jar', desc: 'Classic Danish-style butter cookies, crumbly & rich', price: 'Start from Rp 85K', emoji: '🍪', tint: 'lemon', img: P('cookies-snowball.jpg'), badge: 'Signature' },
      ],
    },
  ],
  priceTable: null,
};

/* ─── SEASONAL ───────────────────────────────────────────────────────── */
const christmas = {
  label: '🎄 Christmas',
  tagline: 'Merry Christmas Edition',
  chars: '🎄 ❄️ 🎁 🦌 ⭐',
  intro: 'Feel the warmth of Christmas — cinnamon, gingerbread, warm chocolate aromas to accompany your family moments.',
  available: '📅 Available December · Order H-3 to secure',
  motifs: ['🎄', '🎁', '⛄', '🔔', '⭐'],
  glyphs: ['❄', '❅', '❆'],
  pColor: '#ffffff',
  greeting: 'Wishing you a cozy, sweet & merry holiday season 🤍',
  items: [
    { name: 'Christmas Tree Cookies Jar', desc: 'Butter cookies in tree & star shapes with festive glaze.',   price: 'Rp 125K', emoji: '🎄', tint: 'matcha', img: P('coming-soon.png'), badge: 'limited' },
    { name: 'Gingerbread Man Cookies',    desc: 'Classic ginger cookies with white royal icing.',            price: 'Rp 95K',  emoji: '🍪', tint: 'choco',  img: P('coming-soon.png'), badge: 'bestseller' },
    { name: 'Yule Log Cake',              desc: 'French log-shaped roll cake with chocolate ganache.',       price: 'Rp 285K', emoji: '🍰', tint: 'choco',  img: P('coming-soon.png') },
    { name: 'Christmas Joy Hampers',      desc: '3 jars + mini yule log + greeting card in green-gold box.', price: 'Rp 350K', emoji: '🎁', tint: 'pink',   img: P('coming-soon.png') },
  ],
};

const eid = {
  label: '🌙 Eid Mubarak',
  tagline: 'Eid Mubarak Edition',
  chars: '✦ Eid Mubarak ✦',
  intro: 'Celebrate Eid with our premium halal collection. Made for guests, hampers, and Lebaran joy.',
  available: '📅 Available Ramadan – Syawal · Pre-order H-7',
  motifs: ['🌙', '🕌', '🏮', '✨', '🌟'],
  glyphs: ['✦', '✧', '⋆'],
  pColor: '#e9cf8f',
  greeting: 'Minal Aidin wal Faizin — mohon maaf lahir & batin 🌙',
  items: [
    { name: 'Premium Kastengel',       desc: 'Classic Eid cheese sticks with premium edam & cheddar.',       price: 'Rp 110K', emoji: '🍪', tint: 'lemon',  img: P('coming-soon.png'), badge: 'bestseller' },
    { name: 'Special Edition Nastar',  desc: 'Pineapple tarts with homemade jam & shiny egg yolk.',          price: 'Rp 95K',  emoji: '🍍', tint: 'lemon',  img: P('coming-soon.png') },
    { name: 'Almond Snowball Cookies', desc: 'Crescent cookies coated with white powdered sugar.',           price: 'Rp 88K',  emoji: '🌙', tint: 'cream',  img: P('coming-soon.png') },
    { name: 'Lebaran Hampers Special', desc: 'Nastar + Kastengel + Snowball + mini Lapis in green-gold box.', price: 'Rp 380K', emoji: '🎁', tint: 'matcha', img: P('coming-soon.png') },
  ],
};

const cny = {
  label: '🧧 Chinese New Year',
  tagline: 'Golden Blessings Edition',
  chars: '福 · 禄 · 寿 · 喜',
  intro: 'Celebrate CNY wrapped in red & gold, full of fortune & abundance. Limited stock — order early!',
  available: '📅 Available January – February · Limited Stock!',
  motifs: ['🧧', '🏮', '🐉', '🪙', '🍊'],
  glyphs: ['✦', '❁', '♦'],
  pColor: '#f1c40f',
  greeting: '恭喜发财 — Gong Xi Fa Cai! May fortune & joy be yours 🧧',
  items: [
    { name: 'Golden Prosperity',    desc: 'Butter cookies in gold coin & 福 fortune shapes.',              price: 'Rp 120K', emoji: '🍪', tint: 'lemon', img: P('coming-soon.png'), badge: 'limited' },
    { name: 'Pineapple Tart Nanas', desc: 'Premium pineapple tarts with caramelised jam.',                 price: 'Rp 95K',  emoji: '🍍', tint: 'lemon', img: P('coming-soon.png') },
    { name: 'Red Bean Mochi Cake',  desc: 'Matcha layer cake with red bean & chewy mochi.',                price: 'Rp 220K', emoji: '🎂', tint: 'pink',  img: P('coming-soon.png') },
    { name: "Dragon's Fortune Box", desc: '3 cookie jars + 1 cake + blessing card in luxury wooden box.', price: 'Rp 550K', emoji: '🐉', tint: 'choco', img: P('coming-soon.png') },
  ],
};

export const DEFAULT_SECTIONS = [
  { id: 'choux',     kind: 'menu',   sort: 10, visible: true, data: choux },
  { id: 'floss',     kind: 'menu',   sort: 20, visible: true, data: floss },
  { id: 'cake',      kind: 'menu',   sort: 30, visible: true, data: cake },
  { id: 'custom',    kind: 'custom', sort: 40, visible: true, data: custom },
  { id: 'cookies',   kind: 'menu',   sort: 50, visible: true, data: cookies },
  { id: 'christmas', kind: 'season', sort: 10, visible: true, data: christmas },
  { id: 'eid',       kind: 'season', sort: 20, visible: true, data: eid },
  { id: 'cny',       kind: 'season', sort: 30, visible: true, data: cny },
];

/* Seasonal themes are styled in index.css (#seasonal.theme-<id>), so the
   set of seasons is fixed — admin can edit and show/hide them, not add. */
export const SEASON_IDS = ['christmas', 'eid', 'cny'];
