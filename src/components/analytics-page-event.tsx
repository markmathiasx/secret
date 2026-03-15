"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics-client";
import type { AnalyticsEventName } from "@/lib/analytics";

type AnalyticsPageEventProps = {
  eventName: AnalyticsEventName;
  payload?: Record<string, unknown>;
  scope?: "store" | "admin";
};

export function AnalyticsPageEvent({ eventName, payload, scope = "store" }: AnalyticsPageEventProps) {
  useEffect(() => {
    trackEvent(eventName, payload, scope);
  }, [eventName, payload, scope]);

  return null;
}
