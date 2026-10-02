/* Copied from SweetieBatter_Web (same path) for live previews — keep in sync. */
import { motion } from 'framer-motion';

/* Themed festive banner shown above the seasonal product grid.
   Must be rendered inside #seasonal.theme-<id> for its colours. */
export default function SeasonBanner({ season }) {
  return (
    <div className={`season-banner theme-${season.id}`}>
      <span className="season-banner-corner tl" aria-hidden="true">✦</span>
      <span className="season-banner-corner tr" aria-hidden="true">✦</span>
      <span className="season-banner-corner bl" aria-hidden="true">✦</span>
      <span className="season-banner-corner br" aria-hidden="true">✦</span>

      {season.motifs?.length > 0 && (
        <motion.div
          className="season-motifs"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          aria-hidden="true"
        >
          {season.motifs.map((m, i) => (
            <motion.span
              key={i}
              variants={{ hidden: { opacity: 0, y: 8, scale: 0.6 }, show: { opacity: 1, y: 0, scale: 1 } }}
            >
              {m}
            </motion.span>
          ))}
        </motion.div>
      )}

      {season.tagline && <div className="season-tagline">{season.tagline}</div>}
      {season.chars && <div className="season-chars">{season.chars}</div>}
      {season.intro && <p className="season-intro">{season.intro}</p>}
      {season.greeting && <p className="season-greeting">{season.greeting}</p>}
      {season.available && <span className="season-available">{season.available}</span>}
    </div>
  );
}
