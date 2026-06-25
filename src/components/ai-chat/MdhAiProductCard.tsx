export function MdhAiProductCard({ product }: { product: { name: string; sku?: string; pricePix?: number } }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/5 p-3">
      <h3 className="text-sm font-bold text-white">{product.name}</h3>
      {product.sku ? <p className="text-xs text-white/60">SKU {product.sku}</p> : null}
      {typeof product.pricePix === "number" ? <p className="text-sm text-cyan-200">Pix R$ {product.pricePix.toFixed(2)}</p> : null}
    </article>
  );
}
