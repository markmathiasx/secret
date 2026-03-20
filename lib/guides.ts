export type Guide = {
  slug: string;
  title: string;
  summary: string;
  level: "basico" | "intermediario" | "avancado";
  timeMin: number;
  tools: string[];
  warnings: string[];
  steps: string[];
  relatedSkus: string[];
};

export const guides: Guide[] = [
  {
    slug: "limpeza-bancada-a1-mini",
    title: "Limpeza rapida da bancada A1 Mini",
    summary: "Rotina semanal para reduzir sujeira, poeira e residuos em torno da impressora.",
    level: "basico",
    timeMin: 10,
    tools: ["Pano seco", "Pincel macio", "Recipiente de descarte"],
    warnings: [
      "Desligue e desconecte da tomada antes de iniciar.",
      "Nao use solvente agressivo em pecas plasticas.",
    ],
    steps: [
      "Desligue a impressora e aguarde resfriamento completo.",
      "Remova residuos aparentes da area de trabalho.",
      "Use pincel macio nos cantos e trilhos externos.",
      "Finalize com pano seco e confirme livre movimentacao dos eixos.",
    ],
    relatedSkus: ["A1M-CONS-GRINDER-HEX-BLK-R1", "A1M-UPG-GRINDER-TURBINE-BLK-R1"],
  },
  {
    slug: "organizar-insumos-com-suporte",
    title: "Organizar insumos com suporte compacto",
    summary: "Padrao de arrumacao para cola, pasta e itens de uso diario na bancada.",
    level: "basico",
    timeMin: 8,
    tools: ["Suporte compacto", "Pano seco"],
    warnings: ["Mantenha itens liquidos longe da area energizada da impressora."],
    steps: [
      "Posicione o suporte em area seca e plana.",
      "Acomode tubos e frascos de uso recorrente no suporte.",
      "Reserve espaco livre para movimentacao da mesa da impressora.",
    ],
    relatedSkus: ["A1M-ACC-PASTA-HOLDER-R1"],
  },
  {
    slug: "configurar-kit-personalizado",
    title: "Configurar kit personalizado sem erro",
    summary: "Fluxo de briefing para kits personalizados com aprovacao de detalhes antes da producao.",
    level: "intermediario",
    timeMin: 20,
    tools: ["Briefing de referencia", "Lista de cores", "Checklist de aprovacao"],
    warnings: ["Nao iniciar producao sem aprovacao textual do cliente."],
    steps: [
      "Validar referencia visual e escopo do pedido.",
      "Definir escala, paleta de cores e acabamento.",
      "Confirmar prazo de producao e janela de entrega.",
      "Registrar BOM do kit e liberar producao.",
    ],
    relatedSkus: ["A1M-KIT-FAMILIA-CUSTOM-R1", "A1M-KIT-MASCOTE-GAMER-CAT-R1"],
  },
  {
    slug: "revisar-acabamento-placa-recorte",
    title: "Revisar acabamento de placa recortada",
    summary: "Checklist de qualidade para placas vazadas antes do envio.",
    level: "intermediario",
    timeMin: 15,
    tools: ["Luva fina", "Lixa fina opcional", "Pincel antiestatico"],
    warnings: ["Nao force recortes finos para evitar quebra."],
    steps: [
      "Inspecionar bordas e recortes sob luz frontal.",
      "Remover rebarbas leves com acabamento controlado.",
      "Limpar a superficie e validar contraste visual.",
      "Embalar com protecao para transporte.",
    ],
    relatedSkus: ["A1M-SPARE-PLACA-PORTAL-R1"],
  },
  {
    slug: "montar-lote-chaveiros",
    title: "Montagem e conferencia de lote de chaveiros",
    summary: "Padrao de separacao por tema, cor e quantidade para lotes de revenda.",
    level: "basico",
    timeMin: 25,
    tools: ["Argolas", "Alicate de ponta", "Bandejas de separacao"],
    warnings: ["Conferir contagem final por SKU antes de embalar."],
    steps: [
      "Separar pecas por SKU e variante.",
      "Instalar argolas e revisar fixacao.",
      "Conferir acabamento visual unidade a unidade.",
      "Embalar e etiquetar por lote.",
    ],
    relatedSkus: ["A1M-CONS-KEYTAG-MASON-R1", "A1M-ACC-KEYCHAIN-BRASIL-R1", "A1M-ACC-KEYCHAIN-YOSHI-R1"],
  },
  {
    slug: "controle-seguranca-hotend",
    title: "Controle de seguranca em manutencao de hotend",
    summary: "Boas praticas gerais para intervencoes em componentes com risco termico.",
    level: "avancado",
    timeMin: 12,
    tools: ["Luva termica", "Pinça", "Checklist de seguranca"],
    warnings: [
      "Desligue e desconecte da tomada antes de qualquer manutencao.",
      "Nao toque no hotend sem confirmar temperatura segura.",
    ],
    steps: [
      "Parar operacao e desligar fonte principal.",
      "Aguardar resfriamento completo do conjunto.",
      "Executar manutencao com ferramenta adequada.",
      "Revalidar fixacao e conectores antes de ligar.",
    ],
    relatedSkus: ["A1M-CONS-GRINDER-HEX-BLK-R1", "A1M-UPG-GRINDER-TURBINE-BLK-R1"],
  },
];

export function findGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

