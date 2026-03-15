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
import { buildPageMetadata, getBreadcrumbStructuredData, getReturnPolicyPageStructuredData, getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Trocas e devolucoes",
  description:
    "Entenda como funcionam trocas, reembolso, retrabalho e devolucoes na MDH 3D para compras com mais seguranca.",
  path: "/trocas-e-devolucoes"
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
const policy = [
  "Defeitos de fabricação comprovados podem ser corrigidos ou refeitos.",
  "Danos no transporte local devem ser reportados com foto ou vídeo.",
  "Itens personalizados seguem análise técnica para retrabalho ou solução equivalente.",
  "Atendimento pós-venda é feito com prioridade para preservar a experiência do cliente."
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
  const returnPolicyLd = getReturnPolicyPageStructuredData();
  const breadcrumbLd = getBreadcrumbStructuredData([
    { name: "Inicio", item: getSiteUrl() },
    { name: "Trocas e devolucoes", item: `${getSiteUrl()}/trocas-e-devolucoes` }
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(returnPolicyLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
=======
    <section className="mx-auto max-w-5xl px-6 py-16">
>>>>>>> theirs
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Institucional</p>
      <h1 className="mt-3 text-4xl font-black text-white">Trocas e devoluções</h1>
      <div className="mt-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-base leading-8 text-white/72">
        <p>Nossa política prioriza solução ágil e justa para qualquer ocorrência após o recebimento da peça.</p>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          {policy.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
