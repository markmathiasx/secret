import Link from 'next/link';
import { featuredCatalog, getProductUrl } from '@/lib/catalog';
import { formatCurrency } from '@/lib/utils';

const intentRoutes = [
  { href: '/catalogo?stock=ready', label: 'Quero pronta entrega', helper: 'Entrar direto nos itens com giro mais curto' },
  { href: '/catalogo?q=foto%20real', label: 'Quero foto real', helper: 'Ver só o que já tem prova visual forte' },
  { href: '/catalogo?customization=custom', label: 'Quero personalizar', helper: 'Abrir os produtos com espaço para briefing' },
  { href: '/catalogo?q=chibi', label: 'Quero miniaturas geek', helper: 'Ir para o recorte mais colecionável da vitrine' },
  { href: '/catalogo?q=organizador', label: 'Quero utilidade', helper: 'Focar em itens práticos e de uso diário' },
  { href: '/catalogo?q=presente', label: 'Quero presente criativo', helper: 'Entrar no recorte de peças com apelo comercial' },
];

export default function HomePage() {
  const highlights = featuredCatalog.slice(0, 6);
  const realPhotos = featuredCatalog.filter((item) => item.realPhoto).length;
  const readyToShip = featuredCatalog.filter((item) => item.status === "Pronta entrega").length;
  const customizable = featuredCatalog.filter((item) => item.customizable).length;
  const averagePix = featuredCatalog.length
    ? featuredCatalog.reduce((total, item) => total + item.pricePix, 0) / featuredCatalog.length
    : 0;

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:py-10">
      <section className="rounded-[36px] border border-[#ead8c1] bg-[#fff8ef] p-7 shadow-[0_30px_80px_rgba(15,23,42,0.08)] md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MDH 3D Marketplace</p>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
          E-commerce com fotos reais, filtros técnicos e comparação para compra sem erro.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-600">
          Catálogo com curadoria estilo marketplace, foco em decisão rápida, atalhos por intenção de compra e páginas pessoais que guardam sua navegação.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
            Explorar catálogo
          </Link>
          <Link href="/favoritos" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Abrir favoritos
          </Link>
          <Link href="/recentes" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Ver recentes
          </Link>
          <Link href="/buscas-salvas" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Buscas salvas
          </Link>
          <Link href="/comparar" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Comparador
          </Link>
          <Link href="/conta" className="rounded-full border border-[#d9c7b1] bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-[#fff3e2]">
            Minha conta
          </Link>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-4">
          <MetricCard label="Fotos reais" value={String(realPhotos).padStart(2, "0")} />
          <MetricCard label="Pronta entrega" value={String(readyToShip).padStart(2, "0")} />
          <MetricCard label="Personalizáveis" value={String(customizable).padStart(2, "0")} />
          <MetricCard label="Preço médio Pix" value={formatCurrency(averagePix)} />
        </div>
      </section>

      <section className="mt-8 rounded-[32px] border border-[#ead8c1] bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Entradas rápidas</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">Comece pela sua intenção, não pela rolagem</h2>
          </div>
          <Link href="/catalogo" className="rounded-full border border-[#ead8c1] bg-[#fff8ef] px-4 py-2 text-sm font-semibold text-slate-700">
            Ver tudo
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {intentRoutes.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[24px] border border-[#ead8c1] bg-[#fff8ef] p-5 transition hover:-translate-y-0.5">
              <p className="text-lg font-black text-slate-900">{item.label}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.helper}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {highlights.map((item) => (
          <article key={item.id} className="rounded-[26px] border border-[#ead8c1] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.sku}</p>
            <h2 className="mt-2 text-xl font-black text-slate-900">{item.name}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">No Pix</p>
                <p className="text-2xl font-black text-slate-900">{formatCurrency(item.pricePix)}</p>
              </div>
              <Link href={getProductUrl(item)} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Ver produto
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-4">
        {[
          {
            title: "Favoritos persistentes",
            description: "O visitante pode separar produtos relevantes sem perder o contexto da navegação.",
          },
          {
            title: "Histórico útil",
            description: "A vitrine lembra os produtos vistos recentemente para reduzir retrabalho na busca.",
          },
          {
            title: "Compartilhamento rápido",
            description: "Filtros, comparações e produtos podem ser compartilhados com menos atrito entre cliente e atendimento.",
          },
          {
            title: "Buscas salvas",
            description: "Recortes completos do catálogo viram atalhos de retorno para orçamento, venda recorrente e aprovação.",
          },
          {
            title: "Minha conta funcional",
            description: "A área da conta agora concentra favoritos, recentes, comparador, buscas salvas e atalhos de suporte.",
          },
          {
            title: "Entrada por intenção",
            description: "A homepage não depende mais só de banners; ela oferece caminhos curtos por tipo de objetivo.",
          },
          {
            title: "Decisão por prova visual",
            description: "A homepage reforça a regra principal da loja: foto real e imagem conceitual nunca ficam misturadas.",
          },
          {
            title: "Fechamento mais claro",
            description: "Do catálogo ao PDP, o caminho reforça preço Pix, prazo, prova visual e próxima ação recomendada.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[26px] border border-[#ead8c1] bg-white p-5">
            <p className="text-lg font-black text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {[
          {
            title: "Para quem está escolhendo presente",
            description: "Priorize fotos reais, pronta entrega e itens com descrição comercial curta para acelerar aprovação.",
          },
          {
            title: "Para quem está pesquisando com calma",
            description: "Use buscas salvas para transformar recortes do catálogo em atalhos reutilizáveis sem refazer os filtros.",
          },
          {
            title: "Para quem vai fechar pelo WhatsApp",
            description: "Passe primeiro em favoritos, recentes ou comparador. Isso leva contexto melhor do que mandar links soltos.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[26px] border border-[#ead8c1] bg-[#fff8ef] p-5">
            <p className="text-lg font-black text-slate-900">{item.title}</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
          </div>
        ))}
      </section>
    </main>
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
