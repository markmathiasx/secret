import Image from "next/image";
import Link from "next/link";
import { brand, whatsappNumber, supportEmail } from "@/lib/constants";

export default function SobrePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-10">
        <p className="section-kicker">Quem somos</p>
        <h1 className="section-title">Sobre a {brand.name}</h1>
      </div>

      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <Image
            src="/logo-mdh-mark.webp"
            alt="Logo MDH 3D"
            width={200}
            height={200}
            className="rounded-[32px] border border-white/10 object-cover shadow-[0_0_40px_rgba(103,232,249,0.1)]"
          />
        </div>

        <div className="space-y-6 text-white/80 leading-8">
          <p>
            A <strong className="text-white">MDH 3D</strong> é um estúdio de impressão 3D localizado no Rio de Janeiro. Produzimos presentes personalizados, miniaturas, utilidades domésticas, peças de setup e projetos sob medida com foco em qualidade e apresentação profissional.
          </p>
          <p>
            Cada peça é produzida localmente, com atenção ao acabamento e entregue com cuidado. Nosso catálogo reúne itens prontos para entrega e peças feitas sob encomenda, sempre com atendimento direto e transparente.
          </p>
          <p>
            Trabalhamos com PLA, PETG, ABS e filamentos especiais, e oferecemos personalização de cor, texto, dimensões e arquivos STL enviados pelo cliente.
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {[
          { title: "Produção local", desc: "Tudo produzido no Rio de Janeiro com equipamentos modernos.", icon: "🖨️" },
          { title: "Catálogo curado", desc: "Seleção de produtos com mídias validadas e preços transparentes.", icon: "📦" },
          { title: "Atendimento direto", desc: "Sem intermediários — fale com a equipe no WhatsApp ou e-mail.", icon: "💬" },
        ].map((item) => (
          <div key={item.title} className="glass-card text-center">
            <div className="mb-3 text-4xl">{item.icon}</div>
            <p className="font-semibold text-white">{item.title}</p>
            <p className="mt-2 text-sm text-white/60 leading-7">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <a
          href={`https://wa.me/${whatsappNumber}`}
          className="btn-primary"
          target="_blank"
          rel="noreferrer"
        >
          Falar no WhatsApp
        </a>
        <a href={`mailto:${supportEmail}`} className="btn-secondary">
          Enviar e-mail
        </a>
        <Link href="/catalogo" className="btn-glass">
          Ver catálogo
        </Link>
      </div>
    </main>
  );
}
