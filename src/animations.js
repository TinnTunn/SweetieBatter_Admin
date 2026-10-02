/* Copied from SweetieBatter_Web (same path) for live previews — keep in sync. */
/* Shared Framer Motion variants — soft, cozy, gentle (never kinetic) */

const ease = [0.32, 0.72, 0.35, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const cardIn = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } },
};

/* Default viewport config for whileInView */
export const viewport = { once: true, amount: 0.2 };
