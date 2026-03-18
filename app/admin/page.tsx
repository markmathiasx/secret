import { Package, Wallet, Clock3, AlertCircle, Factory, CheckCircle2, Truck, Ban, NotebookTabs } from "lucide-react";

const cards = [
  ["Total de pedidos", "Acompanhe o volume total", Package],
  ["Total vendido", "Resumo financeiro do período", Wallet],
  ["Pedidos do dia", "Operação ativa hoje", Clock3],
  ["Pendentes", "Itens aguardando ação", AlertCircle],
  ["Em produção", "Fila de fabricação", Factory],
  ["Finalizados", "Pedidos prontos", CheckCircle2],
  ["Entregues", "Operação concluída", Truck],
  ["Cancelados", "Ocorrências encerradas", Ban],
] as const;

const channels = ["WhatsApp", "Instagram", "Shopee", "Mercado Livre", "Amazon", "Americanas"];

export default function AdminHome() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-8 shadow-[0_24px_80px_rgba(2,8,23,0.26)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">Painel operacional</p>
        <h1 className="mt-3 text-4xl font-black text-white">Admin MDH 3D</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Dashboard consolidado para acompanhar pedidos, pagamento, produção e canais externos. Use esta página como hub do vendedor até concluir a integração total com banco e sessões persistentes.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([title, subtitle, Icon]) => (
            <article key={title} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="mt-2 text-xs text-white/45">{subtitle}</p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 p-3 text-cyan-100"><Icon className="h-5 w-5" /></div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
            <div className="flex items-center gap-3 text-cyan-100"><NotebookTabs className="h-5 w-5" />Cadastro manual por canal</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {channels.map((channel) => (
                <span key={channel} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/75">{channel}</span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-white/60">O próximo passo operacional é conectar este painel ao fluxo real de pedidos, timeline, notas internas e edição de status de pagamento.</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-black/20 p-6">
            <p className="text-sm font-semibold text-white">Checklist rápido</p>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li>• Validar ADMIN_EMAIL, ADMIN_PASSWORD_HASH e ADMIN_SESSION_SECRET</li>
              <li>• Conferir tabela quote_requests / quotes no Supabase</li>
              <li>• Garantir que o login admin grave cookie seguro</li>
              <li>• Revisar status operacional e origem dos pedidos</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
