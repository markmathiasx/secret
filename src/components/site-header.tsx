import Link from 'next/link';
import { Instagram, Search, ShoppingBag } from 'lucide-react';
import { brand, socialLinks, whatsappNumber } from '@/lib/constants';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/checkout', label: 'Compra rápida' },
  { href: '/entregas', label: 'Entrega RJ' },
  { href: '/faq', label: 'FAQ' },
  { href: '/divulgacao', label: 'Conteúdo' }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/76 backdrop-blur-2xl">
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/16 via-violet-400/12 to-emerald-400/12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
          <span>Loja oficial MDH 3D</span>
          <span className="hidden md:inline">Produção local • acabamento premium • WhatsApp humano</span>
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-cyan-100 transition hover:text-white">
            @{brand.instagramHandle}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo-mdh.jpg" alt="Logo MDH 3D" className="h-12 w-12 rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(103,232,249,0.15)]" />
          <div>
            <p className="text-lg font-semibold tracking-[0.18em] text-white">MDH 3D</p>
            <p className="text-xs text-white/55">Impressão 3D premium para presentes, setup e personalizados</p>
          </div>
        </Link>

        <form action="/catalogo" className="hidden min-w-[320px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 lg:flex lg:max-w-xl">
          <Search className="h-4 w-4 text-white/45" />
          <input
            type="search"
            name="q"
            placeholder="Busque por geek, anime, suporte, vaso, nome 3D..."
            className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          <button type="submit" className="btn-slide ml-3">
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-glass">
            Entrar
          </Link>
          <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap hidden sm:inline-flex">
            WhatsApp
          </a>
          <Link href="/checkout" className="btn-gradient">
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 sm:px-6">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} className="chip-nav whitespace-nowrap">
            {link.label}
          </Link>
        ))}
        <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="chip-nav ml-auto hidden md:inline-flex">
          <Instagram className="h-4 w-4" /> Instagram
        </a>
      </nav>
    </header>
  );
}
