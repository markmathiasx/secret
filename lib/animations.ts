// lib/animations.ts — Unified Framer Motion presets for MDH3D
import type { Variants, Transition } from "framer-motion";
import { designTokens } from "@/lib/design-tokens";

const easeOut: Transition = { ease: [0.22, 1, 0.36, 1], duration: 0.4 };

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: easeOut },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const cardHover = {
  rest: {
    scale: 1,
    boxShadow: designTokens.shadows.medium,
    transition: easeOut,
  },
  hover: {
    scale: 1.02,
    boxShadow: designTokens.shadows.elevated,
    transition: easeOut,
  },
} satisfies Variants;

export const ctaPulse: Variants = {
  rest: { scale: 1 },
  pulse: {
    scale: [1, 1.04, 1],
    transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const confetti: Variants = {
  hidden: { scale: 0, rotate: 0, opacity: 0 },
  visible: {
    scale: [0, 1.2, 1],
    rotate: 360,
    opacity: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Returns whileInView props for scroll-reveal with optional delay */
export function scrollReveal(delay = 0) {
  return {
    initial: "hidden",
    whileInView: "visible",
    viewport: { once: true, margin: "-100px" },
    variants: {
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { ...easeOut, delay },
      },
    },
  } as const;
}
