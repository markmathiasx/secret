"use client";

import { Reveal } from "@/components/reveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Lucas M.",
    location: "Niterói, RJ",
    text: "Encomendei um Goku chibi como presente de aniversário. O acabamento estava impecável e chegou antes do prazo. Já voltei pra comprar mais.",
    rating: 5,
    product: "Goku Chibi Premium",
  },
  {
    name: "Carla S.",
    location: "Rio de Janeiro, RJ",
    text: "Precisava de 20 chaveiros personalizados para um evento corporativo. Atendimento rápido no WhatsApp, preço justo e qualidade surreal.",
    rating: 5,
    product: "Chaveiros Personalizados",
  },
  {
    name: "Rafael P.",
    location: "São Gonçalo, RJ",
    text: "O suporte para fone que comprei é muito bem feito. Parece produto industrializado. Parabéns pelo trabalho.",
    rating: 5,
    product: "Suporte para Fone",
  },
];

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
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center mb-10">
        <p className="section-kicker">O que dizem nossos clientes</p>
        <h2 className="section-title mx-auto">Confiança construída peça a peça.</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.name} direction="up" delay={i * 150}>
            <div className="testimonial-card h-full">
              <Stars count={t.rating} />
              <p className="mt-4 text-sm leading-7 text-white/75">{t.text}</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-sm font-bold text-cyan-100">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/50">{t.location}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-cyan-200/60">Comprou: {t.product}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
