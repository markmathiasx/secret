"use client";

import { useEffect } from "react";
import { trackCommerceEvent, type CommerceEventName, type CommerceEventPayload } from "@/lib/analytics/events";

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

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
  clarity?: (...args: unknown[]) => void;
};

function appendScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function AnalyticsBridge() {
  useEffect(() => {
    const analyticsWindow = window as AnalyticsWindow;

    window.mdhTrack = (eventName: CommerceEventName, payload?: CommerceEventPayload) => {
      trackCommerceEvent(eventName, payload);
    };

    if (metaPixelId && !analyticsWindow.fbq) {
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
      analyticsWindow.fbq("init", metaPixelId);
      analyticsWindow.fbq("track", "PageView");
      appendScript("mdh-meta-pixel", "https://connect.facebook.net/en_US/fbevents.js");
    }

    if (clarityProjectId && !analyticsWindow.clarity) {
      analyticsWindow.clarity = (...args: unknown[]) => {
        (analyticsWindow.clarity as unknown as { q?: unknown[] }).q = (analyticsWindow.clarity as unknown as { q?: unknown[] }).q || [];
        (analyticsWindow.clarity as unknown as { q: unknown[] }).q.push(args);
      };
      appendScript("mdh-clarity", `https://www.clarity.ms/tag/${clarityProjectId}`);
    }
  }, []);

  return null;
}
