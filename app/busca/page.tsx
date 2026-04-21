import Link from "next/link";
import { Search } from "lucide-react";
import { getCatalogSnapshot } from "@/lib/catalog-repository";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function BuscaPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() || "";
  const catalog = await getCatalogSnapshot();

  const results = query
    ? catalog.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags?.some((t) => t.toLowerCase().includes(query))
      )
    : [];

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <p className="section-kicker">Catálogo</p>
        <h1 className="section-title">Buscar produtos</h1>
      </div>

      <form method="get" className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
          <input
            type="search"
            name="q"
            defaultValue={q || ""}
            placeholder="Nome, categoria, SKU ou descrição…"
            className="field-base pl-10 text-base"
            autoFocus
          />
        </div>
        <button type="submit" className="btn-primary whitespace-nowrap">
          Buscar
        </button>
      </form>

      {!query && (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-white/50">
          <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p>Digite algo para buscar no catálogo.</p>
        </div>
      )}

      {query && results.length === 0 && (
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-8 text-center text-white/50">
          <p>Nenhum produto encontrado para <strong className="text-white">&quot;{q}&quot;</strong>.</p>
          <Link href="/catalogo" className="btn-secondary mt-4 inline-flex">
            Ver todo o catálogo
          </Link>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p className="mb-4 text-sm text-white/50">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para <strong className="text-white">&quot;{q}&quot;</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/catalogo/${product.id}-${product.slug || product.sku.toLowerCase()}`}
                className="glass-card group flex flex-col gap-3 transition hover:border-cyan-300/30"
              >
                <div className="aspect-square overflow-hidden rounded-[16px] bg-white/5">
                  {product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/20 text-3xl">📦</div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white leading-tight">{product.name}</p>
                  <p className="mt-0.5 text-xs text-white/50">{product.category}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-200">{fmt(product.pricePix)}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${product.stock > 0 ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-white/10 bg-white/5 text-white/40"}`}>
                      {product.status === "Pronta entrega" ? "Pronta entrega" : "Sob encomenda"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
