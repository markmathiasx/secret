"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/25 bg-black/60 text-cyan-100 shadow-[0_0_24px_rgba(3,233,244,0.15)] backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-cyan-300/40 hover:shadow-[0_0_36px_rgba(3,233,244,0.25)] animate-fadeInUp"
      aria-label="Voltar ao topo"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
