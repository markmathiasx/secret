import { isOrderBlobConfigured, readSecureBlobJson, writeSecureBlobJson } from "@/lib/blob-store";
import { getProductUrl } from "@/lib/catalog";
import { getCatalogSnapshot } from "@/lib/catalog-repository";
import { categoryPageConfigs } from "@/lib/category-pages";
import { getSiteUrl } from "@/lib/env";
import { salesLandings } from "@/lib/sales-landings";

type AuditPageResult = {
  path: string;
  status: number;
  title: string | null;
  description: string | null;
  canonical: string | null;
  h1: string | null;
  jsonLdCount: number;
  hasFaqSchema: boolean;
  hasProductSchema: boolean;
  internalLinks: number;
  brokenInternalLinks: string[];
  missingAltImages: number;
  issues: string[];
  cwv?: {
    available: boolean;
    note?: string;
    performanceScore?: number;
    lcpMs?: number;
    cls?: number;
    inpMs?: number;
  };
};

export type SeoAuditReport = {
  generatedAt: string;
  baseUrl: string;
  summary: {
    pages: number;
    missingTitle: number;
    missingDescription: number;
    missingCanonical: number;
    missingSchema: number;
    missingFaqSchema: number;
    brokenLinks: number;
    missingAltImages: number;
    cwvChecks: number;
  };
  pages: AuditPageResult[];
};

const SEO_AUDIT_REPORT_PATH = "reports/seo-commercial-audit.json";

function extractMatch(html: string, expression: RegExp) {
  const match = html.match(expression);
  return match?.[1]?.replace(/\s+/g, " ").trim() || null;
}

function extractInternalLinks(html: string) {
  const matches = [...html.matchAll(/<a[^>]+href=["']([^"'#][^"']*)["']/gi)];
  return matches
    .map((match) => match[1])
    .filter((href) => href.startsWith("/"))
    .map((href) => href.split("#")[0]);
}

function extractJsonLdBlocks(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1]
  );
}

function countMissingAltImages(html: string) {
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  return imageTags.filter((tag) => {
    const alt = tag.match(/\balt=["']([^"']*)["']/i);
    return !alt || !alt[1]?.trim();
  }).length;
}

function getPageSpeedApiKey() {
  return (process.env.GOOGLE_PAGESPEED_API_KEY || process.env.PAGESPEED_API_KEY || "").trim();
}

async function getCwvSnapshot(url: string) {
  const key = getPageSpeedApiKey();
  if (!key) {
    return {
      available: false,
      note: "Defina GOOGLE_PAGESPEED_API_KEY para habilitar CWV via PageSpeed Insights.",
    };
  }

  const requestUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  requestUrl.searchParams.set("url", url);
  requestUrl.searchParams.set("category", "performance");
  requestUrl.searchParams.set("strategy", "mobile");
  requestUrl.searchParams.set("key", key);

  const response = await fetch(requestUrl.toString());
  if (!response.ok) {
    return {
      available: false,
      note: `Falha no PageSpeed (${response.status}).`,
    };
  }

  const payload = (await response.json()) as Record<string, any>;
  const loadingMetrics = payload.loadingExperience?.metrics || {};
  const performanceScore = payload.lighthouseResult?.categories?.performance?.score;

  return {
    available: true,
    performanceScore: typeof performanceScore === "number" ? Math.round(performanceScore * 100) : undefined,
    lcpMs: loadingMetrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
    cls: loadingMetrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile,
    inpMs: loadingMetrics.INTERACTION_TO_NEXT_PAINT?.percentile,
  };
}

