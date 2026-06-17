import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Gift, Percent, ShoppingBag, TicketPercent } from "lucide-react";
import { StoreAnimatedBackground } from "@/components/mdh-store/StoreAnimatedBackground";
import { smartStoreCoupons } from "@/lib/mdh-store/promotions";
import { getLocalStoreProducts } from "@/lib/mdh-store/products";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ofertas e cupons MDH3D",
  description: "Cupons locais, combos, presentes até R$50 e ofertas de impressão 3D da MDH3D.",
  alternates: { canonical: "/ofertas" },
};

export default function OfertasPage() {
  const products = getLocalStoreProducts();
  const under10 = products.filter((product) => product.pixPrice <= 10);
  const under30 = products.filter((product) => product.pixPrice <= 30);
  const under50 = products.filter((product) => product.pixPrice <= 50);
  const sections = [
    { title: "Produtos até R$ 10", products: under10, href: "/loja" },
    { title: "Produtos até R$ 30", products: under30, href: "/loja" },
    { title: "Presentes até R$ 50", products: under50, href: "/loja" },
  ];

  return (
    <main className="store-animated-shell min-h-screen pb-14 text-white">
      <StoreAnimatedBackground />
      <section className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(3,7,13,0.76),rgba(3,7,13,0.42))] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="section-kicker">Campanhas</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl">
            Ofertas, cupons e combos para comprar melhor
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
            Cupons locais para negociação no WhatsApp, combos de presentes e vitrines por faixa de preço.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/loja" className="btn-primary gap-2 px-5 py-3">
              <ShoppingBag className="h-4 w-4" /> Ver loja
            </Link>
            <Link href="/orcamento-personalizado" className="btn-secondary gap-2 px-5 py-3">
              Peça sob medida
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {smartStoreCoupons.map((coupon) => (
            <article key={coupon.code} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
              <div className="flex items-start justify-between gap-3">
                <TicketPercent className="h-5 w-5 text-emerald-100" />
                <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-emerald-100">
                  {coupon.badge}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-black text-white">{coupon.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/62">{coupon.description}</p>
              <p className="mt-4 rounded-[8px] border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm font-black text-cyan-100">{coupon.code}</p>
              {coupon.minSubtotal ? <p className="mt-2 text-xs text-white/48">Mínimo sugerido: {formatCurrency(coupon.minSubtotal)}</p> : null}
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <Gift className="h-5 w-5 text-cyan-100" />
            <h2 className="mt-4 text-2xl font-black text-white">Leve 3 pague 2</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">Use o cupom LEVE3 para montar combo de chaveiros e itens pequenos pelo WhatsApp.</p>
          </article>
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <Percent className="h-5 w-5 text-cyan-100" />
            <h2 className="mt-4 text-2xl font-black text-white">Pix com argumento claro</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">Produtos exibem Pix e cartão separados quando houver diferença no CSV.</p>
          </article>
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <Clock3 className="h-5 w-5 text-cyan-100" />
            <h2 className="mt-4 text-2xl font-black text-white">Contador de campanha</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">Campanhas locais são revisadas semanalmente conforme fila de impressão e estoque.</p>
          </article>
        </div>

        {sections.map((section) => (
          <section key={section.title} className="mt-8">
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <p className="section-kicker">Vitrine promocional</p>
                <h2 className="text-2xl font-black text-white">{section.title}</h2>
              </div>
              <Link href={section.href} className="text-sm font-black text-cyan-100 underline-offset-4 hover:underline">Abrir loja</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {section.products.slice(0, 6).map((product) => (
                <Link key={product.slug} href={`/produto/${product.slug}`} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-200/30">
                  <p className="text-sm font-black text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-white/50">{product.category}</p>
                  <p className="mt-2 text-lg font-black text-emerald-100">{formatCurrency(product.pixPrice)}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
