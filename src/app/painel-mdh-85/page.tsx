import { PricingCalculator } from "@/components/pricing-calculator";
import Link from "next/link";
import { adminConfig, supportEmail } from "@/lib/constants";

const checklist = [
  "Trocar ADMIN_PASSWORD e ADMIN_SESSION_TOKEN no .env.local antes de publicar.",
  "Subir vídeos reais em biblioteca local de mídia para a home.",
  "Cadastrar suas peças campeãs com fotos próprias.",
  "Conectar WhatsApp Cloud API e testar webhook.",
  "Ativar domínio próprio e SSL via Vercel + Cloudflare."
];

export default function AdminHome() {
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      <div className="rounded-[32px] border border-cyan-400/20 bg-cyan-400/10 p-6 lg:col-span-2">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">Resumo</p>
        <h2 className="mt-2 text-2xl font-black text-white">Área administrativa isolada do site público</h2>
        <p className="mt-4 text-sm leading-7 text-white/75">
          Seu login de gestão fica no caminho oculto <span className="rounded bg-black/20 px-2 py-1 font-mono text-cyan-100">{adminConfig.hiddenPath}</span>.
          O site público não mostra esse endereço e a rota /admin responde 404.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link href="/painel-mdh-85/finance" className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/30">
            <p className="text-sm font-semibold text-white">Financeiro</p>
            <p className="mt-2 text-sm text-white/60">Custos, receita, lucro, gráfico por dia/semana/mês/ano e exportação CSV.</p>
          </Link>
          <Link href="/painel-mdh-85/logistica" className="rounded-[24px] border border-white/10 bg-black/20 p-5 transition hover:border-cyan-300/30">
            <p className="text-sm font-semibold text-white">Logística</p>
            <p className="mt-2 text-sm text-white/60">Frete normal, expresso 2x, CEP RJ, roteiro de entrega própria e operação de moto/carro.</p>
          </Link>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-violet-200">Admin</p>
        <h3 className="mt-2 text-xl font-bold text-white">Configuração atual</h3>
        <dl className="mt-4 space-y-3 text-sm text-white/65">
          <div>
            <dt className="text-white/45">E-mail admin</dt>
            <dd>{adminConfig.email}</dd>
          </div>
          <div>
            <dt className="text-white/45">E-mail atendimento</dt>
            <dd>{supportEmail}</dd>
          </div>
          <div>
            <dt className="text-white/45">Painel</dt>
            <dd>{adminConfig.hiddenPath}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 lg:col-span-3">
        <h3 className="text-xl font-bold text-white">Checklist antes de publicar</h3>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {checklist.map((item) => (
            <li key={item} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/65">
              {item}
            </li>
          ))}
        </ul>
      </div>
          <div className="lg:col-span-3">
        <PricingCalculator />
      </div>
    </section>
  );
}
