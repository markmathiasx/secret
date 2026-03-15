<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeaderClient } from "@/components/site-header-client";
import { getCurrentCustomerSession } from "@/lib/customer-auth";
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";
=======

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }
>>>>>>> theirs

function SiteHeaderFallback() {
  return (
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(16,185,129,0.16),rgba(34,211,238,0.16),rgba(251,191,36,0.16))]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/70 sm:px-6">
          <span>Loja oficial MDH 3D</span>
          <span className="hidden md:inline">Pix com melhor preço</span>
          <span className="hidden lg:inline">Presentes, setup e personalizados com atendimento rapido</span>
          <span className="text-cyan-100">Carregando loja</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-4 py-4 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="h-[50px] w-[50px] rounded-2xl border border-white/10 bg-white/10" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-[0.18em] text-white">MDH 3D</p>
              <p className="truncate text-xs text-white/55">presentes criativos, setup, decoracao e personalizados</p>
            </div>
          </Link>

          <div className="h-[52px] rounded-full border border-white/12 bg-white/5" />

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="h-[48px] w-[92px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[48px] w-[110px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[48px] w-[126px] rounded-full border border-emerald-400/25 bg-emerald-400/14" />
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
          </div>

<<<<<<< ours
        <div className="flex items-center justify-between gap-4 border-t border-white/10 py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <div className="h-[40px] w-[120px] rounded-full border border-cyan-400/18 bg-cyan-400/10" />
            <div className="h-[40px] w-[84px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[40px] w-[96px] rounded-full border border-white/10 bg-white/5" />
            <div className="h-[40px] w-[74px] rounded-full border border-white/10 bg-white/5" />
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/50">
              Curadoria MDH 3D
            </span>
          </div>
        </div>
      </div>
    </header>
=======
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
=======
          </div>

>>>>>>> theirs
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
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
  );
}

export async function SiteHeader() {
  const customerSession = await getCurrentCustomerSession();

  return (
    <Suspense fallback={<SiteHeaderFallback />}>
      <SiteHeaderClient
        customer={
          customerSession
            ? {
                fullName: customerSession.account.fullName,
                email: customerSession.account.email
              }
            : null
        }
      />
    </Suspense>
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
  );
}
