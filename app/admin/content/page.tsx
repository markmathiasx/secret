import { redirect } from "next/navigation";
import { ContentPlaybook } from "@/components/content-playbook";
import { getContentWorkflowSnapshot, getContentWorkflowStageLabel } from "@/lib/content-workflow";
import { getServerSessionUser, isAdminSession } from "@/lib/server-session";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const user = await getServerSessionUser();
  if (!isAdminSession(user)) redirect("/admin/login");

  const snapshot = getContentWorkflowSnapshot();
  const stageOrder = ["brief", "review", "approved", "scheduled", "published"] as const;

  return (
    <section className="space-y-8">
      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(15,23,42,0.72))] p-6 shadow-[0_28px_80px_rgba(2,8,23,0.32)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Painel MDH 3D</p>
        <h1 className="mt-2 text-3xl font-black text-white">Publicacao e aprovacao de conteudo</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/60">
          O fluxo agora trata produto, landing e distribuicao como a mesma esteira: produto vira Reel, carrossel, Story, blog e FAQ sem perder CTA, prova e honestidade visual.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          { label: "Total na fila", value: snapshot.metrics.total },
          { label: "Brief", value: snapshot.metrics.brief },
          { label: "Em revisao", value: snapshot.metrics.review },
          { label: "Aprovados", value: snapshot.metrics.approved },
          { label: "Agendados", value: snapshot.metrics.scheduled },
        ].map((item) => (
          <div key={item.label} className="glass-card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 xl:grid-cols-5">
        {stageOrder.map((stage) => {
          const items = snapshot.items.filter((item) => item.stage === stage);
          return (
            <div key={stage} className="rounded-[28px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{getContentWorkflowStageLabel(stage)}</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">{items.length}</span>
              </div>
              <div className="mt-4 grid gap-3">
                {items.length ? (
                  items.map((item) => (
                    <article key={item.id} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">{item.sourceLabel}</p>
                      <h2 className="mt-2 text-lg font-bold text-white">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-white/65">{item.objective}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-white/45">Janela: {item.publishWindow}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/45">Dono: {item.owner}</p>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[20px] border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/45">
                    Nada nesta etapa.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        {snapshot.items.slice(0, 4).map((item) => (
          <div key={item.id} className="rounded-[30px] border border-white/10 bg-black/20 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">{item.sourceLabel}</p>
                <h2 className="mt-2 text-2xl font-black text-white">{item.title}</h2>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
                {getContentWorkflowStageLabel(item.stage)}
              </span>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/68">{item.objective}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {item.channels.map((channel) => (
                <div key={`${item.id}-${channel.channel}`} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/45">{channel.channel}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{channel.deliverable}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-100/75">{channel.status}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <ContentPlaybook angles={item.angles} />
            </div>

            <div className="mt-6 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">Checklist de aprovacao</p>
              <div className="mt-3 grid gap-2">
                {item.checklist.map((check) => (
                  <div key={check} className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/68">
                    {check}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}
