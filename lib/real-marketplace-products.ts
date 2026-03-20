import type { Product } from "@/lib/catalog";
import { catalog } from "@/lib/catalog";

// Backward-compatible export used by older parts of the codebase.
// The source of truth now lives in lib/catalog.ts.
export const marketplaceRealProducts: Product[] = catalog.filter((item) => item.realPhoto);

