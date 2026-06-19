"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { revealVariants } from "@/lib/animations";

type Direction = "up" | "down" | "left" | "right" | "scale";

const OFFSETS: Record<Direction, { x?: number; y?: number; scale?: number }> = {
  up: { y: 28 },
  down: { y: -28 },
  left: { x: -28 },
  right: { x: 28 },
  scale: { scale: 0.96 },
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const offset = OFFSETS[direction];

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          ...revealVariants.hidden,
          ...offset,
        },
        visible: {
          ...revealVariants.visible,
          transition: {
            ...(typeof revealVariants.visible === "object" ? revealVariants.visible.transition : {}),
            delay: delay / 1000,
          },
        },
      }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -48px 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className = "",
  staggerMs = 100,
}: {
  children: ReactNode[];
  className?: string;
  staggerMs?: number;
}) {
  return (
    <div className={className}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * staggerMs} direction="up">
          {child}
        </Reveal>
      ))}
    </div>
  );
}
