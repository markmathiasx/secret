"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Instagram, Search, ShoppingBag, Bot, User, LogOut } from 'lucide-react';
import { brand, socialLinks, whatsappNumber } from '@/lib/constants';
import { Modal } from './modal';
import { AuthModal } from './auth-modal';
import { useAuth } from './auth-context';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/checkout', label: 'Compra rápida' },
  { href: '/entregas', label: 'Entrega RJ' },
  { href: '/faq', label: 'FAQ' },
  { href: '/divulgacao', label: 'Conteúdo' }
];

export function SiteHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const { user, signOut } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 bg-slate-950/76 backdrop-blur-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className="border-b border-white/10 bg-gradient-to-r from-cyan-400/16 via-violet-400/12 to-emerald-400/12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
          <span className="animate-fadeInUp">Loja oficial MDH 3D</span>
          <span className="hidden md:inline animate-fadeInUp" style={{ animationDelay: '0.1s' }}>Produção local • acabamento premium • WhatsApp humano</span>
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-cyan-100 transition hover:text-cyan-glow hover:scale-105 duration-300 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            @{brand.instagramHandle}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3 group animate-fadeInUp">
          <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={48} height={48} className="rounded-2xl border border-white/10 object-cover shadow-[0_0_24px_rgba(103,232,249,0.15)] group-hover:scale-110 transition-transform duration-300" />
          <div>
            <p className="text-lg font-semibold tracking-[0.18em] text-white group-hover:text-cyan-glow transition-colors duration-300">MDH 3D</p>
            <p className="text-xs text-white/55 group-hover:text-white/70 transition-colors duration-300">Impressão 3D premium para presentes, setup e personalizados</p>
          </div>
        </Link>

        <form action="/catalogo" className="hidden min-w-[320px] flex-1 items-center rounded-full border border-white/10 bg-white/5 px-4 py-3 lg:flex lg:max-w-xl animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <Search className="h-4 w-4 text-white/45" />
          <input
            type="search"
            name="q"
            placeholder="Busque por geek, anime, suporte, vaso, nome 3D..."
            className="ml-3 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 focus:placeholder:text-white/50 transition-colors duration-300"
          />
          <button type="submit" className="btn-slide ml-3 hover:scale-105 transition-transform duration-300">
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          <button onClick={() => setIsAssistantOpen(true)} className="btn-glass hover:scale-105 transition-transform duration-300">
            <Bot className="h-4 w-4 mr-2" />
            Assistente MDH
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">
                Olá, {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
              <button
                onClick={signOut}
                className="btn-glass hover:scale-105 transition-transform duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-glass hover:scale-105 transition-transform duration-300"
            >
              <User className="h-4 w-4 mr-2" />
              Entrar
            </button>
          )}
          <a href={`https://wa.me/${whatsappNumber}`} className="btn-zap hidden sm:inline-flex hover:scale-105 transition-transform duration-300">
            WhatsApp
          </a>
          <Link href="/checkout" className="btn-gradient hover:scale-105 transition-transform duration-300">
            <ShoppingBag className="h-4 w-4" />
            Comprar
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-4 sm:px-6 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
        {navLinks.map((link, index) => (
          <Link key={link.href} href={link.href} className="chip-nav whitespace-nowrap hover:scale-105 transition-transform duration-300" style={{ animationDelay: `${0.4 + index * 0.05}s` }}>
            {link.label}
          </Link>
        ))}
        <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="chip-nav ml-auto hidden md:inline-flex hover:scale-105 transition-transform duration-300" style={{ animationDelay: '0.6s' }}>
          <Instagram className="h-4 w-4" /> Instagram
        </a>
      </nav>

      <Modal isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} title="Assistente MDH Menor">
        <div className="p-6">
          <p className="mb-4 text-gray-600">Selecione o tamanho do seu assistente:</p>
          <div className="grid grid-cols-2 gap-4">
            {['Pequeno', 'Médio', 'Grande', 'Extra Grande'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          {selectedSize && (
            <p className="mt-4 text-green-600">Tamanho selecionado: {selectedSize}</p>
          )}
        </div>
      </Modal>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
