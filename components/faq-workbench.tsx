"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageCircleMore, Search, Truck, WalletCards, Wrench } from "lucide-react";

type FaqItem = {
  question: string;
  answer: string;
};

function classifyFaq(item: FaqItem) {
  const text = `${item.question} ${item.answer}`.toLowerCase();
  if (/(prazo|entrega|rio de janeiro|frete)/i.test(text)) return "Prazo e entrega";
  if (/(material|pla|petg|resina|acabamento)/i.test(text)) return "Materiais e acabamento";
  if (/(imagem|refer[êe]ncia|sob encomenda|personaliza)/i.test(text)) return "Projeto e personalização";
  return "Pedido e pagamento";
}

export function FaqWorkbench({ items }: { items: FaqItem[] }) {
  const categories = useMemo(
    () => ["Todas", ...Array.from(new Set(items.map(classifyFaq)))],
    [items]
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [openQuestion, setOpenQuestion] = useState(items[0]?.question || "");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchCategory = category === "Todas" || classifyFaq(item) === category;
      const matchQuery =
        !normalized ||
        item.question.toLowerCase().includes(normalized) ||
        item.answer.toLowerCase().includes(normalized);
      return matchCategory && matchQuery;
    });
  }, [category, items, query]);

  const helpRoutes = [
    {
      title: "Quero confirmar frete e prazo",
      description: "Leva para a leitura de entrega local e cálculo inicial por região.",
      href: "/entregas",
      icon: Truck,
    },
    {
      title: "Quero mandar referência",
      description: "Boa rota quando a dúvida já virou projeto sob medida.",
      href: "/imagem-para-impressao-3d",
      icon: Wrench,
    },
    {
      title: "Quero fechar pagamento",
      description: "Abre o checkout para quem já está decidido e quer reduzir atrito.",
      href: "/checkout",
      icon: WalletCards,
    },
    {
      title: "Quero falar com a equipe",
      description: "Quando a dúvida for específica e precisar de validação humana.",
      href: `https://wa.me/5521920137249`,
      icon: MessageCircleMore,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <label className="text-sm text-white/70">
            <span className="mb-2 block">Buscar dúvida</span>
            <div className="field-base flex items-center gap-3">
              <Search className="h-4 w-4 text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex.: prazo, material, sob encomenda..."
                className="w-full bg-transparent outline-none"
              />
            </div>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  category === item
                    ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-50"
                    : "border-white/10 bg-white/5 text-white/75"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.02fr_0.98fr]">
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item) => {
            const active = openQuestion === item.question;
            return (
              <article
                key={item.question}
                className={`glass-panel p-6 transition ${
                  active ? "border-cyan-300/25 bg-cyan-300/8" : ""
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/75">
                  {classifyFaq(item)}
                </p>
                <button
                  type="button"
                  onClick={() => setOpenQuestion((current) => (current === item.question ? "" : item.question))}
                  className="mt-3 text-left text-xl font-semibold text-white"
                >
                  {item.question}
                </button>
                {active ? (
                  <p className="mt-3 text-sm leading-7 text-white/68">{item.answer}</p>
                ) : (
                  <p className="mt-3 text-sm leading-7 text-white/45">
                    Toque para expandir a resposta.
                  </p>
                )}
              </article>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Próximos passos</p>
            <h2 className="mt-3 text-3xl font-black text-white">Se a FAQ já tirou a dúvida, use a rota certa.</h2>
            <div className="mt-5 grid gap-3">
              {helpRoutes.map((item) => {
                const Icon = item.icon;
                const isExternal = item.href.startsWith("http");
                const content = (
                  <>
                    <div className="flex items-center gap-2 text-cyan-100">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold text-white">{item.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-white/68">{item.description}</p>
                  </>
                );

                return isExternal ? (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-[20px] border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/25"
                  >
                    {content}
                  </a>
                ) : (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-[20px] border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/25"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="glass-panel p-6 text-sm leading-7 text-white/68">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/75">Leitura comercial</p>
            <p className="mt-3">
              Esta FAQ foi organizada para reduzir fricção antes do checkout. Se a pessoa ainda hesita, o ideal é não deixá-la
              voltar para uma navegação solta: escolha uma rota com intenção clara.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
