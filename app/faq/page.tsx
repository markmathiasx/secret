import { faqItems } from '@/lib/constants';

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="glass-panel p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">FAQ</p>
        <h1 className="mt-3 text-4xl font-black text-white">Perguntas frequentes para tirar dúvida rápido e vender melhor</h1>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <article key={item.q} className="glass-panel p-6">
            <h2 className="text-xl font-semibold text-white">{item.q}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
