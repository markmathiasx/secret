"use client";

import { createContext, useContext, useEffect, useState } from "react";

type CompareContextValue = {
  compareIds: string[];
  isInCompare: (id: string) => boolean;
  toggleCompare: (id: string) => void;
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

  const persist = (ids: string[]) => {
    setCompareIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  };

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      persist(compareIds.filter((item) => item !== id));
      return;
    }
    if (compareIds.length >= MAX_COMPARE) return;
    persist([...compareIds, id]);
  };

  const clearCompare = () => persist([]);
  const isInCompare = (id: string) => compareIds.includes(id);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        isInCompare,
        toggleCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare deve ser usado dentro de CompareProvider");
  }
  return context;
}
