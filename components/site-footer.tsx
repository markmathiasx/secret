"use client";

import Link from "next/link";
import { brand, supportEmail, whatsappNumber } from "@/lib/constants";

const footerGroups = [
  {
    title: "Catalogo tecnico",
    links: [
      { label: "Catalogo completo", href: "/catalogo" },
      { label: "Compatibilidade A1 Mini", href: "/compatibilidade" },
      { label: "Configurador nozzle/hotend", href: "/configurador/nozzle-hotend" },
      { label: "Comparar produtos", href: "/comparar" },
    ],
  },
  {
    title: "Conteudo e operacao",
    links: [
      { label: "Kits de manutencao", href: "/kits" },
      { label: "Guias de instalacao", href: "/guias" },
      { label: "Area B2B", href: "/b2b" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Suporte e compliance",
    links: [
      { label: "Central de suporte", href: "/suporte" },
      { label: "Envio e frete", href: "/suporte/envio" },
      { label: "Trocas e devolucoes", href: "/suporte/trocas-devolucoes" },
      { label: "Garantia", href: "/suporte/garantia" },
      { label: "Contato", href: "/suporte/contato" },
      { label: "Privacidade (LGPD)", href: "/politica-de-privacidade" },
      { label: "Termos de uso", href: "/termos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[#e7d8c3] bg-[#fff8ef]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MDH 3D marketplace</p>
            <h2 className="mt-3 text-2xl font-black text-slate-900">
              Pecas, upgrades e kits com foto real e compatibilidade verificada.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Operacao focada em A1 Mini com filtros tecnicos, comparador de itens e checkout nacional com Pix, cartao e boleto.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <a href={`https://wa.me/${whatsappNumber}`} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700">
                WhatsApp
              </a>
              <a href={`mailto:${supportEmail}`} className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 font-semibold text-slate-700">
                {supportEmail}
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{group.title}</p>
              <div className="mt-4 grid gap-3 text-sm">
                {group.links.map((item) => (
                  <Link key={item.href} href={item.href} className="text-slate-700 transition hover:text-slate-900">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[#e7d8c3] px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 {brand.name}. Todos os direitos reservados.</span>
          <span>Uso descritivo de marcas de terceiros apenas para compatibilidade. Nao afiliado oficialmente, salvo contrato expresso.</span>
        </div>
      </div>
    </footer>
  );
}

