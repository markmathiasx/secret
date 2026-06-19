"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { useState } from "react";
import { magneticTap } from "@/lib/animations";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  children: ReactNode;
  external?: boolean;
};

export function MagneticLink({ href, children, className, external = false, ...props }: Props) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  const motionProps = prefersReducedMotion
    ? {}
    : {
        animate: offset,
        whileTap: magneticTap,
        transition: { type: "spring", stiffness: 260, damping: 18, mass: 0.25 },
        onMouseMove: (event: MouseEvent<HTMLElement>) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;
          setOffset({ x, y });
        },
        onMouseLeave: () => setOffset({ x: 0, y: 0 }),
      };

  if (external) {
    return (
      <motion.a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...motionProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.div {...motionProps} className="inline-flex">
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    </motion.div>
  );
}
