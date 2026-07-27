import Link from "next/link";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CatalogGrid } from "@/components/catalog-grid";
import { CommerceFaq } from "@/components/commerce-faq";
import { SafeProductImage } from "@/components/safe-product-image";
import { catalog } from "@/lib/catalog";
import { getProductUrl } from "@/lib/product-routing";
import {
  getLandingHighlights,
  getLandingProducts,
  type SalesLandingConfig,
  type SalesLandingKey,
  salesLandings,
} from "@/lib/sales-landings";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

const allLandingConfigs = Object.values(salesLandings);

export function SalesLandingPage({ landingKey }: { landingKey: SalesLandingKey }) {
  const config: SalesLandingConfig = salesLandings[landingKey];
  const matchingProducts = getLandingProducts(catalog, config);
  const highlights = getLandingHighlights(catalog, config);
  const verifiedCount = matchingProducts.filter((product) => isProductVisualVerified(product)).length;
  const readyCount = matchingProducts.filter((product) => product.status === "Pronta entrega").length;
  const minPrice = matchingProducts.length ? Math.min(...matchingProducts.map((product) => product.pricePix)) : null;
  const relatedLandings = allLandingConfigs.filter((item) => item.slug !== config.slug).slice(0, 4);
  const leadVisual = highlights[0] ?? matchingProducts[0];
  const heroCandidates = [config.heroImage, leadVisual?.image, leadVisual?.images?.[0]].filter(Boolean) as string[];
  const fastest = [...matchingProducts].sort(
    (a, b) => Number(b.readyToShip) - Number(a.readyToShip) || a.pricePix - b.pricePix
  )[0];
  const cheapest = [...matchingProducts].sort((a, b) => a.pricePix - b.pricePix)[0];
  const customizable = matchingProducts.find((product) => product.customizable);
  const guidedPicks = [
    fastest ? { label: "Saida mais rapida", note: "boa rota para decidir hoje sem travar a conversa", product: fastest } : null,
    cheapest ? { label: "Menor ticket", note: "ajuda a reduzir barreira inicial de compra", product: cheapest } : null,
    customizable ? { label: "Mais flexivel", note: "abre espaco para ajuste de cor, briefing ou escala", product: customizable } : null,
  ].filter(Boolean) as Array<{
    label: string;
    note: string;
    product: (typeof matchingProducts)[number];
  }>;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="overflow-hidden rounded-[40px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.32)]">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">{config.kicker}</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">{config.title}</h1>
            <p className="mt-4 text-lg leading-8 text-white/70">{config.description}</p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68">{config.audience}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {config.proofPoints.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/80"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {config.primaryCta.external ? (
                <a href={config.primaryCta.href} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3">
                  {config.primaryCta.label}
                </a>
              ) : (
                <Link href={config.primaryCta.href} className="btn-primary px-6 py-3">
                  {config.primaryCta.label}
                </Link>
              )}
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

          <div className="space-y-3">
            {heroCandidates.length ? (
              <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/25">
                <SafeProductImage
                  candidates={heroCandidates}
                  alt={config.heroImageAlt || leadVisual?.name || config.title}
                  className="aspect-[4/5] w-full object-cover"
                  priority
                />
                <div className="absolute inset-x-0 top-0 p-4">
                  <span className="inline-flex rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    {config.heroImageLabel || "Visual da linha"}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">{leadVisual?.category || config.kicker}</p>
                  <h2 className="mt-2 text-2xl font-black text-white">{leadVisual?.name || config.kicker}</h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/72">
                    {leadVisual?.description || "Linha organizada para abrir a conversa comercial com mais clareza."}
                  </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Itens na selecao", value: String(matchingProducts.length).padStart(2, "0") },
                { label: "Visual validado", value: String(verifiedCount).padStart(2, "0") },
                { label: "Faixa inicial", value: minPrice ? formatCurrency(minPrice) : "Sob consulta" },
              ].map((item) => (
                <div key={item.label} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
                  <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[28px] border border-emerald-300/15 bg-emerald-300/8 p-5 text-sm leading-7 text-emerald-50/90">
          <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Faixa comercial</p>
          <p className="mt-2">{config.budgetLabel}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-white/68">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Operacao</p>
          <div className="mt-2 flex flex-wrap gap-3">
            <span>{readyCount} itens com pronta entrega</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>{verifiedCount} com mídia validada ou prévia técnica</span>
            <span className="h-1 w-1 self-center rounded-full bg-white/30" />
            <span>CTA comercial e rota de briefing no mesmo eixo</span>
          </div>
        </div>
      </div>

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Intencao de compra</p>
          <h2 className="mt-3 text-3xl font-black text-white">Quando esta pagina costuma converter melhor.</h2>
          <div className="mt-5 grid gap-3">
            {config.purchaseTriggers.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/68">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/catalogo" className="chip-nav">
              Catalogo completo
            </Link>
            <Link href="/imagem-para-impressao-3d" className="chip-nav">
              Projeto sob medida
            </Link>
            <Link href="/catalogo?status=Pronta%20entrega&mode=all" className="chip-nav">
              So pronta entrega
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {guidedPicks.map((item) => (
            <article
              key={item.label}
              className="catalog-product-card rounded-[24px] border border-white/10 bg-card p-4"
            >
              <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
                <SafeProductImage
                  candidates={[item.product.image || item.product.images?.[0]].filter(Boolean) as string[]}
                  alt={item.product.name}
                  className="aspect-square w-full object-cover"
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-cyan-100/80">{item.label}</p>
              <h3 className="mt-2 text-lg font-bold text-white">{item.product.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/66">{item.note}</p>
              <div className="mt-4 flex items-end justify-between gap-3">
                <p className="text-xl font-black text-white">{formatCurrency(item.product.pricePix)}</p>
                <Link href={getProductUrl(item.product)} className="btn-secondary px-4 py-2 text-sm">
                  Ver item
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {highlights.length ? (
        <section className="mt-12">
          <div className="mb-6 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Selecao que ajuda a converter</p>
            <h2 className="mt-3 text-3xl font-black text-white">Pecas para abrir essa linha com mais confianca visual.</h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Antes da vitrine completa, entram alguns itens que ja representam melhor acabamento, valor percebido e conversa comercial.
            </p>
          </div>
          <CatalogGrid products={highlights} />
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Roteiro comercial</p>
          <h2 className="mt-3 text-3xl font-black text-white">Como esta pagina encurta o caminho ate o fechamento.</h2>
          <div className="mt-5 grid gap-3">
            {config.process.map((item, index) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/70">Etapa {String(index + 1).padStart(2, "0")}</p>
                <p className="mt-2">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Fechamento</p>
          <h2 className="mt-3 text-3xl font-black text-white">CTA, prova e orcamento no mesmo plano de leitura.</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              Use esta landing para vender por intencao de compra, nao por excesso de filtro.
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              A faixa inicial ajuda a quebrar a inercia sem prometer um valor unico para todo tipo de pedido.
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
              Se o cliente estiver pronto, ele avanca. Se ainda estiver em duvida, ele nao sai da rota comercial.
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {config.primaryCta.external ? (
              <a href={config.primaryCta.href} target="_blank" rel="noreferrer" className="btn-primary">
                {config.primaryCta.label}
              </a>
            ) : (
              <Link href={config.primaryCta.href} className="btn-primary">
                {config.primaryCta.label}
              </Link>
            )}
            {config.secondaryCta.external ? (
              <a href={config.secondaryCta.href} target="_blank" rel="noreferrer" className="btn-secondary">
                {config.secondaryCta.label}
              </a>
            ) : (
              <Link href={config.secondaryCta.href} className="btn-secondary">
                {config.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Catalogo filtrado</p>
          <h2 className="mt-3 text-3xl font-black text-white">Navegacao pronta para comparar, filtrar e fechar.</h2>
          <p className="mt-4 text-sm leading-7 text-white/68">
            A vitrine ja abre com filtros coerentes para essa entrada. Se quiser ampliar a busca, basta trocar categoria, disponibilidade, colecao ou liberar o catalogo completo.
          </p>
        </div>

        <CatalogExplorer
          products={catalog}
          initialQuery={config.initialQuery}
          initialCategory={config.initialCategory}
          initialCollection={config.initialCollection}
          initialVisualMode={config.initialVisualMode}
          initialAvailability={config.initialAvailability}
        />
      </section>

      <div className="mt-14">
        <CommerceFaq
          eyebrow="FAQ comercial"
          title="Perguntas que costumam travar a decisao nesta linha."
          description="A ideia aqui e deixar a duvida comercial visivel na pagina, em vez de empurrar tudo para uma conversa externa."
          items={config.faq}
        />
      </div>

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
              <Link
                key={item.slug}
                href={item.slug}
                className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/30 hover:bg-black/30"
              >
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
