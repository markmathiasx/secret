"use client";

import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { brand, supportEmail, whatsappNumber } from "@/lib/constants";

const footerGroups = [
  {
    title: "Descoberta",
    links: [
      { label: "Catalogo completo", href: "/catalogo" },
      { label: "Comparador", href: "/comparar" },
      { label: "Favoritos", href: "/favoritos" },
      { label: "Recentes", href: "/recentes" },
      { label: "Buscas salvas", href: "/buscas-salvas" },
    ],
  },
  {
    title: "Compra assistida",
    links: [
      { label: "Compatibilidade A1 Mini", href: "/compatibilidade" },
      { label: "Configurador nozzle/hotend", href: "/configurador/nozzle-hotend" },
      { label: "Kits e bundles", href: "/kits" },
      { label: "Guias de instalação", href: "/guias" },
      { label: "Area B2B", href: "/b2b" },
    ],
  },
  {
    title: "Confiança e suporte",
    links: [
      { label: "Central de suporte", href: "/suporte" },
      { label: "Envio e frete", href: "/suporte/envio" },
      { label: "Trocas e devoluções", href: "/suporte/trocas-devolucoes" },
      { label: "Garantia", href: "/suporte/garantia" },
      { label: "Privacidade (LGPD)", href: "/politica-de-privacidade" },
      { label: "Termos de uso", href: "/termos" },
    ],
  },
];

const trustPills = [
  "Curadoria com prova visual explícita",
  "Checkout com Pix em destaque",
  "Atendimento humano no WhatsApp",
  "Memória local de navegação e busca",
];

export function SiteFooter() {
  const realPhotos = catalog.filter((item) => item.realPhoto).length;
  const readyCount = catalog.filter((item) => item.status === "Pronta entrega").length;
  const customCount = catalog.filter((item) => item.customizable).length;

  return (
    <footer className="border-t border-[#e7d8c3] bg-[#fff8ef]">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[32px] border border-[#ead8c1] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">MDH 3D marketplace</p>
              <h2 className="mt-3 text-2xl font-black text-slate-900">
                Vitrine com memória, filtros úteis e decisão comercial mais clara.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                Catálogo pensado para reduzir atrito entre descoberta, comparação, prova visual, retomada da busca e fechamento do pedido.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-700"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:${supportEmail}`}
                  className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 font-semibold text-slate-700"
                >
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

          <div className="mt-8 border-t border-[#e7d8c3] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Números úteis da vitrine</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-[#eadcc8] bg-[#fff8ef] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Fotos reais</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{String(realPhotos).padStart(2, "0")}</p>
              </div>
              <div className="rounded-[20px] border border-[#eadcc8] bg-[#fff8ef] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pronta entrega</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{String(readyCount).padStart(2, "0")}</p>
              </div>
              <div className="rounded-[20px] border border-[#eadcc8] bg-[#fff8ef] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Personalizáveis</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{String(customCount).padStart(2, "0")}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e7d8c3] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Atalhos úteis</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              <Link href="/catalogo?q=foto%20real" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 transition hover:bg-[#fff3e2]">
                Fotos reais
              </Link>
              <Link href="/catalogo?stock=ready" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 transition hover:bg-[#fff3e2]">
                Pronta entrega
              </Link>
              <Link href="/catalogo?favorites=1" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 transition hover:bg-[#fff3e2]">
                Só favoritos
              </Link>
              <Link href="/catalogo?q=articulado" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 transition hover:bg-[#fff3e2]">
                Articulados
              </Link>
              <Link href="/catalogo?q=chibi" className="rounded-full border border-[#e5d4be] bg-white px-4 py-2 transition hover:bg-[#fff3e2]">
                Chibi
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e7d8c3] pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Padrões da página</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trustPills.map((item) => (
                <span key={item} className="rounded-full bg-[#fff8ef] px-4 py-2 text-xs font-semibold text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#e7d8c3] px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <span>© 2026 {brand.name}. Todos os direitos reservados.</span>
          <span>Uso descritivo de marcas de terceiros apenas para compatibilidade. Não afiliado oficialmente, salvo contrato expresso.</span>
        </div>
      </div>
    </footer>
  );
}
