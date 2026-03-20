import Link from "next/link";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CatalogGrid } from "@/components/catalog-grid";
import { catalog } from "@/lib/catalog";
import { type SalesLandingConfig, getLandingHighlights, getLandingProducts, salesLandings } from "@/lib/sales-landings";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

const allLandingConfigs = Object.values(salesLandings);

export function SalesLandingPage({ config }: { config: SalesLandingConfig }) {
  const matchingProducts = getLandingProducts(catalog, config);
  const highlights = getLandingHighlights(catalog, config);
  const verifiedCount = matchingProducts.filter((product) => isProductVisualVerified(product)).length;
  const readyCount = matchingProducts.filter((product) => product.status === "Pronta entrega").length;
  const minPrice = matchingProducts.length ? Math.min(...matchingProducts.map((product) => product.pricePix)) : null;
  const relatedLandings = allLandingConfigs.filter((item) => item.slug !== config.slug).slice(0, 4);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{config.kicker}</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{config.title}</h1>
            <p className="mt-4 text-lg leading-8 text-white/70">{config.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {config.proofPoints.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={config.primaryCta.href} className="btn-primary px-6 py-3">
                {config.primaryCta.label}
              </Link>
              {config.secondaryCta.external ? (
                <a href={config.secondaryCta.href} target="_blank" rel="noreferrer" className="btn-secondary px-6 py-3">
                  {config.secondaryCta.label}
                </a>
              ) : (
                <Link href={config.secondaryCta.href} className="btn-secondary px-6 py-3">
                  {config.secondaryCta.label}
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Itens na seleção", value: String(matchingProducts.length).padStart(2, "0") },
              { label: "Visual validado", value: String(verifiedCount).padStart(2, "0") },
              { label: "Faixa de entrada", value: minPrice ? formatCurrency(minPrice) : "Sob consulta" },
            ].map((item) => (
              <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/8 p-5 text-sm leading-7 text-emerald-50/90">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Leitura comercial</p>
          <p className="mt-2">
            Essa página começa com peças mais fáceis de explicar, vender e visualizar. O objetivo é reduzir dúvida do cliente logo no primeiro scroll e empurrar a conversa para compra, orçamento ou lote.
          </p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/68">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Operação</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <span>{readyCount} itens com pronta entrega</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>{verifiedCount} com foto real ou render do produto</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>Pix em destaque para fechamento mais rápido</span>
          </div>
        </div>
      </div>

      {highlights.length ? (
        <section className="mt-12">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Seleção que ajuda a converter</p>
            <h2 className="mt-3 text-3xl font-black text-white">Peças para abrir essa linha com mais confiança visual.</h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Antes da vitrine completa, entram alguns itens que já representam melhor acabamento, valor percebido e conversa comercial.
            </p>
          </div>
          <CatalogGrid products={highlights} />
        </section>
      ) : null}

      <section className="mt-14">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Catálogo filtrado</p>
          <h2 className="mt-3 text-3xl font-black text-white">Navegação pronta para comparar, filtrar e fechar.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            A vitrine já abre com filtros coerentes para essa entrada. Se quiser ampliar a busca, basta trocar categoria, disponibilidade, coleção ou liberar o catálogo completo.
          </p>
        </div>

        <CatalogExplorer
          products={catalog}
          initialQuery={config.initialQuery}
          initialCategory={config.initialCategory}
          initialCollection={config.initialCollection}
          initialVerifiedOnly={config.initialVerifiedOnly}
          initialAvailability={config.initialAvailability}
        />
      </section>

      <section className="mt-16">
        <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Outras entradas da loja</p>
              <h2 className="mt-3 text-3xl font-black text-white">Mais caminhos para vender o acervo sem deixar o cliente perdido.</h2>
            </div>
            <Link href="/catalogo?mode=verified" className="btn-secondary">
              Abrir vitrine geral
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {relatedLandings.map((item) => (
              <Link key={item.slug} href={item.slug} className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/30 hover:bg-black/30">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">{item.kicker}</p>
                <h3 className="mt-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
                <span className="mt-5 inline-flex text-sm font-semibold text-cyan-100">Explorar essa linha</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
