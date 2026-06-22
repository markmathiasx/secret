"use client";

import { CheckCircle2, Database, Factory, Gauge, Globe2, RefreshCw, ShieldCheck, Store, WandSparkles } from "lucide-react";
import type { NeoGlassPreviewMetrics } from "@/src/components/preview/neoglass/types";

export function AdminCommandCenterPreview({ metrics }: { metrics: NeoGlassPreviewMetrics }) {
  const cards = [
    { label: "Produtos ativos", value: metrics.activeProducts, detail: "catálogo público", icon: Database },
    { label: "Smart store", value: metrics.smartStoreProducts, detail: "itens da loja", icon: Store },
    { label: "Meta feed", value: metrics.metaFeedValid, detail: "válidos", icon: Globe2 },
    { label: "Google feed", value: metrics.googleFeedItems, detail: "itens", icon: Gauge },
    { label: "Ignorados Meta", value: metrics.metaFeedSkipped, detail: "produtos", icon: ShieldCheck },
    { label: "Descrições genéricas", value: metrics.genericDescriptions, detail: "neutralizadas", icon: WandSparkles },
  ];

  const ops = [
    { title: "Product Master", body: "SKUs, imagens, disponibilidade e dados públicos sincronizados." },
    { title: "PriceOps", body: "Pix e cartão exibidos sem alterar regra de preço nesta prévia." },
    { title: "ChannelOps", body: "Site, feeds e canais secos organizados para publicação." },
    { title: "FeedOps", body: "Meta, Google e JSON monitorados por rotas públicas." },
    { title: "Backup/Rollback", body: "Mudança visual isolada em branch e preview público." },
  ];

  const channels = [
    ["Site", "Ativo", `${metrics.activeProducts} produtos`],
    ["Google Merchant", "Ativo", `${metrics.googleFeedItems} itens`],
    ["Meta Catalog", "Ativo", `${metrics.metaFeedValid} válidos`],
    ["Facebook Marketplace Package", "Preparado", "pacote visual"],
    ["Mercado Livre dry-run", "Simulação", "sem credencial real"],
    ["Shopee dry-run", "Simulação", "sem credencial real"],
    ["WhatsApp", "Ativo", "5521974137662"],
  ];

  return (
    <section className="neo-section neo-command" data-testid="neoglass-admin-command">
      <div className="neo-section-heading">
        <p className="neo-eyebrow">
          <Factory aria-hidden="true" />
          Admin Command Center
        </p>
        <h2>Score Commerce OS {metrics.scoreLabel} em modo preview.</h2>
      </div>

      <div className="neo-command-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="neo-command-card">
              <Icon aria-hidden="true" />
              <span>{card.label}</span>
              <strong>{card.value.toLocaleString("pt-BR")}</strong>
              <small>{card.detail}</small>
            </article>
          );
        })}
      </div>

      <div className="neo-ops-grid">
        {ops.map((item) => (
          <article key={item.title}>
            <CheckCircle2 aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="neo-channel-table" role="table" aria-label="Tabela de canais Commerce OS">
        <div role="row" className="neo-channel-head">
          <span role="columnheader">Canal</span>
          <span role="columnheader">Estado</span>
          <span role="columnheader">Observação</span>
        </div>
        {channels.map(([name, status, note]) => (
          <div key={name} role="row">
            <span role="cell">{name}</span>
            <span role="cell">
              <RefreshCw aria-hidden="true" />
              {status}
            </span>
            <span role="cell">{note}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
