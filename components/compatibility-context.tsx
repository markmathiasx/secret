"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CompatibilityModel } from "@/lib/catalog";

type CompatibilityContextValue = {
  selectedModel: CompatibilityModel;
  setSelectedModel: (model: CompatibilityModel) => void;
};

const STORAGE_KEY = "mdh.compatibility.model";
const CompatibilityContext = createContext<CompatibilityContextValue | null>(null);

export function CompatibilityProvider({ children }: { children: React.ReactNode }) {
  const [selectedModel, setSelectedModelState] = useState<CompatibilityModel>("A1 Mini");

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "A1 Mini" || raw === "A1") {
      setSelectedModelState(raw);
    }
  }, []);

  const setSelectedModel = (model: CompatibilityModel) => {
    setSelectedModelState(model);
    window.localStorage.setItem(STORAGE_KEY, model);
  };

  const value = useMemo(
    () => ({
      selectedModel,
      setSelectedModel,
    }),
    [selectedModel]
  );

  return <CompatibilityContext.Provider value={value}>{children}</CompatibilityContext.Provider>;
}

export function useCompatibility() {
  const context = useContext(CompatibilityContext);
  if (!context) {
    throw new Error("useCompatibility deve ser usado dentro de CompatibilityProvider");
  }
  return context;
}

