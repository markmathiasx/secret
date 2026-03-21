"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type CompareContextValue = {
  compareIds: string[];
  compareCount: number;
  isInCompare: (id: string) => boolean;
  toggleCompare: (id: string) => void;
  replaceCompare: (ids: string[]) => void;
  clearCompare: () => void;
};

const STORAGE_KEY = "mdh.compare.ids";
const MAX_COMPARE = 4;
const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCompareIds(parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_COMPARE));
      }
    } catch {
      setCompareIds([]);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setCompareIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, MAX_COMPARE) : []);
      } catch {
        setCompareIds([]);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setCompareIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompareIds((current) => {
        let next = current;
        if (current.includes(id)) {
          next = current.filter((item) => item !== id);
        } else if (current.length < MAX_COMPARE) {
          next = [...current, id];
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const replaceCompare = useCallback((ids: string[]) => {
    const next = ids.filter((item, index, source) => typeof item === "string" && source.indexOf(item) === index).slice(0, MAX_COMPARE);
    persist(next);
  }, [persist]);

  const clearCompare = useCallback(() => persist([]), [persist]);
  const isInCompare = useCallback((id: string) => compareIds.includes(id), [compareIds]);

  const value = useMemo(
    () => ({
      compareIds,
      compareCount: compareIds.length,
      isInCompare,
      toggleCompare,
      replaceCompare,
      clearCompare,
    }),
    [clearCompare, compareIds, isInCompare, replaceCompare, toggleCompare]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare deve ser usado dentro de CompareProvider");
  }
  return context;
}
