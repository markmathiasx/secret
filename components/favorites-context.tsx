"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type FavoritesContextValue = {
  favoriteIds: string[];
  favoriteCount: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  clearFavorites: () => void;
};

const STORAGE_KEY = "mdh.favorites.ids";
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed.filter((item): item is string => typeof item === "string").slice(0, 64));
      }
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];
        setFavoriteIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string").slice(0, 64) : []);
      } catch {
        setFavoriteIds([]);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((ids: string[]) => {
    setFavoriteIds(ids);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavoriteIds((current) => {
        const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current].slice(0, 64);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clearFavorites = useCallback(() => persist([]), [persist]);
  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const value = useMemo(
    () => ({
      favoriteIds,
      favoriteCount: favoriteIds.length,
      isFavorite,
      toggleFavorite,
      clearFavorites,
    }),
    [clearFavorites, favoriteIds, isFavorite, toggleFavorite]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites deve ser usado dentro de FavoritesProvider");
  }
  return context;
}
