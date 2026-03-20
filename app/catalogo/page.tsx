import Link from "next/link";
import { ArrowRight, Boxes, Filter, Scale } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog, getProductsByType } from "@/lib/catalog";

export default function CatalogPage() {
  const summary = [
    { label: "Spare parts", value: getProductsByType("spare_part").length },
    { label: "Upgrades", value: getProductsByType("upgrade").length },
    { label: "Consumables", value: getProductsByType("consumable").length },
    { label: "Kits", value: getProductsByType("kit").length },
    { label: "Accessories", value: getProductsByType("accessory").length },
  ];

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[40px] border border-[#ead8c1] bg-[#fff5e8] p-7 shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Catalogo tecnico marketplace</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          Fotos reais + compatibilidade A1 Mini + filtros tecnicos para compra sem erro.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          Este catalogo foi refeito para funcionar como marketplace: cards com prova visual, preco Pix em destaque, comparador e curadoria por tipo de produto.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {summary.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{String(item.value).padStart(2, "0")}</p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/compatibilidade" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            <Filter className="h-4 w-4" />
            Abrir matriz de compatibilidade
          </Link>
          <Link href="/comparar" className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            <Scale className="h-4 w-4" />
            Comparar produtos
          </Link>
          <Link href="/configurador/nozzle-hotend" className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            <Boxes className="h-4 w-4" />
            Assistente de escolha
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <CatalogExplorer products={catalog} />
      </div>
    </section>
  );
}

