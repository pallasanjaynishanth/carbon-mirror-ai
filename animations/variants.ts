import type { Variants } from 'framer-motion'

// ─── Page transitions ─────────────────────────────────────────────────────────
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

// ─── Fade up (cards, sections) ────────────────────────────────────────────────
export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function fadeUpDelay(delay: number): Variants {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { delay } },
  }
}

// ─── Stagger container ────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

// ─── Scale pop (badges, achievements) ─────────────────────────────────────────
export const scalePop: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
}

// ─── Float (ecosystem elements) ───────────────────────────────────────────────
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ─── Pulse glow (avatar health indicator) ─────────────────────────────────────
export const pulseGlow: Variants = {
  animate: {
    opacity: [0.6, 1, 0.6],
    scale: [1, 1.03, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ─── Slide in from right (modals, panels) ─────────────────────────────────────
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
}

// ─── Count-up number ───────────────────────────────────────────────────────────
export const countUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

// ─── Earth biome transition ───────────────────────────────────────────────────
export const biomeTransition: Variants = {
  thriving: { filter: 'saturate(1.2) brightness(1.05)' },
  healthy: { filter: 'saturate(1) brightness(1)' },
  stressed: { filter: 'saturate(0.85) brightness(0.95)' },
  degraded: { filter: 'saturate(0.6) brightness(0.85)' },
  critical: { filter: 'saturate(0.3) brightness(0.7)' },
}
