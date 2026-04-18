import Link from "next/link";
import Image from "next/image";
import { Home, Search, ShoppingBag } from "lucide-react";
import { featuredCatalog, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { resolveProductImage } from "@/lib/product-images";

export default function NotFound() {
  const suggestions = featuredCatalog.slice(0, 4);

  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <div className="text-center">
        <p className="text-8xl font-black text-white/10">404</p>
        <h1 className="mt-4 text-3xl font-black text-white">Essa página não existe</h1>
        <p className="mt-4 text-white/60">
          Mas temos 748 produtos que podem te interessar. Que tal explorar o catálogo?
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
        </div>
      </div>

      <div className="mt-16">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.22em] text-white/40">
          Sugestões para você
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={getProductUrl(product)}
              className="group rounded-[24px] border border-white/10 bg-white/5 p-4 transition hover:border-white/20"
            >
              <div className="relative mb-3 h-32 overflow-hidden rounded-[18px]">
                <Image
                  src={resolveProductImage(product)}
                  alt={product.name}
                  fill
                  className="object-cover transition group-hover:scale-105"
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
