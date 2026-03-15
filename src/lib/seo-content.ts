export const faqItems = [
  {
    q: "Como faço um pedido de impressão 3D na MDH 3D?",
    a: "Escolha sua peca no catalogo, abra a pagina do produto e siga para o carrinho ou checkout. Se quiser ajustar cor, prazo ou personalizacao, o WhatsApp ajuda voce a fechar com mais seguranca."
  },
  {
    q: "Vocês entregam impressão 3D em quais regiões?",
    a: "Atualmente a entrega local esta concentrada no Rio de Janeiro, com estimativa por CEP e prazo confirmado antes do fechamento do pedido."
  },
  {
    q: "Posso pedir uma peça 3D personalizada?",
    a: "Sim. A loja atende pedidos sob medida para nomes 3D, placas, brindes, decoracao, utilidades e pecas especiais, sempre com alinhamento de prazo, acabamento e proposta visual."
  },
  {
    q: "Qual o melhor pagamento para comprar peças 3D?",
    a: "Pix e o principal meio da loja e normalmente garante o melhor valor. Quando o cartao estiver disponivel com seguranca, ele aparece como opcao extra."
  },
  {
    q: "As imagens do catálogo são fotos reais?",
    a: "A loja prioriza fotos das pecas sempre que possivel. Em alguns itens, a apresentacao da colecao ajuda voce a visualizar estilo, proporcao e acabamento com clareza ate a foto final entrar."
  }
] as const;

export const categoryLandingEntries = [
  { category: "Presentes Criativos", slug: "presentes-criativos" },
  { category: "Geek & Anime", slug: "geek-anime" },
  { category: "Setup & Organizacao", slug: "setup-organizacao" },
  { category: "Casa & Decoracao", slug: "casa-decoracao" },
  { category: "Personalizados", slug: "personalizados" }
] as const;

export const categorySeoContent: Record<
  string,
  {
    title: string;
    description: string;
    body: string[];
    faqs: string[];
  }
> = {
  "Presentes Criativos": {
    title: "Presentes criativos em impressao 3D",
    description:
      "Pecas 3D para presentear com mais personalidade, incluindo itens geek, decorativos e personalizados feitos sob encomenda.",
    body: [
      "A categoria de presentes criativos da MDH 3D reune pecas com mais apelo visual, boa leitura de valor e mais chance de virar presente certeiro para aniversario, namorado, amigo geek ou cliente especial.",
      "Aqui entram nomes 3D, placas decorativas, itens de estante, lembrancas com acabamento premium e presentes em impressao 3D para quem quer surpreender sem cair no comum."
    ],
    faqs: ["presente impresso em 3d", "lembranca personalizada 3d", "nome 3d decorativo"]
  },
  "Geek & Anime": {
    title: "Decoracao geek e anime em impressao 3D",
    description:
      "Colecao de decoracao geek, anime e itens de estante em impressao 3D para setups, quartos e colecoes com personalidade.",
    body: [
      "A linha Geek & Anime da MDH 3D foi pensada para quem procura decoracao de anime, games, filmes e colecionaveis com mais identidade visual para setup, quarto e estante.",
      "A curadoria mistura itens com apelo de presente, decoracao de mesa e pecas para quem quer um ambiente mais autoral sem abrir mao de compra simples, prazo claro e atendimento rapido."
    ],
    faqs: ["decoracao geek impressao 3d", "anime em impressao 3d", "colecionaveis 3d"]
  },
  "Setup & Organizacao": {
    title: "Organizadores e suportes em impressao 3D para setup",
    description:
      "Suportes, docks e organizadores em impressao 3D para mesa gamer, home office e bancada com visual premium.",
    body: [
      "Nesta colecao voce encontra organizadores em impressao 3D, suportes de controle, docks para headset e pecas pensadas para deixar a mesa mais bonita, funcional e bem resolvida.",
      "O foco da categoria e unir organizacao e valor visual: menos bagunca, mais praticidade e acabamento com cara de produto premium para home office, bancada criativa ou setup gamer."
    ],
    faqs: ["organizador impresso em 3d", "suporte de controle 3d", "setup gamer impressao 3d"]
  },
  "Casa & Decoracao": {
    title: "Decoracao para casa e escritorio em impressao 3D",
    description:
      "Vasos, luminarias, esculturas e objetos decorativos em impressao 3D para casa, escritorio e quarto.",
    body: [
      "A categoria Casa & Decoracao junta vasos, luminarias e objetos 3D com presenca visual para quem quer decorar quarto, sala, escritorio ou bancada com mais personalidade.",
      "Sao pecas pensadas para compor ambiente, presentear e valorizar espacos com design leve, producao sob demanda e opcoes que conversam com estilos modernos, geek e criativos."
    ],
    faqs: ["vaso impresso em 3d", "decoracao escritorio 3d", "luminaria 3d"]
  },
  Personalizados: {
    title: "Pecas 3D personalizadas sob encomenda",
    description:
      "Modelos sob medida, nomes 3D, logos e pecas personalizadas em impressao 3D para presente, negocio e decoracao.",
    body: [
      "A area de personalizados da MDH 3D e para quem precisa de uma peca com nome, logo, identidade visual ou ajuste especifico de cor, formato e acabamento.",
      "Esse tipo de pedido e ideal para presentes personalizados, comunicacao de balcao, brindes de marca, nomes decorativos e pecas sob medida com mais personalidade."
    ],
    faqs: ["personalizado impressao 3d", "logo 3d sob encomenda", "nome 3d personalizado"]
  }
};

