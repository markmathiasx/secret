"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type RecentlyViewedContextValue = {
  recentIds: string[];
  trackProduct: (id: string) => void;
  clearRecent: () => void;
};

const STORAGE_KEY = "mdh.recent.ids";
const MAX_RECENT = 18;
const RecentlyViewedContext = createContext<RecentlyViewedContextValue | null>(null);

export function RecentlyViewedProvider({ children }: { children: React.ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentIds(parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT));
      }
    } catch {
      setRecentIds([]);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setRecentIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_RECENT) : []);
      } catch {
        setRecentIds([]);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setRecentIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const trackProduct = useCallback(
    (id: string) => {
      setRecentIds((current) => {
        const next = [id, ...current.filter((item) => item !== id)].slice(0, MAX_RECENT);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearRecent = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      recentIds,
      trackProduct,
      clearRecent,
    }),
    [clearRecent, recentIds, trackProduct]
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error("useRecentlyViewed deve ser usado dentro de RecentlyViewedProvider");
  }
  return context;
}
