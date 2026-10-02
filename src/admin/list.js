import { uid } from '../lib/format.js';

/* Move arr[i] by dir (-1 up, +1 down); returns a new array. */
export function move(arr, i, dir) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/* Give every list entry a stable id (React keys in the editor).
   Ids are saved with the data, so this is a no-op after the first save. */
export function withIds(row) {
  const d = structuredClone(row.data || {});
  const tag = (arr) => (arr || []).map((x) => (x.id ? x : { id: uid(), ...x }));
  if (d.groups) d.groups = tag(d.groups).map((g) => ({ ...g, items: tag(g.items) }));
  if (d.items) d.items = tag(d.items);
  if (d.feats) d.feats = tag(d.feats);
  if (d.priceTable?.rows) d.priceTable = { ...d.priceTable, rows: tag(d.priceTable.rows) };
  return { ...row, data: d };
}
