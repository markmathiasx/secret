import Image from "next/image";
import Link from "next/link";
import { socialLinks, whatsappMessage, whatsappNumber } from "@/lib/constants";

const links = [
  { href: "/catalogo", label: "Catalogo" },
  { href: "/#categorias", label: "Categorias" },
  { href: "/#como-produzimos", label: "Producao" },
  { href: "/entregas", label: "Entregas" },
  { href: "/faq", label: "FAQ" },
  { href: "/conta", label: "Conta" }
];

export function SiteHeader() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(3,7,18,0.72)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={48} height={48} className="rounded-2xl border border-white/10" />
            <div>
              <p className="text-lg font-semibold tracking-wide text-white">MDH 3D</p>
              <p className="text-xs text-white/55">Impressao 3D sob medida • Rio de Janeiro</p>
            </div>
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="text-sm font-semibold text-white/70 transition hover:text-white">
              Instagram
            </a>
            <Link href="/login" className="text-sm font-semibold text-white/70 transition hover:text-white">
              Entrar
            </Link>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/18"
            >
              Pedir orcamento
            </a>
          </div>
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/72 transition hover:border-white/20 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-full border border-cyan-300/30 bg-cyan-300/12 px-4 py-2 text-sm font-semibold text-cyan-50 lg:hidden"
          >
            Orcamento
          </a>
        </nav>
      </div>
    </header>
  );
}
