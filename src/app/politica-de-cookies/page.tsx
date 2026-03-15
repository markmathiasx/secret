import type { Metadata } from "next";
import { buildPageMetadata, getBreadcrumbStructuredData, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Politica de cookies",
  description:
    "Entenda quais cookies a MDH 3D utiliza para sessao, autenticacao, seguranca, carrinho e medicao da experiencia.",
  path: "/politica-de-cookies"
});

export default function Page() {
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Politica de cookies", item: `${getSiteUrl()}/politica-de-cookies` }
  ]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Politica de cookies</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>
          A MDH 3D usa cookies estritamente necessarios para sessao, autenticacao, seguranca, carrinho,
          acompanhamento de pedido e medicao basica da experiencia. Cookies de autenticacao usam `HttpOnly`,
          `Secure` quando aplicavel e `SameSite=Strict`.
        </p>
        <p className="mt-4">
          Se analytics externo estiver habilitado, eventos de navegacao podem ser enviados de forma agregada para
          melhoria da loja. O cliente pode solicitar revisao ou exclusao de dados pessoais pelos canais oficiais de
          atendimento.
        </p>
      </div>
    </section>
  );
}
