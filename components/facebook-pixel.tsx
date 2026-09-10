"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { hasMarketingConsent } from "@/lib/marketing-consent";
import { useMarketingConsent } from "@/lib/use-marketing-consent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

function load(pixelId: string) {
  if (typeof window === "undefined" || !pixelId) return;
  if (window.fbq) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  const n: any = function (...args: unknown[]) {
    (n.q = n.q || []).push(args);
  };
  n.push = n;
  n.loaded = true;
  n.version = "2.0";
  n.queue = [];
  window.fbq = n as unknown as typeof window.fbq;
  window._fbq = n;

  window.fbq!("init", pixelId);
  window.fbq!("track", "PageView");
}

export function fbqEvent(event: string, params?: Record<string, unknown>) {
  if (hasMarketingConsent() && window.fbq) {
    window.fbq("track", event, params);
  }
}

export function FacebookPixel() {
  const pathname = usePathname();
  const consent = useMarketingConsent();

  useEffect(() => {
    if (!consent || !PIXEL_ID) return;
    load(PIXEL_ID);
  }, [consent]);

  useEffect(() => {
    if (!consent || !PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
    window.fbq("track", "PageView");
  }, [pathname, consent]);

  return null;
}
