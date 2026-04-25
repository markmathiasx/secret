"use client";

import { useEffect } from "react";
import { onCLS, onFCP, onINP, onLCP, onTTFB } from "web-vitals";

type MetricEntry = {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
};

function sendVital(metric: MetricEntry) {
  // Send to GA4 if available
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as Window & { gtag: (...args: unknown[]) => void }).gtag("event", metric.name, {
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      metric_id: metric.id,
      metric_value: metric.value,
      metric_delta: metric.delta,
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }

  // Send to our own analytics endpoint via beacon (non-blocking)
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon(
      "/api/analytics",
      JSON.stringify({
        event: "web_vital",
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        page: window.location.pathname,
      }),
    );
  }
}

/**
 * Drop-in Web Vitals reporter.
 * Measures CLS, FCP, INP, LCP, TTFB and reports to GA4 + /api/analytics.
 * Only active in production to avoid polluting dev metrics.
 */
export function WebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    onCLS(sendVital);
    onFCP(sendVital);
    onINP(sendVital);
    onLCP(sendVital);
    onTTFB(sendVital);
  }, []);

  return null;
}
