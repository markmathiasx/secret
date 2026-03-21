"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Instagram, Mail, MapPin, MessageCircleMore } from "lucide-react";
import { brand, footerLinks, socialLinks, supportEmail, whatsappNumber } from "@/lib/constants";

const quickWhatsAppLinks = [
  { label: "Comprar catálogo", text: "Oi! Quero fechar um item do catálogo da MDH 3D." },
  { label: "Peça personalizada", text: "Oi! Quero pedir uma peça personalizada na MDH 3D." },
  { label: "Brindes e lotes", text: "Oi! Quero orçamento para brindes ou lote personalizado." },
  { label: "Tirar dúvidas", text: "Oi! Quero tirar dúvidas sobre material, prazo e acabamento." },
];

export function SiteFooter() {
  return (
    <footer className="footer-ambient border-t border-white/10 bg-slate-950/90">
      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <Image
            src="/logo-mdh.jpg"
            alt="Logo MDH 3D"
            width={64}
            height={64}
            className="mb-4 rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(103,232,249,0.15)]"
          />
          <p className="section-kicker">{brand.name}</p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            Impressão 3D com apresentação profissional, produção local e atendimento direto.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
            Trabalhamos com presentes personalizados, miniaturas, utilidades e projetos sob medida para clientes do Rio de Janeiro e de outras regiões do Brasil.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={`https://wa.me/${whatsappNumber}`} className="btn-whatsapp gap-2">
              <MessageCircleMore className="h-4 w-4" />
              Atendimento no WhatsApp
            </a>
            <Link href="/catalogo" className="btn-secondary gap-2">
              Ver catálogo
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              Portfólio com fotos reais
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
              Pix visível no checkout
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
              Produção local no RJ
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Institucional</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-cyan-glow">
                {item.label}
              </Link>
            ))}
            <Link href="/faq" className="transition hover:text-cyan-glow">
              Perguntas frequentes
            </Link>
            <Link href="/divulgacao" className="transition hover:text-cyan-glow">
              Portfólio e conteúdo
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Jornada de compra</p>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <Link href="/catalogo" className="transition hover:text-cyan-glow">
              Escolher um produto
            </Link>
            <Link href="/presentes-3d" className="transition hover:text-cyan-glow">
              Presentes 3D
            </Link>
            <Link href="/setup-e-organizacao-3d" className="transition hover:text-cyan-glow">
              Setup e organização
            </Link>
            <Link href="/brindes-personalizados-3d" className="transition hover:text-cyan-glow">
              Brindes e lotes
            </Link>
            <Link href="/checkout" className="transition hover:text-cyan-glow">
              Fechar pedido
            </Link>
            <Link href="/imagem-para-impressao-3d" className="transition hover:text-cyan-glow">
              Enviar referência ou STL
            </Link>
            <Link href="/conta" className="transition hover:text-cyan-glow">
              Acompanhar conta e pedidos
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">Contato</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {quickWhatsAppLinks.map((item) => (
              <a
                key={item.label}
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(item.text)}`}
                className="btn-glass justify-center px-4 py-3 text-center text-xs"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-4 text-sm text-white/70">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 transition hover:border-emerald-300/30"
            >
              <MessageCircleMore className="mt-0.5 h-4 w-4 text-emerald-200" />
              <span>Atendimento humano para orçamento, personalização e pós-venda.</span>
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 transition hover:border-cyan-300/30"
            >
              <Mail className="mt-0.5 h-4 w-4 text-cyan-100" />
              <span>{supportEmail}</span>
            </a>
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 transition hover:border-pink-300/30"
            >
              <Instagram className="mt-0.5 h-4 w-4 text-pink-200" />
              <span>@{brand.instagramHandle}</span>
            </a>
            <div className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4">
              <MapPin className="mt-0.5 h-4 w-4 text-white/80" />
              <span>Produção local no Rio de Janeiro com resposta em horário comercial.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <span>© 2026 {brand.name}. Todos os direitos reservados.</span>
          <span className="flex items-center gap-2">
            <span className="rounded-full border border-cyan-400/30 bg-cyan-400/14 px-3 py-1 text-xs text-cyan-100">Produção local</span>
            <span className="rounded-full border border-green-400/30 bg-green-400/14 px-3 py-1 text-xs text-green-100">Pix visível</span>
            <span className="rounded-full border border-violet-400/30 bg-violet-400/14 px-3 py-1 text-xs text-violet-100">Catálogo curado</span>
          </span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="btn-ghost-sm">
            Voltar ao topo
          </button>
        </div>
      </div>
    </footer>
  );
}
