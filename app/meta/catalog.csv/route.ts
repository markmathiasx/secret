import { buildMetaCommerceCsv } from "@/lib/meta-commerce-feed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const csv = buildMetaCommerceCsv();

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
