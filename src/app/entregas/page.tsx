import Link from "next/link";
<<<<<<< ours
<<<<<<< ours
import { Clock3, MapPinned, ShieldCheck, Truck } from "lucide-react";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { DeliveryMap } from "@/components/delivery-map";
import { deliveryZones } from "@/lib/constants";

const commitments = [
  {
    title: "Faixas claras para o RJ",
    text: "O simulador foi pensado para responder rapido sem depender exclusivamente de mapas externos.",
    icon: MapPinned
  },
  {
    title: "Prazo alinhado antes da producao",
    text: "A combinacao final considera fila de impressao, acabamento e janela de rota ou retirada.",
    icon: Clock3
  },
  {
    title: "Entrega com UX honesta",
    text: "Se a API do Google nao estiver ativa, o fluxo continua com CEP e orientacao manual sem quebrar a pagina.",
    icon: ShieldCheck
  }
] as const;

export default function DeliveryPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="rounded-[36px] border border-white/10 bg-card p-7 md:p-9">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Entregas</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-black text-white md:text-5xl">
          Frete e prazo local no Rio de Janeiro com fallback seguro quando o Google nao estiver disponivel.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
          Esta pagina foi endurecida para nao travar sem credenciais externas. Voce pode usar autocomplete quando houver chave
          e continuar normalmente pelo CEP manual quando ela nao existir.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {commitments.map((item) => (
          <article key={item.title} className="rounded-[30px] border border-white/10 bg-card p-6">
            <span className="inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-cyan-100">
              <item.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-5 text-2xl font-black text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_minmax(320px,0.96fr)]">
=======
import { DeliveryCalculator } from "@/components/delivery-calculator";
=======
import { DeliveryCalculator } from "@/components/delivery-calculator";
>>>>>>> theirs
import { deliveryZones, whatsappMessage, whatsappNumber } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { DeliveryMap } from "@/components/delivery-map";
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours

const bullets = ["Produção própria no RJ", "Rotas locais com prazo confirmado", "Acompanhamento pelo WhatsApp", "Atendimento para urgências"]; 
=======
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs

const bullets = ["Produção própria no RJ", "Rotas locais com prazo confirmado", "Acompanhamento pelo WhatsApp", "Atendimento para urgências"]; 

export default function Page() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Entrega MDH 3D</p>
      <h1 className="mt-3 text-4xl font-black text-white">Frete local e prazos com previsibilidade no Rio de Janeiro</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">
        Nossas entregas priorizam segurança da peça, confirmação de janela e comunicação ativa com o cliente durante o fluxo.
      </p>

<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
=======
>>>>>>> theirs
      <div className="mt-6 flex flex-wrap gap-2">
        {bullets.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">{item}</span>
        ))}
      </div>

      <div className="mt-8">
>>>>>>> theirs
=======
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
>>>>>>> theirs
=======
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
>>>>>>> theirs
=======
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
>>>>>>> theirs
=======
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
>>>>>>> theirs
        <DeliveryCalculator />
        <DeliveryMap />
      </div>

<<<<<<< ours
      <div className="mt-8 rounded-[32px] border border-white/10 bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/75">Faixas operacionais</p>
            <h2 className="mt-2 text-3xl font-black text-white">Cobertura local usada na operacao</h2>
=======
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {deliveryZones.map((zone) => (
          <div key={zone.region} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold text-white">{zone.region}</p>
            <p className="mt-2 text-2xl font-black text-cyan-100">{formatCurrency(zone.fee)}</p>
            <p className="mt-2 text-sm text-white/60">Prazo estimado: {zone.eta}</p>
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
          </div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
          >
            <Truck className="h-4 w-4" />
            Voltar ao catalogo
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {deliveryZones.map((zone) => (
            <article key={zone.region} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-sm font-semibold text-white">{zone.region}</p>
              <p className="mt-3 text-2xl font-black text-cyan-100">R$ {zone.fee}</p>
              <p className="mt-2 text-sm text-white/60">{zone.eta}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100">Confirmar entrega no WhatsApp</a>
        <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Voltar ao catálogo</Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={whatsappHref} className="rounded-full border border-emerald-300/35 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-100">Confirmar entrega no WhatsApp</a>
        <Link href="/catalogo" className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white">Voltar ao catálogo</Link>
      </div>
    </section>
  );
}
