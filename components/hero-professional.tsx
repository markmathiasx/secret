"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Zap, Star, Users, Award, Upload, ChevronDown } from "lucide-react";

export function Hero() {
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = [".stl", ".obj", ".3mf"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!allowed.includes(ext)) {
      alert("Arquivo inválido. Aceite apenas .stl, .obj, .3mf.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert("Arquivo excede 50MB.");
      return;
    }
    setSelectedFile(file.name);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black px-6 py-20">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="hero-video absolute inset-0 h-full w-full object-cover opacity-60"
          src="/assets/videos/hero-bg.mp4"
          poster="/assets/images/placeholders/hero-fallback.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        />
        {/* Scan Lines Animation */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(to bottom, rgba(3,233,244,.08), rgba(3,233,244,.08) 1px, transparent 1px, transparent 5px)",
            opacity: 0.22,
            animation: 'scan 9s linear infinite'
          }}
        />
        {/* Cyber Grid Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(3,233,244,0.1) 1px, transparent 1px),linear-gradient(90deg, rgba(3,233,244,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            animation: 'scanLines 20s linear infinite',
          }}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-glow/5 via-transparent to-violet-500/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        {/* Overlay for legibility */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 text-center max-w-5xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 glass-chip animate-fadeInDown">
          <span className="text-lg">📍</span>
          <span className="text-xs font-medium">Produção Local no Rio de Janeiro</span>
        </div>

        {/* Neon Title */}
        <h1
          className="section-title animate-glow mb-6 text-5xl md:text-7xl font-black text-cyan-glow"
          style={{
            textShadow: '0 0 14px #03e9f4, 0 0 34px #03e9f4, 0 0 54px #03e9f4',
            animation: 'neonGlow 2s ease-in-out infinite alternate'
          }}
        >
          MDH 3D STORE
        </h1>
        <p className="section-copy mb-8 animate-fadeInUp max-w-3xl mx-auto text-white/90 text-lg md:text-xl">
          Transforme seus arquivos STL em peças reais
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-bounce">
          <a
            href="https://wa.me/5521920137249?text=Oi! Vim pelo site da MDH 3D e quero um orçamento."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp group min-w-[180px] flex items-center justify-center gap-2 text-lg font-bold bg-green-500 hover:bg-green-600 text-black rounded-full shadow-lg animate-pulse"
            aria-label="Falar no WhatsApp"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/></svg>
            Falar no WhatsApp
          </a>
          <label className="btn-upload group min-w-[180px] flex items-center justify-center gap-2 text-lg font-bold bg-cyan-500 hover:bg-cyan-600 text-black rounded-full shadow-lg cursor-pointer animate-pulse">
            <Upload className="w-6 h-6" />
            Enviar Arquivo STL
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj,.3mf"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Enviar arquivo STL"
            />
          </label>
          {selectedFile && (
            <div className="mt-2 text-sm text-white/80 animate-fadeInUp">Arquivo selecionado: {selectedFile}</div>
          )}
        </div>

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

        {/* Scroll Indicator */}
        <div className="flex justify-center mt-8 animate-bounce">
          <ChevronDown className="w-8 h-8 text-cyan-glow" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes scanLines {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
        @keyframes neonGlow {
          from { text-shadow: 0 0 14px #03e9f4, 0 0 34px #03e9f4, 0 0 54px #03e9f4; }
          to { text-shadow: 0 0 20px #03e9f4, 0 0 40px #03e9f4, 0 0 60px #03e9f4; }
        }
      `}</style>
    </section>
  );
}
