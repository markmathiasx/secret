import Link from "next/link";
import { notFound } from "next/navigation";
import { findGuideBySlug } from "@/lib/guides";
import { catalog, getProductUrl } from "@/lib/catalog";

export default async function GuiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);
  if (!guide) notFound();

  const relatedProducts = catalog.filter((item) => guide.relatedSkus.includes(item.sku));

  return (
    <section className="mx-auto max-w-[1300px] px-4 py-8 md:px-6 lg:py-10">
      <Link href="/guias" className="inline-flex rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700">
        Voltar para guias
      </Link>

      <div className="mt-5 rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Guia {guide.level}</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">{guide.title}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{guide.summary}</p>
        <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">Tempo estimado: {guide.timeMin} min</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-[30px] border border-[#e8dac7] bg-white p-6">
          <h2 className="text-2xl font-black text-slate-900">Passo a passo</h2>
          <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
            {guide.steps.map((step, index) => (
              <li key={step}>
                <span className="font-black text-slate-900">{index + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </article>

        <div className="space-y-6">
          <article className="rounded-[30px] border border-[#e8dac7] bg-white p-6">
            <h2 className="text-2xl font-black text-slate-900">Ferramentas</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {guide.tools.map((tool) => (
                <li key={tool}>• {tool}</li>
              ))}
            </ul>
          </article>

          <article className="rounded-[30px] border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-2xl font-black text-amber-900">Avisos de seguranca</h2>
            <ul className="mt-4 space-y-2 text-sm text-amber-900">
              {guide.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <article className="mt-6 rounded-[30px] border border-[#e8dac7] bg-white p-6">
        <h2 className="text-2xl font-black text-slate-900">Produtos relacionados</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <Link key={item.id} href={getProductUrl(item)} className="rounded-2xl border border-[#eadcc8] bg-[#fff8ef] p-4">
              <p className="text-sm font-semibold text-slate-900">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">{item.sku}</p>
            </Link>
          ))}
          {!relatedProducts.length ? <p className="text-sm text-slate-500">Sem produtos vinculados para este guia.</p> : null}
        </div>
      </article>
    </section>
  );
}

