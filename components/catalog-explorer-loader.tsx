"use client";

import type { ComponentProps } from "react";
import { useEffect, useState } from "react";
import { LoaderCircle, RefreshCw } from "lucide-react";
import { CatalogGrid } from "@/components/catalog-grid";
import { isCompleteCatalogPayload } from "@/lib/catalog-payload";
import { CatalogExplorer } from "@/components/catalog-explorer";
import type { Product } from "@/lib/catalog";

type Props = Omit<ComponentProps<typeof CatalogExplorer>, "products" | "syncUrl"> & {
  initialProducts: Product[];
  expectedTotal: number;
};

export function CatalogExplorerLoader({ initialProducts, expectedTotal, ...explorerProps }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    initialProducts.length >= expectedTotal ? "ready" : "loading"
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (initialProducts.length >= expectedTotal) return;
    const controller = new AbortController();
    let disposed = false;
    const timer = window.setTimeout(() => controller.abort(), 20000);
    setStatus("loading");

    async function loadCatalog() {
      try {
        const response = await fetch("/catalog-data.json", { signal: controller.signal });
        if (!response.ok) throw new Error("catalog_http_error");
        const payload: unknown = await response.json();
        if (!isCompleteCatalogPayload(payload, expectedTotal)) {
          throw new Error("catalog_payload_invalid");
        }
        if (disposed) return;
        setProducts(payload.items);
        setStatus("ready");
      } catch {
        if (!disposed) setStatus("error");
      } finally {
        window.clearTimeout(timer);
      }
    }

    void loadCatalog();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [attempt, expectedTotal, initialProducts.length]);

  return (
    <div data-catalog-load-state={status} data-catalog-loaded-count={products.length}>
      <div className="mb-3 flex min-h-10 items-center justify-between gap-3 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/68" aria-live="polite">
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin text-cyan-200" />
            Carregando mais produtos ({products.length}/{expectedTotal})…
          </span>
        ) : status === "error" ? (
          <>
            <span>Mostrando {products.length} itens. Não foi possível carregar o catálogo completo.</span>
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className="inline-flex items-center gap-1.5 font-bold text-cyan-100 hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" /> Tentar novamente
            </button>
          </>
        ) : (
          <span>{products.length.toLocaleString("pt-BR")} produtos disponíveis no catálogo completo.</span>
        )}
      </div>
      {status === "ready" ? (
        <CatalogExplorer products={products} {...explorerProps} />
      ) : (
        <section aria-label="Prévia do catálogo, filtros disponíveis após carregamento completo">
          <p className="mb-3 text-sm text-white/68">Prévia sem filtros. Sua seleção na URL será aplicada ao carregar o catálogo completo.</p>
          <CatalogGrid products={products} />
        </section>
      )}
    </div>
  );
}
