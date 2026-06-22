"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import { primaryNavigationLinks } from "@/src/config/navigation";

export function NeoGlassHeaderPreview({ whatsappUrl, catalogUrl }: { whatsappUrl: string; catalogUrl: string }) {
  return (
    <header className="neo-header" data-testid="neoglass-header">
      <Link href="/" className="neo-brand" aria-label="Ir para a página inicial da MDH 3D">
        <Image src="/logo-mdh.jpg" alt="Logo MDH 3D" width={44} height={44} priority />
        <span>
          <strong>MDH3D</strong>
          <small>NeoGlass OS</small>
        </span>
      </Link>

      <nav className="neo-nav" aria-label="Menu preview NeoGlass">
        {primaryNavigationLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="neo-header-actions">
        <a className="neo-btn neo-btn-ghost" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircleMore aria-hidden="true" />
          Orçar no WhatsApp
        </a>
        <Link className="neo-btn neo-btn-solid" href={catalogUrl}>
          Ver catálogo
          <ArrowUpRight aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
