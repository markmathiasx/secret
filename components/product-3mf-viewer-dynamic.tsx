"use client";

import dynamic from "next/dynamic";
import type { CatalogModelPreviewEntry } from "@/lib/catalog-photo-manifest";

const Product3MFViewer = dynamic(
  () => import("@/components/product-3mf-viewer").then((module) => module.Product3MFViewer),
  {
    loading: () => (
      <div className="flex h-72 w-full animate-pulse items-center justify-center rounded-[24px] border border-white/10 bg-black/20">
        <span className="text-xs uppercase tracking-widest text-white/30">Carregando visualizador 3D...</span>
      </div>
    ),
    ssr: false,
  }
);

export function Product3MFViewerDynamic({
  modelUrl,
  productName,
  preview,
}: {
  modelUrl: string;
  productName: string;
  preview?: CatalogModelPreviewEntry | null;
}) {
  return <Product3MFViewer modelUrl={modelUrl} productName={productName} preview={preview} />;
}
