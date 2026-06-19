import Link from "next/link";
import { ArrowRight, MessageCircleMore, ShoppingBag } from "lucide-react";
import { SafeProductImage } from "@/components/safe-product-image";
import { buildCommerceWhatsAppHref } from "@/components/commerce/WhatsAppQuoteCta";
import { getFirstSaleProducts, type CuratedFirstSaleProduct } from "@/lib/commerce/first-sale-products";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";

function ProductCard({ item }: { item: CuratedFirstSaleProduct }) {
  const product = item.product;
  const cardPrice = calculateCardPrice(product.pricePix);
  const message = [
    `Quero comprar ${product.name}.`,
    `Intenção: ${item.slot}.`,
    `Pix: ${formatCurrency(product.pricePix)}.`,
    `Cartão: ${formatCurrency(cardPrice)}.`,
    `Prazo: ${product.productionWindow}.`,
    `Link: https://www.mdh3d.com.br${item.href}`,
  ].join("\n");

  return (
    <article
      data-product-id={product.id}
      className="group overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/30 hover:bg-white/[0.065] hover:shadow-[0_18px_48px_rgba(2,8,23,0.42)]"
    >
      <Link href={item.href} className="block">
        <div className="relative aspect-square bg-black/25">
          <SafeProductImage
            candidates={[item.image, "/placeholders/product-card.svg"]}
            alt={item.imageAlt}
            sizes="(max-width: 768px) 50vw, 280px"
            className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[11px] font-black uppercase tracking-[0.13em] text-emerald-100/75">{item.slot}</p>
        <Link href={item.href}>
          <h3 className="mt-1 line-clamp-2 min-h-11 text-base font-black leading-5 text-white">{product.name}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-white/58">{item.whyBuy}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-white/42">Pix</dt>
            <dd className="text-lg font-black text-emerald-100">{formatCurrency(product.pricePix)}</dd>
          </div>
          <div>
            <dt className="text-white/42">Cartão</dt>
            <dd className="text-lg font-black text-white">{formatCurrency(cardPrice)}</dd>
          </div>
          <div>
            <dt className="text-white/42">Prazo</dt>
            <dd className="font-bold text-white/72">{product.productionWindow}</dd>
          </div>
          <div>
            <dt className="text-white/42">Personaliza</dt>
            <dd className="font-bold text-white/72">{product.customizable ? "Sim" : "Consultar"}</dd>
          </div>
        </dl>
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link href={item.href} className="btn-primary justify-center gap-2 px-3 py-2 text-xs">
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </Link>
          <a
            href={buildCommerceWhatsAppHref(message)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-[8px] border border-emerald-300/25 bg-emerald-300/10 px-3 text-emerald-100"
            aria-label={`Enviar ${product.name} no WhatsApp`}
          >
            <MessageCircleMore className="h-4 w-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function BestSellersSection({ limit = 12 }: { limit?: number }) {
  const products = getFirstSaleProducts().slice(0, limit);

  return (
    <section id="mais-pedidos" className="mx-auto max-w-7xl px-4 py-10 sm:px-6" data-first-sale-section="best-sellers">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white sm:text-3xl">Mais pedidos</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
            Doze entradas reais do catálogo para comprar primeiro: chaveiros, presentes, setup, utilidades, lote e sob medida.
          </p>
        </div>
        <Link href="/catalogo" className="hidden items-center gap-2 text-sm font-bold text-emerald-100 hover:text-white sm:inline-flex">
          Ver catálogo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {products.map((item) => (
          <ProductCard key={`${item.slot}-${item.product.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}
