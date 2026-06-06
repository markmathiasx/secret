import type { Metadata } from "next";
import { Clock, Instagram, Mail, MessageCircleMore, PackageSearch, ShieldCheck, Truck } from "lucide-react";
import { MDHSupportChat } from "@/components/support/MDHSupportChat";
import { brand, socialLinks, whatsappNumber, supportEmail } from "@/lib/constants";
import { buildSupportCatalogIndex, getSupportCatalogStats } from "@/lib/support/catalog-support-index";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Central de Atendimento MDH 3D",
  description: "Atendimento MDH 3D com bot treinado pelo catálogo real, WhatsApp, rastreio, trocas, orçamento e suporte humano.",
};

const contactCards = [
  {
    title: "WhatsApp correto",
    value: `+${whatsappNumber}`,
    detail: "Atendimento humano para fechamento, orçamento e pedido.",
    icon: MessageCircleMore,
    href: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Oi! Vim pela Central de Atendimento da MDH 3D.")}`,
  },
  {
    title: "Instagram oficial",
    value: `@${brand.instagramHandle}`,
    detail: "Canal social oficial para acompanhar novidades e falar com a MDH 3D.",
    icon: Instagram,
    href: socialLinks.instagram,
  },
  {
    title: "E-mail",
    value: supportEmail,
    detail: "Use para solicitações com arquivos, histórico ou documentação.",
    icon: Mail,
    href: `mailto:${supportEmail}`,
  },
  {
    title: "Prazo",
    value: "por produto",
    detail: "Cada item exibe janela de produção e status no catálogo.",
    icon: Clock,
    href: "/catalogo",
  },
  {
    title: "Pedido e rastreio",
    value: "com código",
    detail: "Informe pedido, e-mail ou rastreio para acompanhamento.",
    icon: PackageSearch,
    href: "/rastrear",
  },
] as const;

export default function AtendimentoPage() {
  const supportCatalog = buildSupportCatalogIndex();
  const stats = getSupportCatalogStats();
  const starterProducts = supportCatalog
    .slice()
    .sort((a, b) => a.pricePix - b.pricePix)
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-[#071019] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0))] px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/75">Suporte comercial e pós-venda</p>
              <h1 className="mt-3 text-4xl font-black leading-tight text-white md:text-5xl">Central de Atendimento MDH 3D</h1>
              <p className="mt-4 text-base leading-7 text-white/68">
                Atendimento com catálogo real, busca de produtos, preço Pix, cartão, prazo, material, orçamento personalizado, rastreio, trocas e suporte humano.
              </p>
            </div>
            <div className="grid gap-2 rounded-[8px] border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
              <span className="inline-flex items-center gap-2 font-bold">
                <ShieldCheck className="h-4 w-4" />
                {stats.products} produtos indexados
              </span>
              <span className="text-white/65">Cartão sempre Pix + R$ 1,00.</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {contactCards.map((card) => {
              const Icon = card.icon;
              return (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.href.startsWith("http") || card.href.startsWith("mailto:") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                  className="rounded-[8px] border border-white/10 bg-white/[0.055] p-4 transition hover:border-cyan-300/25 hover:bg-white/[0.075]"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-[8px] border border-white/10 bg-black/20 p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{card.title}</p>
                      <p className="text-sm text-cyan-100">{card.value}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/58">{card.detail}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <MDHSupportChat
            initialProducts={starterProducts}
            whatsappNumber={whatsappNumber}
            supportEmail={supportEmail}
            productCount={stats.products}
          />
        </div>
      </section>

      <section className="border-t border-white/10 px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <Truck className="h-5 w-5 text-cyan-100" />
            <h2 className="mt-3 text-lg font-bold">Envio e produção</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Prazo varia por produto, material, fila e acabamento. Confirme urgência antes de fechar.</p>
          </article>
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <MessageCircleMore className="h-5 w-5 text-emerald-100" />
            <h2 className="mt-3 text-lg font-bold">Humano quando precisar</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">O bot orienta e separa produtos; a equipe assume orçamento, pagamento assistido e casos sensíveis.</p>
          </article>
          <article className="rounded-[8px] border border-white/10 bg-white/[0.045] p-5">
            <ShieldCheck className="h-5 w-5 text-cyan-100" />
            <h2 className="mt-3 text-lg font-bold">Confidencialidade</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">Não informe dados de cartão no chat. Use checkout e canais oficiais da MDH 3D.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
