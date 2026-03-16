"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown, Zap, Star, Users, Award } from "lucide-react";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6 py-20">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Cyber Grid */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(3, 233, 244, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(3, 233, 244, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'scanLines 20s linear infinite',
          }}
        />

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-glow rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-violet-500/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center max-w-5xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Status Badge */}
        <div className="mb-6 inline-flex items-center gap-2 glass-chip animate-fadeInDown">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs font-medium">Sistema Online - Produção Ativa</span>
        </div>

        {/* Kicker */}
        <div className="mb-6 animate-slideInLeft">
          <span className="section-kicker inline-flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Impressão 3D Profissional no Rio de Janeiro
          </span>
        </div>

        {/* Main Title */}
        <h1 className="section-title animate-glow mb-6">
          Transforme Ideias em
          <span className="block bg-gradient-to-r from-cyan-glow via-violet-400 to-cyan-glow bg-clip-text text-transparent animate-shimmer">
            Realidade 3D
          </span>
        </h1>

        {/* Description */}
        <p className="section-copy mb-8 animate-fadeInUp max-w-3xl mx-auto">
          Da prototipagem rápida à produção em série, oferecemos impressão 3D de alta precisão com PLA Premium, Resina Fotopolímero e Nylon. Atendimento personalizado, entrega rápida e garantia de qualidade em todas as peças.
        </p>

        {/* Trust Signals */}
        <div className="flex flex-wrap justify-center gap-6 mb-10 animate-slideInRight">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>500+ Projetos Entregues</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Users className="w-4 h-4 text-cyan-glow" />
            <span>99% Satisfação Cliente</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Award className="w-4 h-4 text-violet-400" />
            <span>Qualidade Garantida</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-bounce">
          <Link
            href="/imagem-para-impressao-3d"
            className="btn-primary group"
          >
            <Zap className="w-5 h-5 group-hover:animate-pulse" />
            Enviar Arquivo STL Agora
          </Link>

          <a
            href="https://wa.me/5521920137249?text=Oi%20MDH%203D!%20Quero%20saber%20mais%20sobre%20seus%20serviços."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp group"
          >
            <svg className="w-5 h-5 group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
            Falar no WhatsApp
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/50 mx-auto" />
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="glass-panel px-6 py-3 animate-slideInLeft">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-cyber-pulse" />
              <span className="text-white/70">Produção Ativa</span>
            </div>
            <div className="text-white/50">|</div>
            <div className="text-white/70">24h Resposta</div>
            <div className="text-white/50">|</div>
            <div className="text-white/70">Rio de Janeiro</div>
          </div>
        </div>
      </div>
    </section>
  );
}
