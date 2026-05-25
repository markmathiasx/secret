import { BadgeCheck, MapPin, RefreshCw, Shield } from "lucide-react";

const GUARANTEES = [
  {
    icon: MapPin,
    title: "Atendimento direto",
    body: "Pedido acompanhado pela equipe da MDH 3D do orçamento ao envio.",
    color: "text-cyan-100",
    border: "border-cyan-300/15",
    bg: "bg-cyan-300/[0.08]",
  },
  {
    icon: BadgeCheck,
    title: "Impressão certificada",
    body: "Bambu Lab X1C e P1S. Precisão de 0.05mm e filamentos certificados.",
    color: "text-emerald-100",
    border: "border-emerald-300/15",
    bg: "bg-emerald-300/[0.08]",
  },
  {
    icon: RefreshCw,
    title: "Troca em 7 dias",
    body: "Defeito de impressão ou dano no envio? A gente reavalia, refaz ou devolve.",
    color: "text-violet-100",
    border: "border-violet-300/15",
    bg: "bg-violet-300/[0.08]",
  },
  {
    icon: Shield,
    title: "Suporte via WhatsApp",
    body: "Atendimento real, com resposta em até 2h em horário comercial.",
    color: "text-white",
    border: "border-white/15",
    bg: "bg-white/5",
  },
];

export function GuaranteeBar() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {GUARANTEES.map((g) => {
        const Icon = g.icon;
        return (
          <div
            key={g.title}
            className={`flex items-start gap-4 rounded-[24px] border p-5 ${g.border} ${g.bg}`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${g.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${g.color}`}>{g.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/60">{g.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
