import { Reveal } from "@/components/reveal";
import { Star } from "lucide-react";
import { getLocalReviews } from "@/lib/mdh-store/social-proof";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  );
}

export function HomeTestimonials() {
  const testimonials = getLocalReviews().slice(0, 3);

  if (!testimonials.length) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[8px] border border-white/10 bg-white/[0.045] p-6">
          <p className="section-kicker">Depoimentos</p>
          <h2 className="mt-2 text-2xl font-black text-white">Avaliacoes publicas verificadas em validacao.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62">
            A home nao exibe frases inventadas. Quando houver avaliacoes aprovadas no arquivo local ou no banco, elas aparecem aqui.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center mb-10">
        <p className="section-kicker">Depoimentos reais</p>
        <h2 className="section-title mx-auto">Comentarios do arquivo local de avaliacoes, sem texto fabricado.</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={`${t.productSlug}-${t.author}-${t.createdAt}`} direction="up" delay={i * 150}>
            <div className="testimonial-card h-full">
              <Stars count={t.rating} />
              <p className="mt-4 text-sm leading-7 text-white/75">{t.comment}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-white/50">{t.verified ? "Compra verificada" : "Avaliacao local"}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-cyan-200/60">{t.title}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