export async function runCommercialSeoAudit(baseUrl = getSiteUrl()): Promise<SeoAuditReport> {
  const catalog = await getCatalogSnapshot();
  const landingPaths = Object.values(salesLandings).map((landing) => landing.slug);
  const categoryPaths = categoryPageConfigs.map((config) => `/catalogo/categoria/${config.slug}`);
  const productPaths = catalog.slice(0, 5).map((product) => getProductUrl(product));
  const priorityCwvPaths = new Set<string>([
    "/",
    "/catalogo",
    landingPaths[0],
    "/projetos-sob-medida-3d-rio-de-janeiro",
    productPaths[0],
  ]);

  const pagesToAudit = [
    "/",
    "/catalogo",
    ...landingPaths,
    ...categoryPaths,
    ...productPaths,
  ];

  const uniquePages = [...new Set(pagesToAudit.filter(Boolean))];
  const linkStatusCache = new Map<string, number>();

  async function getLinkStatus(path: string) {
    if (linkStatusCache.has(path)) {
      return linkStatusCache.get(path) || 0;
    }

    const response = await fetch(`${baseUrl}${path}`);
    linkStatusCache.set(path, response.status);
    return response.status;
  }

  const pages = await Promise.all(
    uniquePages.map(async (path) => {
      const response = await fetch(`${baseUrl}${path}`);
      const html = await response.text();
      const title = extractMatch(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
      const description = extractMatch(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const canonical = extractMatch(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
      const h1 = extractMatch(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const jsonLdBlocks = extractJsonLdBlocks(html);
      const internalLinks = [...new Set(extractInternalLinks(html))];
      const brokenLinkStatuses = await Promise.all(
        internalLinks.slice(0, 25).map(async (link) => ({
          link,
          status: await getLinkStatus(link),
        }))
      );
      const brokenInternalLinks = brokenLinkStatuses
        .filter((item) => item.status >= 400)
        .map((item) => `${item.link} (${item.status})`);
      const missingAltImages = countMissingAltImages(html);
      const hasFaqSchema = jsonLdBlocks.some((block) => /"@type"\s*:\s*"FAQPage"/i.test(block));
      const hasProductSchema = jsonLdBlocks.some((block) => /"@type"\s*:\s*"Product"/i.test(block));
      const issues = [
        !title ? "title ausente" : null,
        !description ? "meta description ausente" : null,
        !canonical ? "canonical ausente" : null,
        jsonLdBlocks.length === 0 ? "schema ausente" : null,
        brokenInternalLinks.length ? "links internos com erro" : null,
        missingAltImages > 0 ? "imagens sem alt" : null,
      ].filter(Boolean) as string[];

      return {
        path,
        status: response.status,
        title,
        description,
        canonical,
        h1,
        jsonLdCount: jsonLdBlocks.length,
        hasFaqSchema,
        hasProductSchema,
        internalLinks: internalLinks.length,
        brokenInternalLinks,
        missingAltImages,
        issues,
        cwv: priorityCwvPaths.has(path) ? await getCwvSnapshot(`${baseUrl}${path}`) : undefined,
      } satisfies AuditPageResult;
    })
  );

  return {
    generatedAt: new Date().toISOString(),
    baseUrl,
    summary: {
      pages: pages.length,
      missingTitle: pages.filter((page) => !page.title).length,
      missingDescription: pages.filter((page) => !page.description).length,
      missingCanonical: pages.filter((page) => !page.canonical).length,
      missingSchema: pages.filter((page) => page.jsonLdCount === 0).length,
      missingFaqSchema: pages.filter((page) => !page.hasFaqSchema && page.path !== "/").length,
      brokenLinks: pages.reduce((sum, page) => sum + page.brokenInternalLinks.length, 0),
      missingAltImages: pages.reduce((sum, page) => sum + page.missingAltImages, 0),
      cwvChecks: pages.filter((page) => page.cwv).length,
    },
    pages,
  };
}

export async function readStoredSeoAuditReport() {
  if (!isOrderBlobConfigured()) return null;
  return readSecureBlobJson<SeoAuditReport>(SEO_AUDIT_REPORT_PATH);
}

export async function persistSeoAuditReport(report: SeoAuditReport) {
  if (!isOrderBlobConfigured()) {
    return {
      stored: false,
      path: null,
    };
  }

  await writeSecureBlobJson(SEO_AUDIT_REPORT_PATH, report);
  return {
    stored: true,
    path: SEO_AUDIT_REPORT_PATH,
  };
}
