"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

type TikTokQueue = {
  page?: () => void;
  track?: (event: string, params?: Record<string, unknown>) => void;
  load?: (pixelId: string) => void;
  identify?: (params?: Record<string, unknown>) => void;
  methods?: string[];
  queue?: unknown[];
  setAndDefer?: (target: any, method: string) => void;
};

const PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

function load(pixelId: string) {
  const win = typeof window !== "undefined" ? (window as Window & { ttq?: TikTokQueue }) : null;
  if (!win || !pixelId || win.ttq?.load) return;

  const ttq = (win.ttq = win.ttq || {});
  ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"];
  ttq.setAndDefer = (target: any, method: string) => {
    target[method] = (...args: unknown[]) => {
      target.queue.push([method, ...args]);
    };
  };
  for (const method of ttq.methods) {
    ttq.setAndDefer(ttq, method);
  }
  ttq.queue = [];
  ttq.load = (id: string) => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${id}&lib=ttq`;
    document.head.appendChild(script);
  };
  ttq.load(pixelId);
  ttq.page?.();
}

export function TikTokPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!PIXEL_ID) return;
    load(PIXEL_ID);
  }, []);

  useEffect(() => {
    const win = typeof window !== "undefined" ? (window as Window & { ttq?: TikTokQueue }) : null;
    if (!PIXEL_ID || !win?.ttq?.page) return;
    win.ttq.page();
  }, [pathname]);

  return null;
}
