<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import type { Metadata } from "next";
import { buildPageMetadata, getBreadcrumbStructuredData, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Politica de privacidade",
  description:
    "Saiba como a MDH 3D trata cadastro, pedidos, autenticacao, cookies e solicitacoes de dados pessoais nos termos da LGPD.",
  path: "/politica-de-privacidade"
});
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
const items = [
  "Coletamos dados mínimos para orçamento, produção, entrega e suporte.",
  "Dados de pagamento sensíveis são processados por provedores especializados.",
  "Dados de conta ficam protegidos por autenticação e políticas de acesso no banco.",
  "Você pode solicitar atualização ou remoção dos dados de contato quando desejar."
];
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

export default function Page() {
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Politica de privacidade", item: `${getSiteUrl()}/politica-de-privacidade` }
  ]);

  return (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    <section className="mx-auto max-w-4xl px-6 py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>
          A MDH 3D coleta apenas os dados necessarios para cadastro, atendimento, pagamento, entrega, suporte e
          cumprimento de obrigacoes legais. Informacoes de contato e endereco podem ser protegidas com criptografia
          aplicada pelo backend, e dados completos de cartao ou CVV nao sao armazenados na plataforma.
        </p>
        <p className="mt-4">
          Utilizamos cookies de sessao para manter login de cliente e admin, alem de registros de auditoria para
          seguranca operacional. Quando analytics externo estiver habilitado, ele sera tratado como camada adicional e
          nao como requisito para navegacao ou compra.
        </p>
        <p className="mt-4">
          Nos termos da LGPD, voce pode solicitar acesso, correcao, portabilidade, anonimização ou exclusao dos seus
          dados pessoais, respeitadas as bases legais de retencao de pedidos, pagamentos, antifraude e compliance.
          Solicitações podem ser feitas pelo canal oficial de atendimento da loja.
        </p>
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Política de privacidade</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
>>>>>>> theirs
        <p>A MDH 3D trata suas informações com foco em segurança, transparência e uso estritamente comercial para atendimento do pedido.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
      </div>
    </section>
  );
}
