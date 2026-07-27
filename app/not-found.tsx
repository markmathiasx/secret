import Link from "next/link";
import Image from "next/image";
import { Home, Search, ShoppingBag, MessageCircleMore } from "lucide-react";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { formatCurrency } from "@/lib/utils";
import { getPrimaryProductPreviewImage } from "@/lib/product-images";
import { whatsappNumber } from "@/lib/constants";

export default async function NotFound() {
  const catalog = await getCatalogSnapshot();
  const suggestions = catalog.filter((product) => product.featured).slice(0, 4);

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center">
        <p className="text-gradient-brand text-9xl font-black">404</p>
        <h1 className="mt-4 text-3xl font-black text-white">Essa página não existe</h1>
        <p className="mt-4 max-w-lg mx-auto text-white/60">
          Mas temos centenas de produtos que podem te interessar. Explore o catálogo ou fale com a gente.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary gap-2">
            <Home className="h-4 w-4" /> Início
          </Link>
          <Link href="/catalogo" className="btn-secondary gap-2">
            <ShoppingBag className="h-4 w-4" /> Ver catálogo
          </Link>
          <Link href="/catalogo?q=" className="btn-glass gap-2">
            <Search className="h-4 w-4" /> Buscar produto
          </Link>
          <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap gap-2">
            <MessageCircleMore className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="divider-glow my-12" />

      <div>
        <p className="mb-6 text-center text-xs uppercase tracking-[0.22em] text-white/40">
          Sugestões para você
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={getProductUrl(product)}
              className="group rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30 hover:shadow-lg hover:shadow-cyan-400/10"
            >
              <div className="relative mb-3 h-32 overflow-hidden rounded-[18px]">
                <Image
                  src={getPrimaryProductPreviewImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover transition group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, 25vw"
                  unoptimized
                />
              </div>
              <p className="line-clamp-2 text-sm font-semibold text-white">{product.name}</p>
              <p className="mt-1 text-sm font-black text-emerald-100">{formatCurrency(product.pricePix)}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
