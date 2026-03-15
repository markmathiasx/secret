"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, LogOut, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LoginModal } from "@/components/login-modal";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { supabaseBrowser } from "@/lib/supabase/browser";

type SessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string; name?: string };
} | null;

const links = [
  { href: "/", label: "Inicio" },
  { href: "/catalogo", label: "Catalogo" },
  { href: "/entregas", label: "Entrega RJ" },
  { href: "/faq", label: "FAQ" },
  { href: "/conta", label: "Minha conta" }
];

function isConfigured(url?: string) {
  return Boolean(url && url.startsWith("http"));
}

export function SiteHeader() {
  const [user, setUser] = useState<SessionUser>(null);
  const [openLogin, setOpenLogin] = useState(false);
  const whatsappHref = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
    []
  );

  useEffect(() => {
    if (!supabaseBrowser) return;

    supabaseBrowser.auth.getUser().then(({ data }) => {
      setUser((data.user || null) as SessionUser);
    });

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

  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "cliente";

  async function signOut() {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#040816]/82 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10">
                  <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={96} height={96} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-wide text-white">MDH 3D</p>
                  <p className="text-xs text-white/55">Storefront premium de impressao 3D</p>
                </div>
              </Link>

              <a
                href={whatsappHref}
                className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 lg:hidden"
              >
                Orcamento
              </a>
            </div>

            <nav className="flex flex-wrap gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              {isConfigured(socialLinks.instagram) ? (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 lg:inline-flex"
                >
                  Instagram
                </a>
              ) : null}

              {user ? (
                <>
                  <Link
                    href="/conta"
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Ola, {displayName}
                  </Link>
                  <Link
                    href="/conta#favoritos"
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                    aria-label="Ir para favoritos"
                  >
                    <Heart className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={signOut}
                    className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/80"
                    aria-label="Sair"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setOpenLogin(true)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    Entrar
                  </span>
                </button>
              )}

              <a
                href={whatsappHref}
                className="hidden rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 lg:inline-flex"
              >
                Pedir orcamento
              </a>
            </div>
          </div>
        </div>
      </header>

      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
    </>
  );
}
