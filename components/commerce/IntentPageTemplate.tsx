import Link from "next/link";
import { MessageCircleMore, ShoppingBag } from "lucide-react";
import { IntentPageViewEvent } from "@/components/analytics/IntentPageViewEvent";
import { SafeProductImage } from "@/components/safe-product-image";
import { buildCommerceWhatsAppHref, WhatsAppQuoteCta } from "@/components/commerce/WhatsAppQuoteCta";
import { getIntentProducts, getProductCardData, intentPageConfigs } from "@/lib/commerce/first-sale-products";
import { calculateCardPrice } from "@/lib/payment-pricing";
import { formatCurrency } from "@/lib/utils";

export function IntentPageTemplate({ configKey }: { configKey: keyof typeof intentPageConfigs }) {
  const config = intentPageConfigs[configKey];
  const products = getIntentProducts(config.intent, 12);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: config.title,
    description: config.description,
    mainEntity: products.slice(0, 12).map((product) => ({
      "@type": "Product",
      name: product.name,
      sku: product.sku,
      category: product.category,
      offers: {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: product.pricePix,
        availability: "https://schema.org/InStock",
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[#071016] text-white">
      <IntentPageViewEvent intent={config.intent} title={config.title} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-white/10 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">{config.title}</h1>
            <p className="mt-4 text-base leading-7 text-white/68">{config.description}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/catalogo" className="btn-primary justify-center gap-2 px-5 py-3">
                <ShoppingBag className="h-4 w-4" />
                Ver catálogo completo
              </Link>
              <WhatsAppQuoteCta message={`Quero comprar pela página ${config.title}. Pode me orientar com produto, preço e prazo?`} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const card = getProductCardData(product);
            const cardPrice = calculateCardPrice(product.pricePix);
            const message = [
              `Quero comprar ${product.name}.`,
              `Pix: ${formatCurrency(product.pricePix)}.`,
              `Cartão: ${formatCurrency(cardPrice)}.`,
              `Prazo: ${product.productionWindow}.`,
              `Link: https://www.mdh3d.com.br${card.href}`,
            ].join("\n");
            return (
              <article key={product.id} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.045]">
                <Link href={card.href} className="block">
                  <div className="relative aspect-square bg-black/25">
                    <SafeProductImage
                      candidates={[card.image, "/placeholders/product-card.svg"]}
                      alt={card.imageAlt}
                      sizes="(max-width: 768px) 50vw, 280px"
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="line-clamp-1 text-[11px] font-black uppercase tracking-[0.13em] text-emerald-100/75">{product.category}</p>
                  <Link href={card.href}><h2 className="mt-1 line-clamp-2 min-h-11 text-base font-black leading-5">{product.name}</h2></Link>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-white/42">Pix</p><p className="text-lg font-black text-emerald-100">{formatCurrency(product.pricePix)}</p></div>
                    <div><p className="text-white/42">Cartão</p><p className="text-lg font-black">{formatCurrency(cardPrice)}</p></div>
                    <div><p className="text-white/42">Prazo</p><p className="font-bold text-white/70">{product.productionWindow}</p></div>
                    <div><p className="text-white/42">Personaliza</p><p className="font-bold text-white/70">{product.customizable ? "Sim" : "Consultar"}</p></div>
                  </div>
                  <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                    <Link href={card.href} className="btn-primary justify-center px-3 py-2 text-xs">Comprar</Link>
                    <a href={buildCommerceWhatsAppHref(message)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-[8px] border border-emerald-300/25 bg-emerald-300/10 px-3 text-emerald-100" aria-label={`Enviar ${product.name} no WhatsApp`}>
                      <MessageCircleMore className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-2xl font-black">FAQ curto</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">Confirme cor, medida, quantidade e prazo antes de fechar itens personalizados.</p>
          </div>
          <div className="grid gap-3">
            {config.faq.map(([question, answer]) => (
              <article key={question} className="rounded-[8px] border border-white/10 bg-white/[0.045] p-4">
                <h3 className="font-black text-white">{question}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
