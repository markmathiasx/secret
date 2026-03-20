import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { getProductUrl } from "@/lib/catalog";
import { SafeProductImage } from "@/components/safe-product-image";
import { formatCurrency } from "@/lib/utils";
import { isProductVisualVerified } from "@/lib/product-visuals";

type BuyingIntent = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  match: (product: Product) => boolean;
};

const intents: BuyingIntent[] = [
  {
    id: "presentes",
    title: "Presentes até R$ 80",
    description: "Itens com boa percepção de presente, entrada mais rápida e valor mais leve para fechar no mesmo dia.",
    href: "/catalogo?q=presente",
    cta: "Ver presentes",
    match: (product) =>
      product.pricePix <= 80 &&
      /(presente|geek|colecion|chibi|lembranc|utilidade)/i.test([product.category, product.subcategory, product.theme, product.name, ...product.tags].join(" ")),
  },
  {
    id: "setup",
    title: "Setup e utilidades",
    description: "Peças funcionais para mesa, bancada, banheiro, controle, headphone e uso diário.",
    href: "/catalogo?q=suporte",
    cta: "Ver utilidades",
    match: (product) =>
      /(utilidade|setup|suporte|organizador|bancada|controle|headphone|fone|banheiro)/i.test(
        [product.category, product.subcategory, product.theme, product.name, ...product.tags].join(" ")
      ),
  },
  {
    id: "foto-real",
    title: "Geek com foto real",
    description: "Peças já fotografadas no ateliê para reduzir dúvida visual e ajudar a vender pelo impacto da peça pronta.",
    href: "#catalogo-real",
    cta: "Ver peças reais",
    match: (product) => isProductVisualVerified(product) && /(geek|colecion|anime|miniatura|chibi)/i.test([product.category, product.subcategory, product.theme, product.name].join(" ")),
  },
  {
    id: "premium",
    title: "Personalizados premium",
    description: "Miniaturas afetivas, peças pintadas e projetos sob medida com ticket mais alto e maior valor percebido.",
    href: "/catalogo?q=personalizado",
    cta: "Ver premium",
    match: (product) => product.customizable && product.pricePix >= 150,
  },
];

export function CatalogBuyingIntents({ products }: { products: Product[] }) {
  return (
    <section className="mt-10">
      <div className="mb-6 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/75">Comprar por objetivo</p>
        <h2 className="mt-3 text-3xl font-black text-white">Entradas rápidas para quem quer decidir mais rápido.</h2>
        <p className="mt-4 text-sm leading-7 text-white/68">
          Em vez de navegar tudo, o cliente pode começar pelo tipo de compra que mais converte: presente, utilidade, peça real ou projeto premium.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-4">
        {intents.map((intent, index) => {
          const matches = products.filter(intent.match).sort((a, b) => Number(isProductVisualVerified(b)) - Number(isProductVisualVerified(a)) || a.pricePix - b.pricePix);
          const lead = matches[0];
          const fromPrice = matches.length ? Math.min(...matches.map((item) => item.pricePix)) : null;

          return (
            <article key={intent.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-black/20">
              {lead ? (
                <Link href={getProductUrl(lead)} className="block">
                  <SafeProductImage
                    candidates={[lead.image || lead.images[0]]}
                    alt={lead.name}
                    className="aspect-[4/3] w-full object-cover"
                    priority={index < 2}
                  />
                </Link>
              ) : (
                <div className="aspect-[4/3] w-full bg-white/5" />
              )}
              <div className="space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">{matches.length} itens relacionados</p>
                <h3 className="text-2xl font-black text-white">{intent.title}</h3>
                <p className="text-sm leading-7 text-white/68">{intent.description}</p>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">Faixa de entrada</p>
                  <p className="mt-2 text-2xl font-black text-white">{fromPrice ? formatCurrency(fromPrice) : "Sob consulta"}</p>
                  <p className="mt-2 text-xs text-white/55">{lead ? lead.name : "Seleção em curadoria"}</p>
                </div>
                <Link href={intent.href} className="btn-secondary">
                  {intent.cta}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
