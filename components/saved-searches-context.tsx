"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type SavedSearch = {
  id: string;
  label: string;
  url: string;
  summary: string;
  createdAt: string;
};

type SavedSearchInput = {
  label: string;
  url: string;
  summary: string;
};

type SavedSearchesContextValue = {
  savedSearches: SavedSearch[];
  savedSearchCount: number;
  saveSearch: (input: SavedSearchInput) => void;
  removeSearch: (id: string) => void;
  clearSearches: () => void;
};

const STORAGE_KEY = "mdh.saved.searches";
const MAX_SAVED_SEARCHES = 24;
const SavedSearchesContext = createContext<SavedSearchesContextValue | null>(null);

function buildSearchId(url: string, createdAt: string) {
  return `search-${encodeURIComponent(url)}-${createdAt}`;
}

export function SavedSearchesProvider({ children }: { children: React.ReactNode }) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const next = parsed
        .filter(
          (item): item is SavedSearch =>
            Boolean(item) &&
            typeof item.id === "string" &&
            typeof item.label === "string" &&
            typeof item.url === "string" &&
            typeof item.summary === "string" &&
            typeof item.createdAt === "string"
        )
        .slice(0, MAX_SAVED_SEARCHES);
      setSavedSearches(next);
    } catch {
      setSavedSearches([]);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        const next = Array.isArray(parsed)
          ? parsed
              .filter(
                (item): item is SavedSearch =>
                  Boolean(item) &&
                  typeof item.id === "string" &&
                  typeof item.label === "string" &&
                  typeof item.url === "string" &&
                  typeof item.summary === "string" &&
                  typeof item.createdAt === "string"
              )
              .slice(0, MAX_SAVED_SEARCHES)
          : [];
        setSavedSearches(next);
      } catch {
        setSavedSearches([]);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: SavedSearch[]) => {
    setSavedSearches(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const saveSearch = useCallback(
    ({ label, url, summary }: SavedSearchInput) => {
      const createdAt = new Date().toISOString();
      const normalizedUrl = url.trim() || "/catalogo";
      const normalizedSummary = summary.trim() || "Recorte salvo do catálogo";
      const normalizedLabel = label.trim() || "Busca salva";
      setSavedSearches((current) => {
        const next = [
          {
            id: buildSearchId(normalizedUrl, createdAt),
            label: normalizedLabel,
            url: normalizedUrl,
            summary: normalizedSummary,
            createdAt,
          },
          ...current.filter((item) => item.url !== normalizedUrl),
        ].slice(0, MAX_SAVED_SEARCHES);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeSearch = useCallback(
    (id: string) => {
      setSavedSearches((current) => {
        const next = current.filter((item) => item.id !== id);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearSearches = useCallback(() => persist([]), [persist]);

  const value = useMemo(
    () => ({
      savedSearches,
      savedSearchCount: savedSearches.length,
      saveSearch,
      removeSearch,
      clearSearches,
    }),
    [clearSearches, removeSearch, saveSearch, savedSearches]
  );

  return <SavedSearchesContext.Provider value={value}>{children}</SavedSearchesContext.Provider>;
}

export function useSavedSearches() {
  const context = useContext(SavedSearchesContext);
  if (!context) {
    throw new Error("useSavedSearches deve ser usado dentro de SavedSearchesProvider");
  }
  return context;
}
