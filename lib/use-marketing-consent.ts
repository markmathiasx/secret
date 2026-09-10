"use client";

import { useSyncExternalStore } from "react";
import { hasMarketingConsent, subscribeMarketingConsent } from "@/lib/marketing-consent";

export function useMarketingConsent() {
  return useSyncExternalStore(subscribeMarketingConsent, hasMarketingConsent, () => false);
}
