import { faqItems } from '@/lib/constants';
import { getSiteUrl } from '@/lib/env';

export const metadata = {
  title: 'FAQ | MDH 3D',
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
          <h1 className="mt-3 text-4xl font-black text-white">Perguntas frequentes para tirar dúvida rápido e vender melhor</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
            Respostas diretas sobre pedido, pagamento, produção, entrega e personalização para evitar atrito antes da compra.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.question} className="glass-panel p-6">
              <h2 className="text-xl font-semibold text-white">{item.question}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.answer}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 glass-panel p-6 text-sm leading-7 text-white/68">
          <p className="font-semibold text-white">Ainda precisa de ajuda?</p>
          <p className="mt-2">
            Se a dúvida for específica do seu projeto, pedido ou acabamento, fale pelo WhatsApp ou avance para o checkout em{' '}
            <a href={`${siteUrl}/checkout`} className="text-cyan-100 underline underline-offset-4">
              {siteUrl}/checkout
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
