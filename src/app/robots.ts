import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/painel-mdh-85", "/admin", "/checkout", "/carrinho", "/acompanhar-pedido"]
    },
    sitemap: `${base}/sitemap.xml`
  };
}