export const guideEntries = [
  {
    slug: "presentes-em-impressao-3d-para-surpreender",
    title: "Presentes em impressao 3D para surpreender sem cair no obvio",
    description:
      "Descubra como escolher presentes em impressao 3D com mais valor percebido para aniversario, setup, estante e decoracao.",
    intro:
      "Presentes em impressao 3D funcionam melhor quando unem personalidade, utilidade e acabamento visual. A ideia nao e apenas dar um objeto diferente, mas entregar uma peca que combine com o estilo da pessoa e pareca pensada para ela.",
    sections: [
      {
        heading: "O que faz um presente 3D parecer especial",
        body:
          "Os itens que mais encantam costumam juntar tema forte, boa escala para exposicao e um detalhe de personalizacao, como nome, cor ou frase. Isso aumenta o valor percebido sem transformar a compra em algo complicado."
      },
      {
        heading: "Ideias que funcionam bem no catalogo da MDH 3D",
        body:
          "Decor geek, nomes 3D, placas, organizadores bonitos e itens de estante tendem a vender bem porque resolvem duas coisas ao mesmo tempo: presenteiam e decoram. Sao pecas faceis de entender no primeiro clique."
      },
      {
        heading: "Quando vale pedir ajuda no WhatsApp",
        body:
          "Se o presente precisa de cor especifica, frase, logo ou prazo especial, o WhatsApp entra como apoio para fechar o pedido com mais seguranca, sem tirar a clareza do checkout."
      }
    ],
    relatedHref: "/categorias/presentes-criativos",
    relatedLabel: "Ver presentes criativos"
  },
  {
    slug: "como-montar-um-setup-com-organizadores-3d",
    title: "Como montar um setup com organizadores e suportes em impressao 3D",
    description:
      "Guia rapido para usar organizadores, docks e suportes 3D no setup gamer, home office e bancada criativa.",
    intro:
      "Um bom setup nao depende apenas de monitor, teclado e luz. Pequenas pecas de organizacao fazem a mesa parecer mais premium, melhoram a rotina e evitam bagunca visual.",
    sections: [
      {
        heading: "Quais pecas 3D ajudam mais no dia a dia",
        body:
          "Suportes de controle, docks de headset, organizadores de mesa e ganchos sao itens com alta utilidade porque liberam espaco, deixam os acessorios visiveis e ajudam a compor um visual mais limpo."
      },
      {
        heading: "Como escolher sem sobrecarregar a bancada",
        body:
          "O segredo e combinar uma ou duas pecas funcionais com boa leitura visual, em vez de encher a mesa de itens pequenos. A curadoria certa melhora o setup e ainda valoriza o ambiente."
      },
      {
        heading: "Quando personalizacao faz sentido",
        body:
          "Personalizacao e uma boa escolha quando a peca precisa conversar com a cor do setup, com uma marca pessoal ou com uma necessidade especifica de cabos, acessorios e espaco."
      }
    ],
    relatedHref: "/categorias/setup-organizacao",
    relatedLabel: "Ver setup e organizacao"
  },
  {
    slug: "pecas-personalizadas-em-impressao-3d-no-rio-de-janeiro",
    title: "Pecas personalizadas em impressao 3D no Rio de Janeiro: quando vale encomendar",
    description:
      "Entenda quando uma peca personalizada em impressao 3D faz sentido para presente, negocio, decoracao ou uso tecnico no Rio de Janeiro.",
    intro:
      "Nem toda compra precisa ser 100% personalizada. Mas quando a necessidade e mais especifica, a impressao 3D sob encomenda se destaca porque permite adaptar nome, marca, cor, proporcao e acabamento com muito mais liberdade.",
    sections: [
      {
        heading: "Casos em que o sob medida vale mais",
        body:
          "Nomes 3D, placas para balcao, logos, brindes para negocios locais, pecas de ambientacao e solucoes tecnicas simples sao alguns dos pedidos em que a personalizacao realmente faz diferenca."
      },
      {
        heading: "O que acelera um pedido personalizado",
        body:
          "Ter referencia visual, texto correto, medidas aproximadas e prazo desejado ajuda a transformar a conversa em orcamento rapido. Isso reduz retrabalho e melhora previsao de producao."
      },
      {
        heading: "Como a MDH 3D trata esse tipo de compra",
        body:
          "A loja usa o catalogo para mostrar linguagem visual e nivel de acabamento, e o WhatsApp entra para alinhar variacoes quando a peca exige nome, logo, ajuste de tamanho ou acabamento especial."
      }
    ],
    relatedHref: "/categorias/personalizados",
    relatedLabel: "Ver personalizados"
  }
] as const;

export function getGuideBySlug(slug: string) {
  return guideEntries.find((entry) => entry.slug === slug) || null;
}

export function getCategoryBySlug(slug: string) {
  return categoryLandingEntries.find((entry) => entry.slug === slug)?.category || null;
}

export function getCategorySlug(category: string) {
  return categoryLandingEntries.find((entry) => entry.category === category)?.slug || null;
}
