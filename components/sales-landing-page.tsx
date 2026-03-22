"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { CatalogGrid } from "@/components/catalog-grid";
import { SafeProductImage } from "@/components/safe-product-image";
import { catalog, getProductUrl } from "@/lib/catalog";
import { type SalesLandingConfig, type SalesLandingKey, getLandingHighlights, getLandingProducts, salesLandings } from "@/lib/sales-landings";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { formatCurrency } from "@/lib/utils";

function shouldIgnoreCardActivation(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("a, button, input, select, textarea, [role='button'], [data-card-interactive='true']"));
}

const allLandingConfigs = Object.values(salesLandings);

export function SalesLandingPage({ landingKey }: { landingKey: SalesLandingKey }) {
  const router = useRouter();
  const config: SalesLandingConfig = salesLandings[landingKey];
  const matchingProducts = getLandingProducts(catalog, config);
  const highlights = getLandingHighlights(catalog, config);
  const verifiedCount = matchingProducts.filter((product) => isProductVisualVerified(product)).length;
  const readyCount = matchingProducts.filter((product) => product.status === "Pronta entrega").length;
  const minPrice = matchingProducts.length ? Math.min(...matchingProducts.map((product) => product.pricePix)) : null;
  const relatedLandings = allLandingConfigs.filter((item) => item.slug !== config.slug).slice(0, 4);
  const leadVisual = highlights[0] ?? matchingProducts[0];
  const heroCandidates = [config.heroImage, leadVisual?.image, leadVisual?.images?.[0]].filter(Boolean) as string[];
  const fastest = [...matchingProducts].sort((a, b) => Number(b.readyToShip) - Number(a.readyToShip) || a.pricePix - b.pricePix)[0];
  const cheapest = [...matchingProducts].sort((a, b) => a.pricePix - b.pricePix)[0];
  const customizable = matchingProducts.find((product) => product.customizable);
  const guidedPicks = [
    fastest ? { label: "Saída mais rápida", note: "boa porta de entrada para quem quer decidir logo", product: fastest } : null,
    cheapest ? { label: "Menor ticket", note: "ajuda a reduzir barreira inicial de compra", product: cheapest } : null,
    customizable ? { label: "Mais flexível", note: "abre espaço para personalização e briefing", product: customizable } : null,
  ].filter(Boolean) as { label: string; note: string; product: typeof matchingProducts[number] }[];
  const useCases = [
    `Abrir conversa com ${config.kicker.toLowerCase()} sem jogar o cliente direto numa lista genérica.`,
    `Priorizar ${verifiedCount} itens com visual validado para aumentar confiança antes do pagamento.`,
    `Aproveitar ${readyCount} opções de pronta entrega quando a jornada pedir mais rapidez.`,
  ];
  const quickLinks: Array<{ label: string; href: string; external?: boolean }> = [
    config.primaryCta,
    config.secondaryCta,
    { label: "Só pronta entrega", href: `/catalogo?status=Pronta%20entrega&mode=all` },
  ];
  const buyerProfiles = [
    {
      title: "Quero decidir rápido",
      description: "Comece pelos destaques e depois abra pronta entrega para reduzir explicação, prazo e atrito.",
      href: "/catalogo?intent=Compra%20r%C3%A1pida&mode=all",
    },
    {
      title: "Quero algo mais autoral",
      description: "Se esta linha estiver perto do que você imaginou, vale avançar para personalização com referência visual.",
      href: "/imagem-para-impressao-3d",
    },
    {
      title: "Quero comparar ticket",
      description: "Abra o catálogo com ordenação por preço para mapear entrada, meio e premium sem perder a curadoria.",
      href: "/catalogo?sort=Pre%C3%A7o&mode=all",
    },
  ];
  const objections = [
    "Se você ainda não sabe o material ideal, use esta página para fechar estilo e proposta antes de entrar no técnico.",
    "Quando a dúvida for prazo, a rota mais segura é abrir pronta entrega ou seguir para itens com prova visual validada.",
    "Se a ideia estiver próxima, mas não igual, vale pedir sob medida em vez de abandonar a navegação e recomeçar tudo.",
  ];

  function openProduct(product: (typeof matchingProducts)[number]) {
    router.push(getProductUrl(product));
  }

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
                    {leadVisual?.description || "Linha visual pensada para abrir a navegação com mais confiança e mais apelo comercial."}
                  </p>
                </div>
              </div>
            ) : null}

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

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Como usar esta página</p>
          <h2 className="mt-3 text-3xl font-black text-white">Uma entrada mais guiada para vender melhor este recorte.</h2>
          <div className="mt-5 grid gap-3">
            {useCases.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/68">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {quickLinks.map((item) =>
              item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer" className="chip-nav">
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.href} className="chip-nav">
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {guidedPicks.map((item) => (
            <article
              key={item.label}
              className="catalog-product-card cursor-pointer rounded-[24px] border border-white/10 bg-card p-4"
              role="link"
              tabIndex={0}
              aria-label={`Abrir ${item.product.name}`}
              onClick={(event) => {
                if (shouldIgnoreCardActivation(event.target)) return;
                openProduct(item.product);
              }}
              onKeyDown={(event) => {
                if (shouldIgnoreCardActivation(event.target)) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openProduct(item.product);
                }
              }}
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
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Seleção que ajuda a converter</p>
            <h2 className="mt-3 text-3xl font-black text-white">Peças para abrir essa linha com mais confiança visual.</h2>
            <p className="mt-4 text-sm leading-7 text-white/68">
              Antes da vitrine completa, entram alguns itens que já representam melhor acabamento, valor percebido e conversa comercial.
            </p>
          </div>
          <CatalogGrid products={highlights} />
        </section>
      ) : null}

      <section className="mt-12 grid gap-6 xl:grid-cols-[0.94fr_1.06fr]">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Perfis de compra</p>
          <h2 className="mt-3 text-3xl font-black text-white">Escolha um caminho mais próximo do seu jeito de comprar.</h2>
          <div className="mt-5 grid gap-3">
            {buyerProfiles.map((item) => (
              <Link key={item.title} href={item.href} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70 transition hover:border-cyan-300/25 hover:text-white">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="mt-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Quebra de objeção</p>
          <h2 className="mt-3 text-3xl font-black text-white">Dúvidas comuns antes do próximo clique.</h2>
          <div className="mt-5 grid gap-3">
            {objections.map((item) => (
              <div key={item} className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-white/70">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

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
          initialVisualMode={config.initialVisualMode}
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
