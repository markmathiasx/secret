"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

export function WhatsAppFloat() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [hidden, setHidden] = useState(false);
  const isSensitiveRoute = pathname ? ["/checkout", "/login", "/conta", "/painel-mdh-85"].some((route) => pathname.startsWith(route)) : false;
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  useEffect(() => {
    if (isSensitiveRoute) {
      setCompact(true);
      return;
    }
    setCompact(false);
  }, [isSensitiveRoute]);

  useEffect(() => {
    let lastY = window.scrollY;
    let idleTimer: number | null = null;

    const restore = () => {
      setHidden(false);
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }
      idleTimer = window.setTimeout(() => setHidden(true), 24_000);
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;

      if (currentY > 180 && delta > 16) {
        setCompact(true);
      } else if (delta < -24 && !isSensitiveRoute) {
        setCompact(false);
      }

      lastY = currentY;
      restore();
    };

    const onActivity = () => restore();

    restore();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (idleTimer) {
        window.clearTimeout(idleTimer);
      }
    };
  }, [isSensitiveRoute]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir atendimento no WhatsApp"
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15 text-emerald-100 shadow-glow backdrop-blur transition-all duration-300 hover:bg-emerald-400/20 ${
        compact ? "h-12 w-12 px-0" : "gap-2 px-5 py-3 text-sm font-semibold"
      } ${hidden ? "translate-y-16 opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
    >
      <MessageCircleMore className="h-4 w-4" />
      {compact ? null : "WhatsApp"}
    </a>
  );
}
