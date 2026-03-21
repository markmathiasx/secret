import Link from "next/link";
import { SafeProductImage } from "@/components/safe-product-image";
import { whatsappNumber } from "@/lib/constants";
import { catalog, getProductUrl } from "@/lib/catalog";
import { isProductVisualVerified } from "@/lib/product-visuals";
import { resolveProductImage } from "@/lib/product-images";

export function CatalogRealCases() {
  const realCaseStudies = catalog.filter((product) => isProductVisualVerified(product)).slice(0, 6);

  return (
    <section id="catalogo-real" className="glass-panel mt-10 rounded-[32px] border border-white/10 bg-black/20 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Fotos reais do ateliê</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Peças já produzidas para você sentir o nível real de acabamento da MDH 3D.</h2>
          <p className="mt-3 text-sm leading-7 text-white/68">
            Essas fotos mostram trabalhos já entregues ou produzidos no ateliê. Elas ajudam a comparar material, acabamento, escala e presença visual antes do seu pedido.
          </p>
        </div>
        <a
          href={`https://wa.me/${whatsappNumber}?text=Quero%20validar%20foto%20real%20de%20um%20item%20do%20cat%C3%A1logo.`}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/40 hover:bg-emerald-300/15"
        >
          Verificar peça parecida
        </a>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {realCaseStudies.map((item) => (
          <article key={item.id} className="catalog-real-card overflow-hidden rounded-[24px] border border-white/10 bg-slate-950/55 transition-all duration-300 hover:-translate-y-1">
            <SafeProductImage candidates={[resolveProductImage(item)]} alt={item.name} className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-3 p-4">
              <span className="inline-flex rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                Foto real
              </span>
              <h3 className="text-lg font-semibold text-white">{item.name}</h3>
              <Link
                href={getProductUrl(item)}
                className="btn-secondary inline-flex rounded-full px-4 py-2 text-sm"
              >
                Pedir algo parecido
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
