export type NavigationLink = {
  href: string;
  label: string;
  public: boolean;
  surface: "primary" | "commerce-shortcut" | "footer" | "policy" | "admin";
};

export const primaryNavigationLinks: NavigationLink[] = [
  { href: "/loja", label: "Loja", public: true, surface: "primary" },
  { href: "/ofertas", label: "Ofertas", public: true, surface: "primary" },
  { href: "/catalogo", label: "Catalogo", public: true, surface: "primary" },
  { href: "/orcamento-personalizado", label: "Sob medida", public: true, surface: "primary" },
  { href: "/jogue", label: "Jogue", public: true, surface: "primary" },
  { href: "/guia-primeira-impressao-3d", label: "Como funciona", public: true, surface: "primary" },
  { href: "/blog", label: "Blog", public: true, surface: "primary" },
  { href: "/atendimento", label: "Atendimento", public: true, surface: "primary" },
];

export const commerceShortcutLinks: NavigationLink[] = [
  { href: "/catalogo?mode=verified", label: "Midia validada", public: true, surface: "commerce-shortcut" },
  { href: "/catalogo?status=Pronta%20entrega", label: "Pronta entrega", public: true, surface: "commerce-shortcut" },
  { href: "/catalogo?intent=presentear", label: "Ideias de presente", public: true, surface: "commerce-shortcut" },
  { href: "/imagem-para-impressao-3d", label: "Enviar STL", public: true, surface: "commerce-shortcut" },
  { href: "/jogue", label: "Print Quest", public: true, surface: "commerce-shortcut" },
];

export const policyNavigationLinks: NavigationLink[] = [
  { href: "/comprar-na-mdh3d", label: "Como comprar", public: true, surface: "policy" },
  { href: "/politica-de-envio", label: "Politica de envio", public: true, surface: "policy" },
  { href: "/politica-de-troca", label: "Politica de troca", public: true, surface: "policy" },
  { href: "/politica-de-privacidade", label: "Privacidade", public: true, surface: "policy" },
  { href: "/termos-de-compra", label: "Termos de compra", public: true, surface: "policy" },
  { href: "/prazo-de-producao", label: "Prazo de producao", public: true, surface: "policy" },
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
  blog: "/blog",
  feeds: ["/feeds/google-shopping.xml", "/feeds/meta-catalog.csv", "/feeds/produtos.json", "/meta/catalog.csv"],
} as const;

export const permanentRedirects = [
  { from: "/home", to: "/", status: 308 },
] as const;
