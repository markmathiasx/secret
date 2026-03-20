"use client";

import { CompareProvider } from "@/components/compare-context";
import { CompatibilityProvider } from "@/components/compatibility-context";

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <CompatibilityProvider>
      <CompareProvider>{children}</CompareProvider>
    </CompatibilityProvider>
  );
}

