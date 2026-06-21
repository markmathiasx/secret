export type NavigationLink = {
  href: string;
  label: string;
  public: boolean;
  surface: "primary" | "commerce-shortcut" | "footer" | "policy" | "admin";
};

export const primaryNavigationLinks: NavigationLink[] = [
  { href: "/loja", label: "Loja", public: true, surface: "primary" },
  { href: "/ofertas", label: "Ofertas", public: true, surface: "primary" },
  { href: "/catalogo", label: "Catálogo", public: true, surface: "primary" },
  { href: "/sob-medida", label: "Sob medida", public: true, surface: "primary" },
  { href: "/jogue", label: "Jogue", public: true, surface: "primary" },
  { href: "/como-funciona", label: "Como funciona", public: true, surface: "primary" },
  { href: "/blog", label: "Blog", public: true, surface: "primary" },
  { href: "/atendimento", label: "Atendimento", public: true, surface: "primary" },
];

export const commerceShortcutLinks: NavigationLink[] = [
  { href: "/catalogo?mode=verified", label: "Mídia validada", public: true, surface: "commerce-shortcut" },
  { href: "/catalogo?status=Pronta%20entrega", label: "Pronta entrega", public: true, surface: "commerce-shortcut" },
  { href: "/catalogo?intent=presentear", label: "Ideias de presente", public: true, surface: "commerce-shortcut" },
  { href: "/imagem-para-impressao-3d", label: "Enviar STL", public: true, surface: "commerce-shortcut" },
  { href: "/jogue", label: "Print Quest", public: true, surface: "commerce-shortcut" },
];

export const policyNavigationLinks: NavigationLink[] = [
  { href: "/comprar-na-mdh3d", label: "Como comprar", public: true, surface: "policy" },
  { href: "/politica-de-envio", label: "Política de envio", public: true, surface: "policy" },
  { href: "/politica-de-troca", label: "Política de troca", public: true, surface: "policy" },
  { href: "/politica-de-privacidade", label: "Privacidade", public: true, surface: "policy" },
  { href: "/termos-de-compra", label: "Termos de compra", public: true, surface: "policy" },
  { href: "/prazo-de-producao", label: "Prazo de produção", public: true, surface: "policy" },
];

export const officialRouteMap = {
  home: "/",
  store: "/loja",
  catalog: "/catalogo",
  product: "/produto/[slug]",
  cart: "/carrinho",
  checkout: "/checkout",
  orders: "/pedidos",
  support: "/atendimento",
  games: "/jogue",
  offers: "/ofertas",
  customBrief: "/sob-medida",
  legacyCustomBrief: "/orcamento-personalizado",
  howItWorks: "/como-funciona",
  legacyHowItWorks: "/guia-primeira-impressao-3d",
  blog: "/blog",
  feeds: ["/feeds/google-shopping.xml", "/feeds/google-shopping.csv", "/feeds/meta-catalog.csv", "/feeds/produtos.json", "/feeds/products.json", "/meta/catalog.csv"],
} as const;

export const permanentRedirects = [
  { from: "/home", to: "/", status: 308 },
] as const;
