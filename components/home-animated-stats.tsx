"use client";

import { AnimatedCounter } from "@/components/animated-counter";
import { Reveal } from "@/components/reveal";
import { Package, Star, Clock, MapPin } from "lucide-react";

export function HomeAnimatedStats({
  catalogCount,
  ratingLabel,
  reviewCount,
}: {
  catalogCount: number;
  ratingLabel: string;
  reviewCount?: number;
}) {
  return (
    <section className="border-y border-white/[0.08] bg-black/20 py-6">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
          <Reveal direction="up" delay={0}>
            <div className="stat-card text-center">
              <Package className="mx-auto h-5 w-5 text-cyan-300/60 mb-2" />
              <p className="text-2xl font-black text-white">
                <AnimatedCounter end={catalogCount} />
              </p>
              <p className="mt-1 text-xs text-white/50">peças no catálogo</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={100}>
            <div className="stat-card text-center">
              <Star className="mx-auto h-5 w-5 text-amber-300/60 mb-2" />
              <p className="text-2xl font-black text-white">{ratingLabel}</p>
              <p className="mt-1 text-xs text-white/50">
                {reviewCount ? `${reviewCount} avaliações aprovadas` : "avaliações reais"}
              </p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={200}>
            <div className="stat-card text-center">
              <Clock className="mx-auto h-5 w-5 text-emerald-300/60 mb-2" />
              <p className="text-2xl font-black text-white">2-5 dias</p>
              <p className="mt-1 text-xs text-white/50">prazo de entrega</p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={300}>
            <div className="stat-card text-center">
              <MapPin className="mx-auto h-5 w-5 text-violet-300/60 mb-2" />
              <p className="text-2xl font-black text-white">Rio de Janeiro</p>
              <p className="mt-1 text-xs text-white/50">produção local</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
