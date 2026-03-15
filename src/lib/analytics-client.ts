"use client";

import { sanitizeAnalyticsPayload, type AnalyticsEventInput, type AnalyticsEventName } from "@/lib/analytics";

const SESSION_STORAGE_KEY = "mdh-analytics-session-v1";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function getSessionId() {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const next = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, next);
  return next;
}

function postInternalEvent(event: AnalyticsEventInput) {
  const body = JSON.stringify({
    ...event,
    sessionId: event.sessionId || getSessionId(),
    payload: sanitizeAnalyticsPayload(event.payload)
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const ok = navigator.sendBeacon("/api/analytics", body);
    if (ok) return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true
  }).catch(() => {});
}

export function trackEvent(eventName: AnalyticsEventName, payload: Record<string, unknown> = {}, scope: "store" | "admin" = "store") {
  if (typeof window === "undefined") return;

  const path = `${window.location.pathname}${window.location.search}`;
  const sanitized = sanitizeAnalyticsPayload(payload);
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (gaMeasurementId && typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      page_path: path,
      ...sanitized
    });
  }

  postInternalEvent({
    eventName,
    scope,
    path,
    payload: sanitized
  });
}

export function trackWhatsAppClick(payload: Record<string, unknown> = {}) {
  trackEvent("click_whatsapp", payload);
}
