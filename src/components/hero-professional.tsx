import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center overflow-hidden bg-black px-6 py-20">
      {/* Scan Effect Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(3, 233, 244, 0.03) 1px,
              rgba(3, 233, 244, 0.01) 2px,
              transparent 3px,
              transparent 4px
            )`,
            animation: "scanLines 8s linear infinite",
          }}
        />
        <div className="absolute inset-0 bg-hero-gradient opacity-50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl">
        {/* Kicker */}
        <div className="mb-4 inline-block">
          <span className="text-xs uppercase tracking-[0.24em] text-cyan-300/85">
            Transformação Digital 3D
          </span>
        </div>

        {/* Main Title - Glow Effect */}
        <h1
          className="text-5xl md:text-6xl font-black text-white mb-6 animate-glow"
          style={{
            textShadow: "0 0 20px rgba(3, 233, 244, 0.5), 0 0 40px rgba(3, 233, 244, 0.3)",
          }}
        >
          MDH 3D STORE
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-white/75 mb-10 leading-relaxed max-w-2xl mx-auto">
          Transforme seus arquivos STL, OBJ e 3MF em peças reais com alta precisão, qualidade profissional e entrega rápida. Desde prototipagem até peças funcionais.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          {/* Primary Button */}
          <Link
            href="/imagem-para-impressao-3d"
            className="btn-primary font-bold text-base px-8 py-4 uppercase tracking-wider"
          >
            📤 Enviar Arquivo STL
          </Link>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/5521920137249?text=Oi%20MDH%203D!%20Gostaria%20de%20um%20orçamento."
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp font-bold text-base px-8 py-4 uppercase tracking-wider"
          >
            💬 Falar no WhatsApp
          </a>
        </div>

        {/* Trust Signals */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center text-sm text-white/60">
          <span className="flex items-center gap-2">
            ✓ Localizado no Rio de Janeiro
          </span>
          <span className="flex items-center gap-2">
            ✓ Atendimento via WhatsApp
          </span>
          <span className="flex items-center gap-2">
            ✓ Pix com desconto
          </span>
        </div>
      </div>
    </section>
  );
}
