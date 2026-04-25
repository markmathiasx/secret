"use client";

import { useNetworkStatus } from "@/lib/use-network-status";

/**
 * Renders a floating banner when the user loses / regains internet connection.
 * Fully accessible: role="status" + aria-live="assertive".
 */
export function NetworkStatusBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        "fixed bottom-20 left-1/2 z-[200] -translate-x-1/2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-xl transition-all duration-300",
        isOnline
          ? "border border-emerald-400/30 bg-emerald-500/20 text-emerald-200 backdrop-blur-sm"
          : "border border-rose-400/30 bg-rose-500/20 text-rose-200 backdrop-blur-sm",
      ].join(" ")}
    >
      {isOnline ? "✓ Conexão restaurada" : "Sem conexão com a internet"}
    </div>
  );
}
