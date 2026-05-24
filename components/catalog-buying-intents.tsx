import Link from "next/link";
import { ArrowRight, Boxes, Building2, Gift, Layers3, MonitorCog, Palette, Sparkles } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { SafeProductImage } from "@/components/safe-product-image";
import { resolveProductImage } from "@/lib/product-images";
import { formatCurrency } from "@/lib/utils";
import { isProductPrimaryMediaValidated, isProductVisualVerified } from "@/lib/product-visuals";

type BuyingIntent = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: typeof Gift;
  tone: string;
  match: (product: Product) => boolean;
};

const intents: BuyingIntent[] = [
  {
    id: "presentear",
    title: "Quero presentear",
    description: "Itens com impacto visual rápido, ticket acessível e boa leitura sem precisar explicar demais.",
    href: "/catalogo?intent=presentear&mode=verified",
    cta: "Filtrar presentes",
    icon: Gift,
    tone: "from-cyan-300/18",
    match: (product) => product.buyingIntents?.includes("presentear") ?? false,
  },
  {
    id: "organizar",
    title: "Quero organizar",
    description: "Suportes, organizadores e peças funcionais para mesa, banheiro, cabos, controles e rotina.",
    href: "/catalogo?intent=organizar",
    cta: "Filtrar organização",
    icon: MonitorCog,
    tone: "from-lime-300/16",
    match: (product) => product.buyingIntents?.includes("organizar") ?? false,
  },
  {
    id: "decorar",
    title: "Quero decorar",
    description: "Peças para prateleira, mesa, parede e ambientes que precisam de presença física.",
    href: "/catalogo?intent=decorar",
    cta: "Ver decoração",
    icon: Sparkles,
    tone: "from-violet-300/18",
    match: (product) => product.buyingIntents?.includes("decorar") ?? false,
  },
  {
    id: "colecionar",
    title: "Quero colecionar",
    description: "Geek, anime, miniaturas e objetos de setup com mídia do catálogo bem sinalizada.",
    href: "/catalogo?intent=colecionar&category=Geek%20%26%20Colecion%C3%A1veis",
    cta: "Filtrar coleção",
    icon: Layers3,
    tone: "from-fuchsia-300/16",
    match: (product) => product.buyingIntents?.includes("colecionar") ?? false,
  },
  {
    id: "tecnica",
    title: "Quero peça técnica",
    description: "Modelos funcionais, reposição, suporte e solução sob medida com foco em encaixe.",
    href: "/catalogo?intent=pe%C3%A7a_tecnica",
    cta: "Ver soluções",
    icon: Boxes,
    tone: "from-emerald-300/16",
    match: (product) => product.buyingIntents?.includes("peça_tecnica") ?? false,
  },
  {
    id: "lote",
    title: "Quero comprar em lote",
    description: "Itens repetíveis para evento, brinde, kit, lembrança ou revenda assistida.",
    href: "/catalogo?intent=comprar_em_lote",
    cta: "Ver para lote",
    icon: Building2,
    tone: "from-amber-300/18",
    match: (product) => Boolean(product.buyingIntents?.includes("comprar_em_lote") || product.buyingIntents?.includes("corporativo")),
  },
  {
    id: "personalizar",
    title: "Quero personalizar",
    description: "Cores, escala, nome, tema ou briefing próprio com validação antes da produção.",
    href: "/imagem-para-impressao-3d",
    cta: "Enviar briefing",
    icon: Palette,
    tone: "from-cyan-300/12",
    match: (product) => product.customizable,
  },
];

export function CatalogBuyingIntents({ products }: { products: Product[] }) {
  return (
    <section className="mt-10">
      <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <h2 className="mdh-section-title max-w-4xl">Compra por intenção, com filtro real.</h2>
          <p className="mt-4 text-base leading-8 text-white/66">
            Escolha o motivo da compra e entre em uma seleção que já reduz ruído de preço, prazo, material e categoria real.
          </p>
        </div>
        <Link href="/catalogo?mode=verified" className="btn-secondary w-fit gap-2">
          Imagens validadas
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-6">
        {intents.map((intent, index) => {
          const matches = products
            .filter(intent.match)
            .sort((a, b) => Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a)) || a.pricePix - b.pricePix);
          const lead = matches.find(isProductPrimaryMediaValidated) || matches[0];
          const fromPrice = matches.length ? Math.min(...matches.map((item) => item.pricePix)) : null;
          const Icon = intent.icon;

          return (
            <article key={intent.id} className={`mdh-intent-card ${index < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${intent.tone} via-transparent to-transparent`} />
              <div className="mdh-cad-grid absolute inset-0 opacity-30" />
              <div className="relative grid min-h-full gap-5">
                {lead ? (
                  <Link href={getProductUrl(lead)} className="group relative block overflow-hidden rounded-[8px] border border-white/10 bg-black/35">
                    <SafeProductImage
                      candidates={[resolveProductImage(lead)]}
                      alt={lead.name}
                      className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.72))]" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="line-clamp-1 text-sm font-bold text-white">{lead.name}</p>
                      <p className="mt-1 text-xs text-white/60">{lead.productionWindow}</p>
                    </div>
                  </Link>
                ) : (
                  <div className="aspect-[16/10] rounded-[8px] border border-white/10 bg-white/5" />
                )}
                <div>
                  <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl font-black leading-tight text-white">{intent.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/64">{intent.description}</p>
                </div>
                <div className="mt-auto flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">{matches.length} opções</p>
                    <p className="mt-1 text-xl font-black text-emerald-200">{fromPrice ? `desde ${formatCurrency(fromPrice)}` : "sob consulta"}</p>
                  </div>
                  <Link href={intent.href} className="btn-glass px-4 py-2 text-sm">
                    {intent.cta}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
