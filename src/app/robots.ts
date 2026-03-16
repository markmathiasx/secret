import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/painel-mdh-85", "/admin"]
    },
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
