import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { catalog, type ProductType } from "@/lib/catalog";

const typeLabel: Record<ProductType, string> = {
  spare_part: "Spare parts",
  upgrade: "Upgrades",
  consumable: "Consumables",
  kit: "Kits",
  accessory: "Accessories",
};

export default function CompatibilidadePage() {
  const matrix = catalog.map((item) => ({
    sku: item.sku,
    nome: item.name,
    tipo: typeLabel[item.technical.typeProduct],
    a1Mini: item.technical.compatibilityModels.includes("A1 Mini"),
    a1: item.technical.compatibilityModels.includes("A1"),
    status: item.status,
  }));

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Matriz de compatibilidade</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">A1 Mini x A1 por SKU</h1>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
          Tabela de validacao rapida para filtrar pecas e kits sem erro de modelo.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catalogo
          </Link>
          <Link href="/configurador/nozzle-hotend" className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
            Abrir configurador
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[30px] border border-[#e8dac7] bg-white">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="bg-[#fff8ef] text-xs uppercase tracking-[0.16em] text-slate-500">
            <tr>
              <th className="border-b border-[#eadcc8] p-4 text-left">SKU</th>
              <th className="border-b border-[#eadcc8] p-4 text-left">Produto</th>
              <th className="border-b border-[#eadcc8] p-4 text-left">Tipo</th>
              <th className="border-b border-[#eadcc8] p-4 text-center">A1 Mini</th>
              <th className="border-b border-[#eadcc8] p-4 text-center">A1</th>
              <th className="border-b border-[#eadcc8] p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {matrix.map((row) => (
              <tr key={row.sku} className="border-b border-[#f1e7d8]">
                <td className="p-4 font-semibold text-slate-700">{row.sku}</td>
                <td className="p-4 text-slate-700">{row.nome}</td>
                <td className="p-4 text-slate-700">{row.tipo}</td>
                <td className="p-4 text-center">
                  <CompatibilityFlag value={row.a1Mini} />
                </td>
                <td className="p-4 text-center">
                  <CompatibilityFlag value={row.a1} />
                </td>
                <td className="p-4 text-slate-700">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-[#e8dac7] bg-white p-4 text-sm text-slate-600">
        <p className="inline-flex items-center gap-2 font-semibold text-slate-800">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Regra de seguranca
        </p>
        <p className="mt-2">Desligue e desconecte da tomada antes de qualquer manutencao ou troca de componente.</p>
      </div>
    </section>
  );
}

function CompatibilityFlag({ value }: { value: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${value ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
      {value ? "Compativel" : "Nao"}
    </span>
  );
}

