"use client";

import { useEffect } from "react";

type CustomerSessionSyncProps = {
  enabled: boolean;
};

const REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 6;

export function CustomerSessionSync({ enabled }: CustomerSessionSyncProps) {
  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function refreshSession() {
      try {
        await fetch("/api/auth/session", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin"
        });
      } catch {
        if (!cancelled) {
          // Silencioso: a sessao atual segue valendo ate expirar ou logout.
        }
      }
    }

    refreshSession();
    const intervalId = window.setInterval(refreshSession, REFRESH_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return null;
}
