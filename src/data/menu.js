/* Admin shim for the website's src/data/menu.js — ProductCard only needs
   waLink to render its "Order →" button. Keep WA_NUMBER in sync. */
export const WA_NUMBER = '6281361454768';
export const waLink = (msg) =>
  `https://wa.me/${WA_NUMBER}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
