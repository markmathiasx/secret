"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Bookmark, Clock3, Copy, Search, Share2, Trash2 } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { CopyButton } from "@/components/copy-button";
import { useSavedSearches } from "@/components/saved-searches-context";

export default function SavedSearchesPage() {
  const { savedSearches, savedSearchCount, removeSearch, clearSearches } = useSavedSearches();
  const newest = savedSearches[0];
  const oldest = savedSearches.at(-1);

  return (
    <section className="mx-auto max-w-[1500px] px-4 py-8 md:px-6 lg:py-10">
      <div className="rounded-[36px] border border-[#ead8c1] bg-[#fff5e8] p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Memória da busca</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Buscas salvas</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Guarde recortes do catálogo para retomar depois, compartilhar com cliente e transformar pesquisa longa em atalho comercial.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/catalogo" className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">
            Voltar ao catálogo
          </Link>
          {newest ? (
            <Link href={newest.url} className="rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700">
              Abrir último recorte
            </Link>
          ) : null}
          {newest ? <ShareButton url={newest.url} title={newest.label} text={newest.summary} /> : null}
          {savedSearchCount ? (
            <button
              type="button"
              onClick={clearSearches}
              className="inline-flex items-center gap-2 rounded-full border border-[#e5d4be] bg-white px-5 py-3 text-sm font-semibold text-slate-700"
            >
              <Trash2 className="h-4 w-4" />
              Limpar buscas
            </button>
          ) : null}
        </div>
      </div>

      {savedSearchCount ? (
        <>
          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            <StatCard label="Recortes salvos" value={String(savedSearchCount).padStart(2, "0")} helper="Atalhos guardados no navegador" />
            <StatCard label="Último salvo" value={formatSavedDate(newest?.createdAt)} helper={newest?.label || "—"} />
            <StatCard label="Primeiro salvo" value={formatSavedDate(oldest?.createdAt)} helper={oldest?.label || "—"} />
            <StatCard label="Uso ideal" value="Reabrir e compartilhar" helper="Mais útil para orçamento, revisão e recorrência" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {savedSearches.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-[#e8dac7] bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.07)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Busca salva</p>
                    <h2 className="mt-2 text-xl font-black text-slate-900">{item.label}</h2>
                  </div>
                  <Bookmark className="h-5 w-5 text-amber-500" />
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>
                <div className="mt-4 grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff8ef] px-3 py-2">
                    <Clock3 className="h-3.5 w-3.5" />
                    Salva em {formatSavedDate(item.createdAt)}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#fff8ef] px-3 py-2">
                    <Search className="h-3.5 w-3.5" />
                    Recorte pronto para reabrir
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={item.url} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    Abrir recorte
                  </Link>
                  <ShareButton url={item.url} title={item.label} text={item.summary} />
                  <CopyButton value={item.url} label="Copiar rota" />
                  <button
                    type="button"
                    onClick={() => removeSearch(item.id)}
                    className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Remover
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <InfoBlock
              icon={<Share2 className="h-4 w-4" />}
              title="Use recortes como briefing"
              description="Cada busca salva já preserva a intenção da navegação. É a forma mais rápida de retomar um contexto com cliente ou atendimento."
            />
            <InfoBlock
              icon={<Copy className="h-4 w-4" />}
              title="Copie a rota quando quiser alinhar"
              description="Ao copiar a rota, você mantém filtros e termos da pesquisa sem depender de print ou descrição solta."
            />
            <InfoBlock
              icon={<Bookmark className="h-4 w-4" />}
              title="Salve menos, mas salve melhor"
              description="Buscas fortes costumam virar atalhos de venda recorrente, coleção específica, faixa de preço ou estilo de presente."
            />
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-[30px] border border-[#e8dac7] bg-white p-10 text-center">
          <Search className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-4 text-lg font-semibold text-slate-900">Nenhuma busca salva ainda.</p>
          <p className="mt-2 text-sm text-slate-600">No catálogo, você pode salvar recortes completos para reabrir depois com um clique.</p>
        </div>
      )}
    </section>
  );
}

function formatSavedDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR");
}


function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{helper}</p>
    </div>
  );
}

function InfoBlock({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-[28px] border border-[#e8dac7] bg-white p-5">
      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {icon}
        Busca salva
      </p>
      <p className="mt-2 text-lg font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
  );
}
