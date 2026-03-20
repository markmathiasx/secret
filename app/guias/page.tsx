import Link from "next/link";
import { guides } from "@/lib/guides";

export default function GuiasPage() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Base de conhecimento</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Guias de instalacao e manutencao</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Conteudo orientado por sintoma e por operacao para reduzir erro em campo e acelerar suporte.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((guide) => (
          <article key={guide.slug} className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Nivel: {guide.level}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">{guide.title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{guide.summary}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Tempo: {guide.timeMin} min</span>
              <span>{guide.tools.length} ferramentas</span>
            </div>
            <Link href={`/guias/${guide.slug}`} className="mt-5 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white">
              Abrir guia
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

