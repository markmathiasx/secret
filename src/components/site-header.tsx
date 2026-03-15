"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { categories } from "@/lib/catalog";
import { socialLinks } from "@/lib/constants";
import { useStore } from "@/components/store-provider";
import { buildWhatsAppHref } from "@/lib/storefront";

const links = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/entregas", label: "Frete" },
  { href: "/faq", label: "FAQ" },
  { href: "/divulgacao", label: "Divulgação" }
];

const notices = [
  "Frete RJ com cálculo por CEP",
  "Prazo médio de 24h a 4 dias",
  "Atendimento e fechamento por WhatsApp"
];

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useStore();

  const whatsappHref = buildWhatsAppHref("Oi! Vim pelo topo do site e quero ajuda para comprar.");

  function handleSearch(formData: FormData) {
    const query = String(formData.get("q") || "").trim();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    router.push(`/catalogo${params.size ? `?${params.toString()}` : ""}`);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050b16]/88 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-black/20">
        <div className="mx-auto grid max-w-7xl gap-2 px-6 py-2 text-center text-[11px] uppercase tracking-[0.22em] text-white/60 md:grid-cols-3">
          {notices.map((notice) => (
            <p key={notice}>{notice}</p>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="grid gap-4 xl:grid-cols-[auto_1fr_auto] xl:items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={46} height={46} className="rounded-xl border border-white/10" />
            <div>
              <p className="text-lg font-semibold tracking-wide text-white">MDH 3D</p>
              <p className="text-xs text-white/55">Loja de impressões 3D com compra rápida, CEP e WhatsApp</p>
            </div>
          </Link>

          <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
            <label className="text-sm text-white/70">
              <span className="sr-only">Categorias</span>
              <select
                defaultValue=""
                onChange={(event) => {
                  const value = event.target.value;
                  router.push(value ? `/catalogo?categoria=${encodeURIComponent(value)}` : "/catalogo");
                }}
                className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              >
                <option value="">Categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <form
              action={handleSearch}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"
            >
              <Search className="ml-1 h-4 w-4 text-white/45" />
              <input
                type="search"
                name="q"
                placeholder="Buscar projeto, tema ou categoria"
                className="flex-1 bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="submit"
                className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Buscar
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <Link
              href="/conta"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white"
            >
              <UserRound className="h-4 w-4" />
              Entrar / Minha conta
            </Link>

            <Link
              href="/carrinho"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Carrinho
              <span className="rounded-full bg-cyan-400 px-2 py-0.5 text-xs font-bold text-slate-950">
                {cartCount}
              </span>
            </Link>

            <a
              href={whatsappHref}
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-300/15"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                isActive(link.href)
                  ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                  : "border-white/10 bg-white/5 text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100"
          >
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}
