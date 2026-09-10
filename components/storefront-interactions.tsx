"use client";

import { useEffect } from "react";

export function StorefrontInteractions() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    const move = (event: PointerEvent) => {
      if (preference.matches || !pointer.matches) return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(".experience-collection") : null;
      if (!target) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = target.getBoundingClientRect();
        target.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
        target.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      });
    };
    document.addEventListener("pointermove", move, { passive: true });
    return () => {
      document.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
