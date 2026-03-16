'use client';

import { useState, useEffect } from 'react';
import { Zap, Gem, Cog, CheckCircle, ArrowRight } from 'lucide-react';

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
    description: 'Validação rápida de conceitos e designs. Ideal para maquetes, testes de encaixe e protótipos visuais com custo-benefício imbatível.',
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
    description: 'Perfeito para miniaturas, joias e peças que exigem detalhes microscópicos sem as linhas de camada visíveis. Qualidade 4K e 8K.',
    color: 'text-violet-400',
    bgColor: 'from-violet-500/10 to-violet-500/5',
    features: [
      'Material: Resina Fotopolímero',
      'Entrega: 3 a 5 dias',
      'Resolução: 4K e 8K',
      'Precisão: 0.03mm a 0.05mm',
      'Acabamento: Ultra liso',
      'Aplicações: Miniaturas, Joias, Dental',
    ],
  },
  {
    id: 'engenharia',
    label: <Cog className="w-6 h-6" />,
    icon: <Cog className="w-6 h-6" />,
    title: 'PEÇAS FUNCIONAIS',
    description: 'Impressões que aguentam calor, impacto e uso contínuo. Ideal para suportes automotivos, peças de reposição e aplicações industriais.',
    color: 'text-green-400',
    bgColor: 'from-green-500/10 to-green-500/5',
    features: [
      'Material: Nylon, ABS, PETG',
      'Entrega: 5 a 7 dias',
      'Resistência: Alta durabilidade',
      'Temperatura: Até 100°C',
      'Aplicações: Industriais, Automotivas',
      'Certificação: Qualidade industrial',
    ],
  },
];

export function ProductTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="section-kicker animate-fadeInUp">Nossos Serviços</span>
          <h2 className="section-title animate-fadeInUp">
            Tecnologia 3D para
            <span className="block bg-gradient-to-r from-cyan-glow via-violet-400 to-green-400 bg-clip-text text-transparent">
              Cada Necessidade
            </span>
          </h2>
          <p className="section-copy animate-fadeInUp max-w-2xl mx-auto">
            Oferecemos soluções completas em impressão 3D, desde protótipos rápidos até peças funcionais de alta resistência.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="glass-panel p-2">
            <div className="flex gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === index
                      ? `bg-gradient-to-r ${tab.bgColor} ${tab.color} shadow-glow-cyan border border-white/20`
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={activeTab === index ? tab.color : 'text-white/50'}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:block">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Content */}
          <div className="animate-slideInLeft">
            <div className="glass-card p-8">
              <div className="mb-6">
                <h3 className={`text-2xl font-black mb-4 ${tabs[activeTab].color}`}>
                  {tabs[activeTab].title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {tabs[activeTab].description}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {tabs[activeTab].features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 animate-fadeInUp"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tabs[activeTab].color}`} />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/5521920137249?text=Oi%20MDH%203D!%20Quero%20solicitar%20um%20orçamento%20para%20prototipagem."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary group w-full justify-center"
              >
                Solicitar Orçamento
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="animate-slideInRight">
            <div className={`glass-panel p-8 bg-gradient-to-br ${tabs[activeTab].bgColor} border-2 border-white/10`}>
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${tabs[activeTab].bgColor} mb-6 ${tabs[activeTab].color} animate-cyber-pulse`}>
                  {tabs[activeTab].icon}
                </div>

                <h4 className="text-xl font-bold text-white mb-4">
                  {tabs[activeTab].label} 3D
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="glass-chip">
                    <span className="text-white/80">Tecnologia</span>
                  </div>
                  <div className="glass-chip">
                    <span className="text-white/80">Profissional</span>
                  </div>
                  <div className="glass-chip">
                    <span className="text-white/80">Qualidade</span>
                  </div>
                  <div className="glass-chip">
                    <span className="text-white/80">Garantia</span>
                  </div>
                </div>

                {/* Animated Progress Bars */}
                <div className="mt-8 space-y-4">
                  {[
                    { label: 'Qualidade', value: 95 },
                    { label: 'Velocidade', value: 88 },
                    { label: 'Precisão', value: 92 },
                  ].map((item, index) => (
                    <div key={index} className="animate-fadeInUp" style={{ animationDelay: `${(index + 3) * 200}ms` }}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/70">{item.label}</span>
                        <span className={tabs[activeTab].color}>{item.value}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${tabs[activeTab].bgColor} transition-all duration-1000`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
