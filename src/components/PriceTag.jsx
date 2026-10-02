/* Copied from SweetieBatter_Web (same path) for live previews — keep in sync. */
/* Splits price into prefix + bold amount + muted unit.
   "Rp 24K / 3 pcs" → 24K  /3 pcs
   "Start from Rp 85K" → from  Rp 85K
   "Custom Quote" → Custom Quote */
export default function PriceTag({ price, className = '' }) {
  let prefix = '';
  let amount = price;
  let suffix = '';

  const from = price.match(/^(Start from|From)\s+(.*)$/i);
  if (from) {
    prefix = 'from';
    amount = from[2];
  }
  if (amount.includes(' / ')) {
    const [a, b] = amount.split(' / ');
    amount = a;
    suffix = '/ ' + b;
  }

  return (
    <span className={`sb-price ${className}`}>
      {prefix && <span className="sb-price-pre">{prefix}</span>}
      <span className="sb-price-amt">{amount}</span>
      {suffix && <span className="sb-price-unit">{suffix}</span>}
    </span>
  );
}
