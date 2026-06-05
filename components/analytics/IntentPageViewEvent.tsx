"use client";

import { useEffect } from "react";
import { trackCommerceEvent } from "@/lib/analytics/events";

export function IntentPageViewEvent({ intent, title }: { intent: string; title: string }) {
  useEffect(() => {
    trackCommerceEvent("intent_page_view", { intent, title });
  }, [intent, title]);

  return null;
}
