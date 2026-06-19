import type { Variants } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: easeOutExpo,
    },
  },
};

export const fadeInUp = revealVariants;

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

export const productCardHover = {
  y: -6,
  scale: 1.012,
  transition: { duration: 0.25, ease: easeOutExpo },
};

export const magneticTap = {
  scale: 0.985,
  transition: { duration: 0.15, ease: easeOutExpo },
};
