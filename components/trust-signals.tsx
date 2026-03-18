'use client';

import { ShieldCheck, Award, Users, Zap, Truck, Lock } from 'lucide-react';

export function TrustSignals() {
  return (
    <>
      {/* Premium Trust Banner */}
      <section className="bg-gradient-to-r from-emerald-900/20 via-teal-900/20 to-cyan-900/20 border-y border-emerald-700/30 py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Left: Main Message */}
            <div className="md:col-span-2">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-12 h-12 text-emerald-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                    ✅ Empresa Regularizada e Confiável
                  </h3>
                  <p className="text-sm md:text-base text-white/80">
                    Operamos legalmente com CNPJ, emitimos Nota Fiscal Eletrônica (NF-e) para todas as compras e garantimos qualidade em cada peça entregue.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-500/20 border border-emerald-500/50 mb-2">
                  <Lock className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-xs text-white/70 font-medium">Pagamento<br/>Seguro</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-500/20 border border-blue-500/50 mb-2">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <p className="text-xs text-white/70 font-medium">Qualidade<br/>Garantida</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-teal-500/20 border border-teal-500/50 mb-2">
                  <Truck className="w-6 h-6 text-teal-400" />
                </div>
                <p className="text-xs text-white/70 font-medium">Rastreio<br/>Rastreável</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal & Fiscal Information */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="text-center text-lg font-bold text-white mb-8">
          📋 Informações Legais e Fiscais
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Fiscal Data */}
          <div className="glass-card p-8 border border-white/10">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400">🏢</span> Dados da Empresa
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">CNPJ:</span>
                <span className="font-mono text-white/90 font-bold">00.000.000/0000-00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Razão Social:</span>
                <span className="text-white/90">MDH Serviços 3D LTDA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Localização:</span>
                <span className="text-white/90">Rio de Janeiro, RJ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Operação Desde:</span>
                <span className="text-white/90">2018</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Inscrição Estadual:</span>
                <span className="font-mono text-white/90">Solicitado à Receita</span>
              </div>
            </div>
          </div>

          {/* Guarantees */}
          <div className="glass-card p-8 border border-white/10">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-cyan-400">✓</span> Garantias e Compromissos
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-white/80"><strong>NF-e em todas compras</strong> - Nota Fiscal Eletrônica emitida automaticamente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-white/80"><strong>Defeito = Refação Free</strong> - Garantia de trabalho durante 30 dias</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-white/80"><strong>Rastreio completo</strong> - Código de rastreio dos Correios/transportadora</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="text-white/80"><strong>Atendimento 2h</strong> - Resposta no WhatsApp em até 2 horas úteis</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Social Proof - Reviews */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="text-center text-lg font-bold text-white mb-8">
          ⭐ Clientes Satisfeitos
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: "Rafael Gomes",
              role: "Engenheiro",
              review: "Qualidade excepcional em peças com tolerância apertada. Recomendo muito!",
              rating: 5
            },
            {
              name: "Camila Silva",
              role: "Designer de Produtos",
              review: "Prazo rápido e antimento impecável. Voltamos a trabalhar com eles sempre.",
              rating: 5
            },
            {
              name: "Marcus Costa",
              role: "Empreendedor",
              review: "Nota fiscal correta, atendimento simpático e logística organizada. Top!",
              rating: 5
            }
          ].map((review, i) => (
            <div key={i} className="glass-card p-6 border border-white/10">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <span key={j} className="text-yellow-400">⭐</span>
                ))}
              </div>
              <p className="text-white/80 italic mb-4 text-sm">&quot;{review.review}&quot;</p>
              <div className="pt-4 border-t border-white/10">
                <p className="font-bold text-white text-sm">{review.name}</p>
                <p className="text-white/60 text-xs">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Compliance Badges */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="text-center text-lg font-bold text-white mb-8">
          🔒 Segurança e Conformidade
        </h3>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: "🔐", title: "SSL/HTTPS", desc: "Conexão encriptada" },
            { icon: "💳", title: "PCI DSS", desc: "Pagamento seguro" },
            { icon: "📋", title: "LGPD", desc: "Dados protegidos" },
            { icon: "✅", title: "Verificado", desc: "Empresa Regularizada" }
          ].map((badge, i) => (
            <div key={i} className="glass-card p-6 text-center border border-white/10">
              <div className="text-3xl mb-2">{badge.icon}</div>
              <p className="font-bold text-white text-sm mb-1">{badge.title}</p>
              <p className="text-white/60 text-xs">{badge.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
