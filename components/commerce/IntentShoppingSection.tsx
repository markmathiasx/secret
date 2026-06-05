import Link from "next/link";
import { ArrowRight } from "lucide-react";

const intents = [
  { title: "Presentes até R$ 50", href: "/presentes-ate-50", text: "Itens reais de entrada com Pix e cartão claros." },
  { title: "Chaveiros personalizados", href: "/chaveiros-personalizados", text: "Nome, pet, tema, evento e brinde." },
  { title: "Organização e setup", href: "/organizadores", text: "Cabos, mesa, banheiro, gaveta e rotina." },
  { title: "Peça sob medida", href: "/peca-sob-medida", text: "Medidas, uso, cor, quantidade e referência." },
];

export function IntentShoppingSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {intents.map((intent) => (
          <Link
            key={intent.href}
            href={intent.href}
            className="group rounded-[8px] border border-white/10 bg-white/[0.045] p-5 transition hover:border-emerald-300/30 hover:bg-emerald-300/10"
          >
            <h2 className="text-lg font-black text-white">{intent.title}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-white/60">{intent.text}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-100">
              Ver produtos <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
