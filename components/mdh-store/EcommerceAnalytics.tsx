"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackSmartStoreEvent, type SmartStoreEventName } from "@/lib/mdh-store/analytics";

type FacebookPixelQueue = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: FacebookPixelQueue;
  queue?: unknown[];
  version?: string;
};

type AnalyticsWindow = Window & {
  fbq?: FacebookPixelQueue;
  _fbq?: unknown;
};

function appendScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function installMetaPixel(pixelId: string) {
  const analyticsWindow = window as AnalyticsWindow;
  if (analyticsWindow.fbq) return;

  const fbq: FacebookPixelQueue = (...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue?.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  analyticsWindow.fbq = fbq;
  analyticsWindow._fbq = fbq;
  analyticsWindow.fbq("init", pixelId);
  analyticsWindow.fbq("track", "PageView");
  appendScript("mdh-smart-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
}

export function EcommerceAnalytics({ gtmId, metaPixelId }: { gtmId?: string; metaPixelId?: string }) {
  const pathname = usePathname();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.mdhSmartStoreTrack = (eventName: SmartStoreEventName, payload?: Record<string, unknown>) => {
      trackSmartStoreEvent(eventName, payload);
    };

    if (gtmId) {
      window.dataLayer.push({ event: "gtm.js", "gtm.start": Date.now() });
      appendScript("mdh-smart-gtm", `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`);
    }

    if (metaPixelId) {
      installMetaPixel(metaPixelId);
    }
  }, [gtmId, metaPixelId]);

  useEffect(() => {
    if (metaPixelId && typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView", { path: pathname });
    }
  }, [metaPixelId, pathname]);

  return null;
}
