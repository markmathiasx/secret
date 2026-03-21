"use client";

import { CompareProvider } from "@/components/compare-context";
import { CompatibilityProvider } from "@/components/compatibility-context";
import { FavoritesProvider } from "@/components/favorites-context";
import { RecentlyViewedProvider } from "@/components/recently-viewed-context";
import { SavedSearchesProvider } from "@/components/saved-searches-context";

export function StorefrontProviders({ children }: { children: React.ReactNode }) {
  return (
    <CompatibilityProvider>
      <CompareProvider>
        <FavoritesProvider>
          <RecentlyViewedProvider>
            <SavedSearchesProvider>{children}</SavedSearchesProvider>
          </RecentlyViewedProvider>
        </FavoritesProvider>
      </CompareProvider>
    </CompatibilityProvider>
  );
}
