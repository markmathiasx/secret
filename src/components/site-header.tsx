"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, LogOut, UserRound } from "lucide-react";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { LoginModal } from "@/components/login-modal";

type SessionUser = { id: string; email?: string | null; user_metadata?: { full_name?: string; name?: string } } | null;

const links = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/entregas", label: "Entrega RJ" },
  { href: "/faq", label: "FAQ" },
  { href: "/divulgacao", label: "Conteúdo" }
];

export function SiteHeader() {
  const [user, setUser] = useState<SessionUser>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const href = useMemo(() => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, []);

  useEffect(() => {
    if (!supabaseBrowser) return;

    supabaseBrowser.auth.getUser().then(({ data }) => setUser(data.user as SessionUser));

    const {
      data: { subscription }
    } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user || null) as SessionUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function openModal() {
      setOpenLogin(true);
    }
    window.addEventListener("mdh:open-login", openModal);
    return () => window.removeEventListener("mdh:open-login", openModal);
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-base/85 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={46} height={46} className="rounded-xl border border-white/10" />
              <div>
                <p className="text-lg font-semibold tracking-wide text-white">MDH 3D</p>
                <p className="text-xs text-white/55">Loja oficial de impressão 3D premium</p>
              </div>
            </Link>

            <div className="flex items-center gap-2 md:gap-3">
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="hidden text-sm font-semibold text-cyan-200 transition hover:text-cyan-100 md:inline-flex">
                Instagram
              </a>
              <a href={socialLinks.tiktok} target="_blank" rel="noreferrer" className="hidden text-sm font-semibold text-violet-200 transition hover:text-violet-100 md:inline-flex">
                TikTok
              </a>

              {user ? (
                <div className="hidden items-center gap-2 md:flex">
                  <Link href="/conta" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white">
                    Olá, {displayName}
                  </Link>
                  <Link href="/conta#favoritos" className="rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-100">
                    <Heart className="h-4 w-4" />
                  </Link>
                  <button onClick={signOut} className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/80" aria-label="Sair">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button onClick={() => setOpenLogin(true)} className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white md:inline-flex">
                  <UserRound className="mr-2 h-4 w-4" /> Entrar
                </button>
              )}

              <a href={href} className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-300/15">
                Pedir orçamento
              </a>
            </div>
          </div>

          <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:text-white">
                {link.label}
              </Link>
            ))}
            <button onClick={() => setOpenLogin(true)} className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 md:hidden">
              Entrar
            </button>
          </nav>
        </div>
      </header>
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </>
  );
}
