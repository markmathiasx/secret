"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { brand, footerLinks, socialLinks, supportEmail, whatsappNumber } from '@/lib/constants';

export function SiteFooter() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <footer className={`footer-ambient border-t border-white/10 bg-slate-950/90 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4 grid-cols-1">
        {/* Logo + Descrição */}
        <div className="animate-fadeInUp">
          <Image src="/assets/images/logo-mdh.png" alt="Logo MDH 3D Store" width={64} height={64} className="mb-4 rounded-full shadow-cyan hover:scale-110 transition-transform duration-300" />
          <p className="section-kicker">{brand.name}</p>
          <h2 className="mt-3 text-2xl font-bold text-white hover:text-cyan-glow transition-colors duration-300">Impressão 3D premium para presentes, decoração, utilidades e projetos sob encomenda.</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
            Produção local no Rio de Janeiro com atendimento humano, WhatsApp direto e operação pensada para fechar pedidos com clareza.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap hover:scale-105 transition-transform duration-300">WhatsApp direto</a>
            <Link href="/catalogo" className="btn-glass hover:scale-105 transition-transform duration-300">Abrir catálogo</Link>
          </div>
        </div>
        {/* Links institucionais */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Institucional</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {footerLinks.map((item, index) => (
              <Link key={item.href} href={item.href} className="transition hover:text-cyan-glow hover:translate-x-2 duration-300" style={{ animationDelay: `${0.1 + index * 0.05}s` }}>{item.label}</Link>
            ))}
          </div>
        </div>
        {/* Atendimento */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Atendimento</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <a href={`https://wa.me/${whatsappNumber}`} className="transition hover:text-green-400 hover:translate-x-2 duration-300">WhatsApp com atendimento humano</a>
            <a href={`mailto:${supportEmail}`} className="transition hover:text-cyan-glow hover:translate-x-2 duration-300">{supportEmail}</a>
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="transition hover:text-pink-400 hover:translate-x-2 duration-300">@{brand.instagramHandle}</a>
            <p className="hover:text-white transition-colors duration-300">Produção local e entrega no Rio de Janeiro - RJ</p>
          </div>
        </div>
        {/* WhatsApp shortcuts */}
        <div className="animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Atalhos WhatsApp</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <a href="https://wa.me/5521920137249?text=Quero%20fechar%20no%20Pix%20agora" className="button-primary rounded-full px-4 py-2 font-bold shadow-cyan hover:scale-105 transition-all duration-300" target="_blank" rel="noopener noreferrer">Quero fechar no Pix agora</a>
            <a href="https://wa.me/5521920137249?text=Quero%20pagar%20no%20cart%C3%A3o%20de%20cr%C3%A9dito" className="button-primary rounded-full px-4 py-2 font-bold shadow-cyan hover:scale-105 transition-all duration-300" target="_blank" rel="noopener noreferrer">Quero pagar no cartão</a>
            <a href="https://wa.me/5521920137249?text=Quero%20enviar%20refer%C3%AAncia%20para%20impress%C3%A3o%203D" className="button-primary rounded-full px-4 py-2 font-bold shadow-cyan hover:scale-105 transition-all duration-300" target="_blank" rel="noopener noreferrer">Quero enviar referência</a>
            <a href="https://wa.me/5521920137249?text=Quero%20ajuda%20para%20escolher%20um%20presente" className="button-primary rounded-full px-4 py-2 font-bold shadow-cyan hover:scale-105 transition-all duration-300" target="_blank" rel="noopener noreferrer">Quero ajuda para presente</a>
          </div>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="hover:text-white transition-colors duration-300">© 2026 {brand.name}. Todos os direitos reservados.</span>
          <span className="flex items-center gap-2">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/14 px-3 py-1 text-xs text-cyan-100 hover:bg-cyan-400/20 transition-colors duration-300">Produção Local</span>
            <span className="rounded-full border border-green-400/30 bg-green-400/14 px-3 py-1 text-xs text-green-100 hover:bg-green-400/20 transition-colors duration-300">Pix Direto</span>
            <span className="rounded-full border border-violet-400/30 bg-violet-400/14 px-3 py-1 text-xs text-violet-100 hover:bg-violet-400/20 transition-colors duration-300">Entrega RJ</span>
          </span>
          <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} className="button-secondary rounded-full px-4 py-2 text-xs font-bold hover:scale-105 transition-transform duration-300">Back to top</button>
        </div>
      </div>
    </footer>
  );
}
