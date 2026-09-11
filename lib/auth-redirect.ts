const CUSTOMER_DESTINATIONS = [
  "/conta",
  "/checkout",
  "/carrinho",
  "/catalogo",
  "/favoritos",
  "/orcamento",
  "/pedido",
  "/pedidos",
  "/produto",
];

export function sanitizeCustomerRedirect(value: string | null | undefined, fallback = "/conta") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://mdh3d.local");
    if (url.origin !== "https://mdh3d.local") return fallback;
    const allowed = CUSTOMER_DESTINATIONS.some(
      (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
    );
    return allowed ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}
