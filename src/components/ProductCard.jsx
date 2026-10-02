/* Copied from SweetieBatter_Web (same path) for live previews — keep in sync. */
import { useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { cardIn } from '../animations.js';
import { waLink } from '../data/menu.js';
import { useLightbox } from '../context/Lightbox.jsx';
import { BADGES, resolveImg } from '../lib/format.js';
import PriceTag from './PriceTag.jsx';

export default function ProductCard({ item }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = resolveImg(item.img);
  const showImg = src && !failed;
  const openLightbox = useLightbox();

  // Subtle 3D tilt on pointer move
  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 6);
    rx.set(-py * 6);
  };
  const reset = () => { rx.set(0); ry.set(0); };

  const badge = item.badge ? BADGES[item.badge] : null;
  const msg = `Halo Sweetie Batter, saya mau order ${item.name.replace(/\s*✨/, '')}`;

  return (
    <motion.article
      className="sb-card"
      variants={cardIn}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      whileHover={{ y: -6 }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      <button
        type="button"
        className={`sb-card-img ${item.tint || ''}`}
        onClick={() => openLightbox({ ...item, img: src })}
        aria-label={`View ${item.name}`}
      >
        <span className="sb-card-emoji" aria-hidden="true">{item.emoji}</span>
        {showImg && (
          <img
            className={`sb-card-photo ${loaded ? 'loaded' : ''}`}
            src={src}
            alt={item.name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
        {badge && <span className={`sb-card-sticker ${badge.cls}`}>{badge.label}</span>}
      </button>
      <div className="sb-card-body">
        <div className="sb-card-name">{item.name}</div>
        <div className="sb-card-desc">{item.desc}</div>
        <div className="sb-card-footer">
          <PriceTag price={item.price} />
          <a className="sb-card-cta" href={waLink(msg)} target="_blank" rel="noopener noreferrer">
            Order →
          </a>
        </div>
      </div>
    </motion.article>
  );
}
