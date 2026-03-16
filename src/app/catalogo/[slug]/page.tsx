import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircleMore } from 'lucide-react';
import { catalog, findProductBySlug } from '@/lib/catalog';
import { ProductImageGallery } from '@/components/product-image-gallery';
import { QuoteForm } from '@/components/quote-form';
import { formatCurrency } from '@/lib/utils';
import { whatsappMessage, whatsappNumber } from '@/lib/constants';

export function generateStaticParams() {
  return catalog.map((product) => ({ slug: `${product.id}-${product.name.toLowerCase().replace(/\s+/g, '-')}` }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${whatsappMessage}\n\nTenho interesse em ${product.name} (${product.sku}).`)}`;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <Link href="/catalogo" className="btn-ghost-sm mb-6 inline-flex">
        <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <ProductImageGallery product={product} />

        <div className="glass-panel p-6 md:p-7">
          <div className="flex flex-wrap gap-2">
            <span className="glass-chip">{product.category}</span>
            <span className="chip-nav">{product.collection}</span>
            <span className="chip-nav">{product.readyToShip ? 'Pronta entrega' : 'Sob encomenda'}</span>
          </div>
          <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">{product.name}</h1>
          <p className="mt-4 text-base leading-8 text-white/70">{product.description}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-sm text-emerald-100/70">Pix</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.pricePix)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Cartão</p>
              <p className="mt-2 text-2xl font-black text-white">{formatCurrency(product.priceCard)}</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/55">Prazo</p>
              <p className="mt-2 text-lg font-bold text-white">{product.productionWindow}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ['Material', product.material],
              ['Acabamento', product.finish],
              ['Peso', `${product.grams} g`],
              ['Tempo de impressão', `${product.hours} h`]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-white/68">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                <p className="mt-2 font-semibold text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/checkout" className="btn-primary">Ir para checkout</Link>
            <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">
              <MessageCircleMore className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <QuoteForm product={product} />
      </div>
    </section>
  );
}
