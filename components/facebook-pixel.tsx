"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

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
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", event, params);
  }
}

export function FacebookPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    load(PIXEL_ID);
  }, []);

  useEffect(() => {
    if (!PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
    window.fbq("track", "PageView");
  }, [pathname]);

  if (!PIXEL_ID) return null;

  return (
    <noscript>
      {/* Meta Pixel requires a noscript image beacon fallback for non-JS clients. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        height={1}
        width={1}
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
