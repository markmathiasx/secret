'use client';

import { useState } from 'react';
import { Zap, Gem, Cog, ArrowRight } from 'lucide-react';
import { whatsappNumber } from '@/lib/constants';

interface Tab {
  id: string;
  label: string | React.ReactNode;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
}

const tabs: Tab[] = [
  {
    id: 'prototipagem',
    label: 'Prototipagem',
    icon: <Zap className="w-6 h-6" />,
    title: 'PROTOTIPAGEM RÁPIDA',
    description:
      'Peças piloto, apresentação de produto e aprovação visual com produção ágil. Ideal para ganhar velocidade sem abrir mão de leitura limpa e acabamento profissional.',
    color: 'text-cyan-glow',
    bgColor: 'from-cyan-glow/10 to-cyan-glow/5',
    features: [
      'Material: PLA Premium',
      'Entrega: 24 a 48 horas',
      'Resolução: 0.1mm a 0.3mm',
      'Cores: 20+ opções',
      'Preenchimento: 20% a 100%',
      'Acabamento: FDM profissional',
    ],
  },
  {
    id: 'resina',
    label: 'Resina',
    icon: <Gem className="w-6 h-6" />,
    title: 'ALTA RESOLUÇÃO',
    description:
      'Perfeito para miniaturas, bustos e peças que exigem acabamento mais fino, com foco em detalhe visual e apresentação.',
    color: 'text-violet-400',
    bgColor: 'from-violet-500/10 to-violet-500/5',
    features: [
      'Material: Resina Fotopolímero',
      'Entrega: 3 a 5 dias',
      'Resolução: 4K e 8K',
      'Precisão: 0.03mm a 0.05mm',
      'Acabamento: Ultra liso',
      'Aplicações: Miniaturas, bustos e peças detalhadas',
    ],
  },
  {
    id: 'engenharia',
    label: 'Engenharia',
    icon: <Cog className="w-6 h-6" />,
    title: 'PEÇAS FUNCIONAIS',
    description:
      'Impressões voltadas para uso funcional, organização, suporte de bancada e peças técnicas produzidas conforme aplicação e necessidade real.',
    color: 'text-green-400',
    bgColor: 'from-green-500/10 to-green-500/5',
    features: [
      'Material: Nylon, ABS, PETG',
      'Entrega: 5 a 7 dias',
      'Resistência: Alta durabilidade',
      'Temperatura: Até 100°C',
      'Aplicações: Suportes, organização e peças técnicas',
      'Acabamento: Sob medida para uso funcional',
    ],
  },
];

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    if (e.key === 'ArrowRight') {
      setActiveTab((idx + 1) % tabs.length);
    } else if (e.key === 'ArrowLeft') {
      setActiveTab((idx - 1 + tabs.length) % tabs.length);
    }
  };

  return (
    <section
      className="animate-fadeInUp transition-all duration-1000"
      aria-label="Serviços MDH 3D"
    >
      <nav className="tabs flex flex-wrap justify-center gap-3 mb-8" role="tablist">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            className={`tab-button relative overflow-hidden animate-fadeInUp ${activeTab === idx ? 'active' : ''}`}
            role="tab"
            aria-selected={activeTab === idx}
            aria-controls={`service-pane-${tab.id}`}
            tabIndex={activeTab === idx ? 0 : -1}
            onClick={() => setActiveTab(idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            style={{ animationDelay: `${idx * 0.2}s` }}
          >
            <span className="mr-2">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="absolute inset-0 pointer-events-none shine-gradient animate-shine" />
          </button>
        ))}
      </nav>

      <div className="service-pane-wrapper">
        {tabs.map((tab, idx) => (
          <div
            key={tab.id}
            id={`service-pane-${tab.id}`}
            className={`service-pane animate-fadeInUp ${activeTab === idx ? 'active' : ''}`}
            role="tabpanel"
            aria-labelledby={tab.id}
            style={{
              display: activeTab === idx ? 'grid' : 'none',
              animation: activeTab === idx ? 'fadeInUp 0.6s both' : 'none',
              animationDelay: `${idx * 0.1}s`,
            }}
          >
            <div className="bar w-1 bg-gradient-to-b from-cyan-400 to-violet-500" />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{tab.icon}</span>
                <span className="font-bold text-lg text-white">{tab.title}</span>
              </div>
              <p className="text-white/80 mb-6">{tab.description}</p>
              <ul className="checklist">
                {tab.features.map((feature, fidx) => (
                  <li
                    key={fidx}
                    className="hover:translate-x-2 transition-all duration-200 animate-fadeInUp"
                    style={{ animationDelay: `${fidx * 0.1}s` }}
                  >
                    <span className="mr-2 text-cyan-400">►</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Oi%20MDH%203D!%20Quero%20solicitar%20um%20or%C3%A7amento%20para%20meu%20projeto.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group mt-8 inline-flex items-center justify-center gap-2 animate-fadeInUp"
                style={{ animationDelay: '0.5s' }}
              >
                Solicitar Orçamento
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
