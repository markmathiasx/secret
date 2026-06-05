import Link from "next/link";
import { Clock3, CreditCard, ShieldCheck, Truck } from "lucide-react";
import { socialLinks, whatsappNumber } from "@/lib/constants";

const items = [
  { title: "Contato real", text: `WhatsApp +${whatsappNumber}`, icon: ShieldCheck },
  { title: "Preço legível", text: "Pix no card e cartão sempre Pix + R$ 1.", icon: CreditCard },
  { title: "Prazo por produto", text: "Cada card mostra janela de produção antes do contato.", icon: Clock3 },
  { title: "Produção local RJ", text: "Atendimento humano para urgência, cor, material e retirada/envio.", icon: Truck },
];

export function TrustProofSection() {
  return (
    <section className="border-y border-white/10 bg-white/[0.025] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-black text-white sm:text-3xl">Por que confiar antes de comprar</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/62">
              A MDH 3D evita pedido confuso: produto real do catálogo, preço visível, regra de cartão simples, prazo explicado e canal humano.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/trocas-e-devolucoes" className="btn-secondary px-4 py-2 text-sm">Trocas e devoluções</Link>
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="btn-secondary px-4 py-2 text-sm">Instagram correto</a>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-[8px] border border-white/10 bg-black/20 p-4">
                  <Icon className="h-5 w-5 text-emerald-100" />
                  <h3 className="mt-3 text-base font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/58">{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
