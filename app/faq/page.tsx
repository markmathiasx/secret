import Link from 'next/link';
import { FaqWorkbench } from '@/components/faq-workbench';
import { faqItems } from '@/lib/constants';
import { getSiteUrl } from '@/lib/env';

export const metadata = {
  title: 'Perguntas frequentes',
  description: 'Perguntas frequentes sobre pagamento, materiais, prazos, entrega e personalização na MDH 3D.'
};

export default function FaqPage() {
  const siteUrl = getSiteUrl();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="glass-panel p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">FAQ</p>
          <h1 className="mt-3 text-4xl font-black text-white">Perguntas frequentes para decidir com segurança</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
            Respostas diretas sobre pedido, pagamento, produção, entrega e personalização para evitar dúvida antes da compra.
          </p>
        </div>
        <div className="mt-8">
          <FaqWorkbench items={faqItems} />
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link href="/entregas" className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25">
            <p className="font-semibold text-white">Frete e prazo no RJ</p>
            <p className="mt-2">Abra a página de entregas para confirmar faixa local, prazo base e cálculo inicial.</p>
          </Link>
          <Link href="/imagem-para-impressao-3d" className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25">
            <p className="font-semibold text-white">Enviar referência</p>
            <p className="mt-2">Se a dúvida já virou projeto, o melhor caminho é mandar imagem, STL ou briefing.</p>
          </Link>
          <a href={`${siteUrl}/checkout`} className="glass-panel p-6 text-sm leading-7 text-white/68 transition hover:border-cyan-300/25">
            <p className="font-semibold text-white">Seguir para checkout</p>
            <p className="mt-2">Quando a resposta já foi suficiente, vale ir direto para produto, quantidade e pagamento.</p>
          </a>
        </div>
      </section>
    </>
  );
}
