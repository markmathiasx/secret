import { ChartNoAxesCombined, Package, Percent, Truck } from "lucide-react";
import { catalog, featuredCatalog } from "@/lib/catalog";
import { deliveryZones } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const averagePix =
  featuredCatalog.reduce((total, product) => total + product.pricePix, 0) / Math.max(featuredCatalog.length, 1);

const cards = [
  {
    title: "Catalogo ativo",
    value: `${catalog.length} itens`,
    text: "Base principal para storefront, busca e produto.",
    icon: Package
  },
  {
    title: "Ticket medio Pix",
    value: formatCurrency(averagePix),
    text: "Media dos destaques exibidos na home.",
    icon: Percent
  },
  {
    title: "Faixas de entrega",
    value: `${deliveryZones.length} regioes`,
    text: "Cobertura local atualmente configurada.",
    icon: Truck
  },
  {
    title: "Operacao pronta",
    value: "Producao",
    text: "Storefront resiliente com fallbacks de integracao.",
    icon: ChartNoAxesCombined
  }
] as const;

export default function AdminPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-white/10 bg-card p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Resumo</p>
        <h2 className="mt-2 text-3xl font-black text-white">Painel administrativo enxuto para validar operacao e vitrine</h2>
        <p className="mt-3 text-white/65">
          Esta visao existe para checagem rapida do storefront endurecido, sem expor dados sensiveis no cliente.
        </p>
      </div>

<<<<<<< ours
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.title} className="rounded-[28px] border border-white/10 bg-card p-5">
            <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <card.icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm text-white/55">{card.title}</p>
            <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
            <p className="mt-3 text-sm leading-7 text-white/65">{card.text}</p>
          </article>
        ))}
=======
      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold text-white">Checklist rápido</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/65">
          <li>Definir ADMIN_PASSWORD</li>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
          <li>Adicionar mídia real em biblioteca local de mídia</li>
=======
          <li>Validar mídia institucional da vitrine</li>
>>>>>>> theirs
=======
          <li>Validar mídia institucional da vitrine</li>
>>>>>>> theirs
=======
          <li>Validar mídia institucional da vitrine</li>
>>>>>>> theirs
=======
          <li>Validar mídia institucional da vitrine</li>
>>>>>>> theirs
=======
          <li>Adicionar mídia real em biblioteca local de mídia</li>
>>>>>>> theirs
          <li>Ativar login social (Supabase) quando quiser</li>
          <li>Revisar preços e zonas de entrega</li>
        </ul>
>>>>>>> theirs
      </div>
    </section>
  );
}
