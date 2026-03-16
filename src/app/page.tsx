import Link from "next/link";
import {
  Armchair,
  BriefcaseBusiness,
  Gamepad2,
  Gift,
  HeartHandshake,
  MapPinned,
  Package,
  PencilRuler,
  ShieldCheck,
  Sparkles,
  WalletCards
} from "lucide-react";
import { CatalogGrid } from "@/components/catalog-grid";
import { DeliveryCalculator } from "@/components/delivery-calculator";
import { Hero } from "@/components/hero";
import { HomePersonalized } from "@/components/home-personalized";
import { MediaStrip } from "@/components/media-strip";
import { QuoteForm } from "@/components/quote-form";
import { featuredCatalog } from "@/lib/catalog";
import { whatsappMessage, whatsappNumber } from "@/lib/constants";

const categoryCards = [
  { title: "Anime", text: "Peças para colecionadores, presentes e setups com leitura visual forte.", icon: Sparkles },
  { title: "Geek", text: "Displays, suportes, itens de bancada e objetos para cultura pop e gamer.", icon: Gamepad2 },
  { title: "Utilidades", text: "Soluções para casa, rotina, organização e pequenos problemas do dia a dia.", icon: Package },
  { title: "Casa", text: "Objetos de mesa, decoração funcional e peças com leitura premium para o ambiente.", icon: Armchair },
  { title: "Escritório", text: "Bases, docks, organizadores e suportes para uma rotina de trabalho mais bem resolvida.", icon: BriefcaseBusiness },
  { title: "Personalizados", text: "Nomes, brindes, topos de bolo, logos e pecas com identidade propria.", icon: PencilRuler },
  { title: "Presentes", text: "Peças pensadas para data comemorativa, lembrança criativa e valor percebido alto.", icon: Gift },
  { title: "Sob encomenda", text: "Displays, peças técnicas e projetos sob medida com briefing validado.", icon: HeartHandshake }
];

const materials = [
  {
    title: "PLA Premium",
    text: "Ideal para colecionáveis, presentes e peças com acabamento visual mais fino."
  },
  {
    title: "PETG reforçado",
    text: "Melhor escolha para itens funcionais, peças de bancada e uso recorrente."
  },
  {
    title: "Acabamento sob medida",
    text: "Opções foscas, silk e cores especiais conforme o contexto da peça."
  }
];

const trustPillars = [
  {
    title: "Entrega local no RJ",
    text: "Frete estimado por CEP, retirada combinada e roteiros proprios para a cidade.",
    icon: MapPinned
  },
  {
    title: "Pagamento flexivel",
    text: "Pix, cartao e boleto com comunicacao clara desde a pagina do produto.",
    icon: WalletCards
  },
  {
    title: "Compra com confianca",
    text: "O cliente entende material, prazo, prévia conceitual e canal de contato sem sentir que está navegando num demo.",
    icon: ShieldCheck
  }
];

const faqItems = [
  {
    q: "Vocês fazem pecas personalizadas?",
    a: "Sim. A categoria Personalizados e o botao de orcamento existem justamente para adaptar cor, escala e aplicacao da peca."
  },
  {
    q: "Entregam para todo o Brasil?",
    a: "O foco atual da operacao e o Rio de Janeiro. Outros envios podem ser avaliados pelo canal mais seguro para cada pedido."
  },
  {
    q: "A foto do produto e definitiva?",
    a: "Quando a peca ainda nao tem ensaio proprio, a vitrine usa preview conceitual premium. Assim que a foto real existir, ela entra automaticamente."
  },
  {
    q: "Entrar na conta e obrigatorio?",
    a: "Nao. O catalogo e publico. A conta existe para melhorar favoritos, orcamentos salvos e atalhos de cliente."
  }
];

export default function HomePage() {
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
  const featuredProduct = featuredCatalog[0];

  return (
    <div>
      <Hero />
      <HomePersonalized />

      <section id="mais-vendidos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Mais vendidos</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Selecao enxuta para quem quer comprar sem perder tempo.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/66">
              Curadoria com foco em giro, ticket inicial e itens que funcionam bem para venda direta, presente e recompra.
            </p>
          </div>
          <Link href="/catalogo" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white">
            Ver catalogo completo
          </Link>
        </div>

        <CatalogGrid products={featuredCatalog} />
      </section>

      <section id="categorias" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Categorias</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Linhas pensadas para um negocio real de impressao 3D.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((item) => (
            <div key={item.title} className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <item.icon className="h-6 w-6 text-cyan-200" />
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <MediaStrip />

      {featuredProduct ? (
        <section id="orcamento" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.95fr_1.05fr]">
          <QuoteForm initialProduct={featuredProduct} />
          <DeliveryCalculator />
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Materiais e acabamentos</p>
            <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Cada peca ja nasce com uso, material e acabamento pensados para venda.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {materials.map((item) => (
              <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Confianca comercial</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Compra local, pagamentos claros e canais flexiveis para fechar o pedido.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {trustPillars.map((item) => (
            <div key={item.title} className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <item.icon className="h-6 w-6 text-cyan-200" />
              <h3 className="mt-4 text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">FAQ</p>
          <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">Respostas objetivas para facilitar a compra.</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {faqItems.map((item) => (
            <article key={item.q} className="rounded-[30px] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">{item.q}</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-[36px] border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.14),rgba(2,6,23,0.96))] p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">WhatsApp</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black text-white sm:text-4xl">
            Fale com a MDH 3D e transforme sua ideia em um pedido pronto para produzir.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70">
            Se voce ja sabe a peca, a cor ou o bairro, o atendimento fica ainda mais rapido. O site ajuda a descobrir; o WhatsApp ajuda a fechar.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-cyan-300 px-6 py-3 text-sm font-semibold text-slate-950"
            >
              Pedir orcamento pelo WhatsApp
            </a>
            <Link href="/catalogo" className="rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white">
              Continuar no catalogo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
