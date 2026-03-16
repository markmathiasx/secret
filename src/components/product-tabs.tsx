'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const tabs: Tab[] = [
  {
    id: 'prototipagem',
    label: 'Prototipagem',
    icon: '🔹',
    title: '▸▸ PROTOTIPAGEM EM PLA ▸▸',
    description: 'Validação rápida de conceitos e designs. Ideal para maquetes, testes de encaixe e protótipos visuais com custo-benefício imbatível.',
    features: [
      'Material: PLA Premium',
      'Tempo de entrega: 24 a 48 horas',
      'Espessura de camada: 0.1mm a 0.3mm',
      'Cores disponíveis: 20+ opções',
      'Preenchimento: 20% a 100%',
      'Acabamento: Padrão FDM',
    ],
  },
  {
    id: 'resina',
    label: 'Resina',
    icon: '💎',
    title: '▸▸ ALTA RESOLUÇÃO (RESINA) ▸▸',
    description: 'Perfeito para miniaturas, joias e peças que exigem detalhes microscópicos sem as linhas de camada visíveis. Qualidade 4K e 8K.',
    features: [
      'Material: Resina Fotopolímero',
      'Tempo de entrega: 3 a 5 dias',
      'Resolução: 4K e 8K',
      'Espessura de camada: 0.03mm a 0.05mm',
      'Acabamento: Ultra liso',
      'Ideal para: Miniaturas, Joias, Dental',
    ],
  },
  {
    id: 'engenharia',
    label: 'Engenharia',
    icon: '⚙️',
    title: '▸▸ PEÇAS FUNCIONAIS (ENGENHARIA) ▸▸',
    description: 'Impressões que aguentam calor, impacto e uso contínuo. Ideal para suportes automotivos, peças de reposição e aplicações industriais.',
    features: [
      'Material: ABS, PETG, Nylon, Fibra de Carbono',
      'Tempo de entrega: 5 a 7 dias',
      'Resistência térmica: Até 100°C',
      'Resistência mecânica: Alta',
      'Pós-processamento: Disponível',
      'Ideal para: Peças automotivas, Suportes, Engrenagens',
    ],
  },
];

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState('prototipagem');
  const currentTab = tabs.find((t) => t.id === activeTab)!;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16">
      {/* Tab Navigation */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full font-bold uppercase tracking-wider transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-glow text-black shadow-glow-cyan'
                : 'border border-white/20 text-white/70 hover:border-cyan-glow/50 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fadeInUp">
        <div className="glass-panel p-8 md:p-12">
          {/* Left Border Accent */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-glow via-cyan-glow/50 to-transparent rounded-l-[32px]" />

          {/* Title */}
          <h3 className="text-3xl md:text-4xl font-black text-cyan-glow mb-4" style={{
            textShadow: '0 0 20px rgba(3, 233, 244, 0.4)',
          }}>
            {currentTab.title}
          </h3>

          {/* Description */}
          <p className="text-white/75 text-lg leading-relaxed mb-8">
            {currentTab.description}
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentTab.features.map((feature) => (
              <div
                key={feature}
                className="rounded-lg border-l-4 border-cyan-glow bg-black/50 px-4 py-3 text-white/80 hover:bg-black/70 transition-all hover:translate-x-2"
              >
                <span className="inline-block mr-2 text-cyan-glow">▶</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
