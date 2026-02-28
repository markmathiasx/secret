import Image from "next/image";
import Link from "next/link";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";

const links = [
  { href: "/", label: "Início" },
  { href: "/catalogo", label: "Catálogo" },
  { href: "/entregas", label: "Frete" },
  { href: "/faq", label: "FAQ" },
  { href: "/divulgacao", label: "Divulgação" }
];

export function SiteHeader() {
  const href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-base/85 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={46} height={46} className="rounded-xl border border-white/10" />
            <div>
              <p className="text-lg font-semibold tracking-wide text-white">MDH 3D</p>
              <p className="text-xs text-white/55">Impressão 3D utilitária, gamer, anime e personalizada</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="hidden text-sm font-semibold text-cyan-200 transition hover:text-cyan-100 md:inline-flex">
              Instagram
            </a>
            <Link href="/login" className="hidden text-sm font-semibold text-white/80 transition hover:text-white md:inline-flex">
              Minha conta
            </Link>
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
          <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="whitespace-nowrap rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 md:hidden">
            Instagram
          </a>
        </nav>
      </div>
    </header>
  );
}
