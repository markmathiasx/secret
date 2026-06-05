import { getSiteUrl } from "@/lib/env";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  tags: string[];
  faq: Array<{ question: string; answer: string }>;
  sections: Array<{ heading: string; body: string[] }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "como-preparar-stl-impressao-3d-perfeita",
    title: "Como preparar seu arquivo STL para impressão 3D perfeita",
    description:
      "Checklist prático para reduzir erro de escala, parede fina, malha aberta e retrabalho antes de pedir uma impressão 3D.",
    publishedAt: "2026-05-03",
    updatedAt: "2026-05-03",
    author: "MDH 3D",
    tags: ["STL", "impressão 3D", "preparação de arquivo", "fatiamento"],
    faq: [
      {
        question: "Qual formato devo enviar para orçamento?",
        answer: "STL, OBJ e 3MF funcionam bem. O 3MF é melhor quando você quer preservar orientação, unidades e informações do fatiamento.",
      },
      {
        question: "Como evitar peça frágil?",
        answer: "Revise paredes finas, encaixes e escala. Para peças funcionais, informe uso esperado, carga e ambiente antes da impressão.",
      },
      {
        question: "Preciso saber configurar fatiador?",
        answer: "Não. Envie o arquivo e o objetivo da peça; a MDH 3D valida material, orientação, suporte e prazo antes de produzir.",
      },
    ],
    sections: [
      {
        heading: "1. Confirme escala e unidade",
        body: [
          "Antes de enviar, abra o arquivo em um visualizador 3D e verifique se as dimensões aparecem em milímetros. Muitos erros de orçamento começam quando um arquivo modelado em centímetros entra como milímetros.",
          "Inclua uma medida crítica no briefing, como largura total, altura final ou diâmetro de encaixe. Isso reduz dúvida técnica e acelera o retorno.",
        ],
      },
      {
        heading: "2. Revise malha, furos e paredes",
        body: [
          "Arquivos com malha aberta, faces invertidas ou paredes finas podem gerar falha de fatiamento. Use uma ferramenta de reparo antes do envio quando o modelo veio de scan, remix ou conversão automática.",
          "Para peças decorativas, paredes acima de 1,2 mm costumam ser mais previsíveis. Para peças funcionais, a validação deve considerar carga, direção do esforço e material.",
        ],
      },
      {
        heading: "3. Informe material, cor e uso",
        body: [
          "PLA Premium resolve a maioria das peças decorativas, presentes e protótipos rápidos. PETG pode ser melhor quando há maior resistência térmica ou uso externo leve.",
          "Cor, acabamento e urgência impactam preço e prazo. Coloque isso no pedido para evitar retrabalho comercial depois da primeira análise.",
        ],
      },
      {
        heading: "4. Envie referência visual quando houver acabamento esperado",
        body: [
          "Quando a compra depende de aparência, mande foto de referência, link do produto final desejado ou exemplo de acabamento. Isso alinha expectativa antes do pagamento.",
          "Se o arquivo ainda não estiver pronto, envie imagem, medidas e objetivo da peça pela rota de orçamento sob medida.",
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug) || null;
}

export function getBlogPostUrl(post: BlogPost) {
  return `${getSiteUrl()}/blog/${post.slug}`;
}
