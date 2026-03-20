import Link from "next/link";
import { getProductsByType, getProductUrl } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default function KitsPage() {
  const kits = getProductsByType("kit");
  const consumables = getProductsByType("consumable").slice(0, 4);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Kits e bundles</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Kits prontos para compra rapida</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Monte compra recorrente com kits de manutencao e itens personalizados com BOM visivel.
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {kits.map((kit) => (
          <article key={kit.id} className="rounded-[30px] border border-[#e8dac7] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{kit.sku}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{kit.name}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{kit.description}</p>
            <div className="mt-4 rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
              <p className="text-sm text-slate-600">BOM</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {(kit.technical.bomItems || []).map((item) => (
                  <li key={item.sku}>• {item.name} ({item.qty}x)</li>
                ))}
                {!kit.technical.bomItems?.length ? <li>• Kit sem BOM detalhado no momento.</li> : null}
              </ul>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Preco Pix</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(kit.pricePix)}</p>
              </div>
              <Link href={getProductUrl(kit)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Ver kit
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[30px] border border-[#e8dac7] bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900">Complementos recomendados</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {consumables.map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4 hover:bg-[#fff3e2]">
              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="mt-2 text-xs text-slate-500">{item.sku}</p>
              <p className="mt-2 text-sm font-bold text-slate-900">{formatCurrency(item.pricePix)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

