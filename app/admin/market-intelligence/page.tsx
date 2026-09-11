import { redirect } from "next/navigation";
import { CompetitivePriceSimulator } from "@/components/admin/competitive-price-simulator";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

const observations = [
  ["Chaveiro de nome personalizado", "R$ 22,90–23,00", "Alta personalização"],
  ["Chaveiro de personagem simples", "R$ 9,00–15,90", "Competição forte; conferir licença"],
  ["Kit com 10 chaveiros", "R$ 53,25–81,00", "Venda em lote"],
  ["Chaveiro pet / articulado", "R$ 4,99–25,00", "Bom formato para vídeo curto"],
  ["Chaveiro NFC ou logo", "R$ 14,00–87,44", "Maior valor quando personalizado"],
] as const;

export const dynamic = "force-dynamic";

export default async function MarketIntelligencePage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  return (
    <main className="space-y-8">
      <header className="rounded-[36px] border border-amber-300/20 bg-[radial-gradient(circle_at_top_right,rgba(213,170,88,.18),rgba(5,7,8,.98)_58%)] p-8">
        <p className="text-xs uppercase tracking-[0.22em] text-amber-200">Radar MDH · inteligência comercial</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black text-white">Tendências viram hipóteses. Só peças produzíveis viram produtos.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">Referências informadas em 11/09/2026 a partir de resultados públicos. Nenhuma foto, descrição ou anúncio de terceiro é copiado para o catálogo.</p>
      </header>
      <CompetitivePriceSimulator />
      <section className="rounded-[30px] border border-white/10 bg-black/25 p-6">
        <h2 className="text-2xl font-black text-white">Sinais observados para validar</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {observations.map(([name, price, note]) => <article key={name} className="rounded-[22px] border border-white/10 bg-white/5 p-5"><h3 className="font-bold text-white">{name}</h3><p className="mt-2 text-xl font-black text-amber-200">{price}</p><p className="mt-2 text-sm text-white/55">{note}</p></article>)}
        </div>
        <p className="mt-5 text-xs leading-6 text-white/45">Antes de publicar: confirmar arquivo com licença comercial, teste de impressão, custo real, prazo, foto própria e margem. Marcas e personagens exigem autorização do titular.</p>
      </section>
    </main>
  );
}

