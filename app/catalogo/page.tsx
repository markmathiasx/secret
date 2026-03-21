import Link from "next/link";
import { ArrowRight, Boxes, Filter, Scale } from "lucide-react";
import { CatalogExplorer } from "@/components/catalog-explorer";
import { catalog, getProductsByType } from "@/lib/catalog";

const routeCards = [
  { href: "/catalogo?stock=ready", title: "Só pronta entrega", description: "Entre direto no que tende a converter mais rápido." },
  { href: "/catalogo?q=foto%20real", title: "Só foto real", description: "Filtre os itens que já têm prova visual concreta." },
  { href: "/catalogo?customization=custom", title: "Só personalizáveis", description: "Abra a linha que aceita briefing e ajuste." },
  { href: "/catalogo?q=chibi", title: "Geek e miniaturas", description: "Vá para personagens, chibis e colecionáveis." },
  { href: "/catalogo?q=organizador", title: "Utilidade e organização", description: "Comece pelos itens de uso diário e setup." },
  { href: "/catalogo?q=presente", title: "Presentes criativos", description: "Acesse o recorte mais comercial para surpreender." },
];

export default function CatalogPage() {
  const realPhotos = catalog.filter((item) => item.realPhoto).length;
  const conceptImages = catalog.filter((item) => item.visualKind === "concept_image").length;
  const readyToShip = catalog.filter((item) => item.status === "Pronta entrega").length;
  const customizable = catalog.filter((item) => item.customizable).length;
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Catálogo técnico marketplace</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          Fotos reais sinalizadas + imagens conceituais identificadas + filtros de navegação mais úteis.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          Este catálogo foi refeito para funcionar como marketplace: cards com prova visual, preço Pix em destaque, memória de busca e atalhos prontos por intenção de compra.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {summary.map((item) => (
            <div key={item.label} className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{String(item.value).padStart(2, "0")}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Fotos reais" value={String(realPhotos).padStart(2, "0")} />
          <MetricCard label="Imagens conceituais" value={String(conceptImages).padStart(2, "0")} />
          <MetricCard label="Pronta entrega" value={String(readyToShip).padStart(2, "0")} />
          <MetricCard label="Personalizáveis" value={String(customizable).padStart(2, "0")} />
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
          <Link href="/favoritos" className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            Favoritos salvos
          </Link>
          <Link href="/recentes" className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            Vistos recentemente
          </Link>
          <Link href="/buscas-salvas" className="inline-flex items-center gap-2 rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff8ef]">
            Buscas salvas
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Comece mais rápido</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Rotas curtas para entrar no recorte certo</h2>
          </div>
          <Link href="/conta" className="rounded-full border border-[#ead8c1] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            Abrir minha conta
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routeCards.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[24px] border border-[#ead8c1] bg-[#fff8ef] p-5 transition hover:-translate-y-0.5">
              <p className="text-lg font-black text-slate-900">{item.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <CatalogExplorer products={catalog} />
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-4">
        {[
          {
            title: "Catálogo com memória",
            description: "Favoritos, vistos recentemente e buscas salvas preservam o contexto da jornada.",
          },
          {
            title: "Busca mais orientada",
            description: "Além do texto livre, a navegação opera por tema, material, acabamento, tipo, preço e prova visual.",
          },
          {
            title: "Compartilhamento melhor",
            description: "Dá para compartilhar o recorte atual do catálogo ou um produto específico com menos atrito.",
          },
          {
            title: "Abertura por intenção",
            description: "A página agora oferece entradas diretas para pronta entrega, personalização, geek, utilidades e presentes.",
          },
          {
            title: "Filtro com leitura comercial",
            description: "O usuário não vê só a quantidade; ele entende preço médio, lead time e peso do recorte.",
          },
          {
            title: "Retorno mais rápido",
            description: "Itens favoritos, recentes e buscas salvas ficam acessíveis dentro do próprio fluxo de catalogação.",
          },
          {
            title: "Confiança mais visível",
            description: "A página reforça com mais clareza os sinais de entrega rápida, prova visual e status do recorte atual.",
          },
          {
            title: "Ponte curta para fechamento",
            description: "O catálogo empurra menos para rolagem infinita e mais para comparação, produto e contato humano.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[28px] border border-[#ead8c1] bg-white p-5">
            <p className="text-lg font-black text-slate-900">{item.title}</p>
            <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-[#ead8c1] bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
    </div>
  );
}
