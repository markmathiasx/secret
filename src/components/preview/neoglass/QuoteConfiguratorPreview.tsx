"use client";

import { Cuboid, Layers3, MessageCircleMore, Palette, ShieldCheck } from "lucide-react";

export function QuoteConfiguratorPreview({ whatsappUrl }: { whatsappUrl: string }) {
  const steps = [
    { label: "Referência", value: "Imagem, STL ou ideia", icon: Cuboid },
    { label: "Material", value: "PLA, PETG ou resina", icon: Layers3 },
    { label: "Acabamento", value: "Fosco, silk ou premium", icon: Palette },
    { label: "Validação", value: "Atendimento humano", icon: ShieldCheck },
  ];

  return (
    <section className="neo-section neo-configurator" data-testid="neoglass-configurator">
      <div className="neo-section-heading">
        <p className="neo-eyebrow">3D Lab Configurator</p>
        <h2>Sob medida com briefing visual, sem upload real nesta prévia.</h2>
      </div>

      <div className="neo-config-grid">
        <div className="neo-config-steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="neo-config-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon aria-hidden="true" />
                <strong>{step.label}</strong>
                <small>{step.value}</small>
              </div>
            );
          })}
        </div>

        <aside className="neo-config-summary" aria-label="Resumo visual do orçamento">
          <p>Resumo do pedido</p>
          <h3>Projeto sob medida MDH3D</h3>
          <dl>
            <div>
              <dt>Entrada segura</dt>
              <dd>WhatsApp oficial</dd>
            </div>
            <div>
              <dt>Prazo estimado</dt>
              <dd>2 a 7 dias úteis</dd>
            </div>
            <div>
              <dt>Preço</dt>
              <dd>Definido após análise</dd>
            </div>
          </dl>
          <a className="neo-btn neo-btn-solid neo-btn-large" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircleMore aria-hidden="true" />
            Abrir orçamento
          </a>
        </aside>
      </div>
    </section>
  );
}
