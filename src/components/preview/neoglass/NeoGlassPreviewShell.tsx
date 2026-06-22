"use client";

import { AdminCommandCenterPreview } from "@/src/components/preview/neoglass/AdminCommandCenterPreview";
import { CinematicProductPreview } from "@/src/components/preview/neoglass/CinematicProductPreview";
import { DropRailPreview } from "@/src/components/preview/neoglass/DropRailPreview";
import { Hero3DShowcasePreview } from "@/src/components/preview/neoglass/Hero3DShowcasePreview";
import { MobileNeonPreview } from "@/src/components/preview/neoglass/MobileNeonPreview";
import { NeoGlassHeaderPreview } from "@/src/components/preview/neoglass/NeoGlassHeaderPreview";
import { NeonSearchPreview } from "@/src/components/preview/neoglass/NeonSearchPreview";
import { ProductGlassCardPreview } from "@/src/components/preview/neoglass/ProductGlassCardPreview";
import { QuoteConfiguratorPreview } from "@/src/components/preview/neoglass/QuoteConfiguratorPreview";
import type { NeoGlassPreviewData, NeoGlassPreviewProduct } from "@/src/components/preview/neoglass/types";

type NeoGlassPreviewShellProps = {
  data: NeoGlassPreviewData;
  query: string;
  category: string;
  filteredProducts: NeoGlassPreviewProduct[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
};

const comparisonRows = [
  ["Tema atual", "Loja funcional preservada", "Preview não altera páginas públicas existentes"],
  ["NeoGlass preview", "Glass dark, neon e marketplace visual", "Disponível apenas em /preview/neoglass-2026"],
  ["Catálogo", "Fonte real mantida", "Produtos e preços renderizados sem escrita em dados"],
  ["Operação", "Commerce OS 100/100/100", "Métricas exibidas no command center"],
];

export function NeoGlassPreviewShell({
  data,
  query,
  category,
  filteredProducts,
  onQueryChange,
  onCategoryChange,
}: NeoGlassPreviewShellProps) {
  const productsToShow = filteredProducts.length ? filteredProducts : data.featuredProducts;

  return (
    <div className="neoglass-preview">
      <div className="neo-ambient" aria-hidden="true" />
      <NeoGlassHeaderPreview whatsappUrl={data.whatsappUrl} catalogUrl={data.catalogUrl} />
      <Hero3DShowcasePreview
        product={data.heroProduct}
        metrics={data.metrics}
        whatsappUrl={data.whatsappUrl}
        catalogUrl={data.catalogUrl}
      />

      <NeonSearchPreview
        query={query}
        category={category}
        categories={data.categories}
        resultCount={productsToShow.length}
        onQueryChange={onQueryChange}
        onCategoryChange={onCategoryChange}
      />

      <section className="neo-section neo-catalog-grid-section" data-testid="neoglass-catalog-section">
        <div className="neo-section-heading">
          <p className="neo-eyebrow">Catalog marketplace neon</p>
          <h2>Produtos reais da MDH3D em cards premium.</h2>
        </div>
        <div className="neo-product-grid">
          {productsToShow.map((product) => (
            <ProductGlassCardPreview key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="neo-section neo-drops-section" data-testid="neoglass-drops">
        <div className="neo-section-heading">
          <p className="neo-eyebrow">STLFLIX rails</p>
          <h2>Drops e coleções para navegação estilo streaming.</h2>
        </div>
        <div className="neo-rails-stack">
          {data.dropRails.map((rail) => (
            <DropRailPreview key={rail.id} rail={rail} />
          ))}
        </div>
      </section>

      <CinematicProductPreview product={data.cinematicProduct} />
      <QuoteConfiguratorPreview whatsappUrl={data.whatsappUrl} />
      <AdminCommandCenterPreview metrics={data.metrics} />
      <MobileNeonPreview products={data.featuredProducts} whatsappUrl={data.whatsappUrl} />

      <section className="neo-section neo-comparison" data-testid="neoglass-comparison">
        <div className="neo-section-heading">
          <p className="neo-eyebrow">Antes/depois</p>
          <h2>Comparação visual sem publicar como tema final.</h2>
        </div>
        <div className="neo-comparison-table" role="table" aria-label="Comparação antes e depois do preview NeoGlass">
          <div role="row" className="neo-comparison-head">
            <span role="columnheader">Área</span>
            <span role="columnheader">Estado</span>
            <span role="columnheader">Decisão segura</span>
          </div>
          {comparisonRows.map(([area, state, decision]) => (
            <div key={area} role="row">
              <span role="cell">{area}</span>
              <span role="cell">{state}</span>
              <span role="cell">{decision}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
